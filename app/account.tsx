import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PageLayout, Section } from '@/components/SiteUI';
import { colors, spacing } from '@/constants/theme';
import {
  clearAccountSession,
  readAccountSession,
  storeAccountSession,
  ClientAccount,
} from '@/services/accountClient';
import { supabase } from '@/services/supabaseClient';
import type { Booking } from '@/services/bookingValidation';

type AccountMode = 'register' | 'signIn';

function formatBookingDate(booking: Booking) {
  const date = (
    booking.activityDateTime ??
    booking.checkInDate ??
    booking.createdAt
  ).slice(0, 10);
  const parsedDate = new Date(`${date}T12:00:00Z`);
  if (Number.isNaN(parsedDate.getTime())) return date;
  return new Intl.DateTimeFormat('en-ZA', {
    dateStyle: 'medium',
    timeZone: 'Africa/Johannesburg',
  }).format(parsedDate);
}

export default function AccountScreen() {
  const [mode, setMode] = useState<AccountMode>('register');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [account, setAccount] = useState<ClientAccount | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [bookingsError, setBookingsError] = useState('');
  const [message, setMessage] = useState('');
  const [verificationPending, setVerificationPending] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    let active = true;
    async function restoreSession() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session?.user) {
          await clearAccountSession();
          return;
        }
        if (!active) return;

        const clientAccount: ClientAccount = {
          id: session.user.id,
          fullName: session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || '',
          email: session.user.email ?? '',
          phone: session.user.user_metadata?.phone,
          emailVerified: Boolean(session.user.email_confirmed_at),
        };
        setAccount(clientAccount);
        setFullName(clientAccount.fullName);
        setEmail(clientAccount.email);
        setPhone(clientAccount.phone ?? '');
        await storeAccountSession(session.access_token, clientAccount);
      } catch (error) {
        if (active) setMessage(error instanceof Error ? error.message : 'Unable to load account.');
      }
    }
    void restoreSession();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!account) return;

    let active = true;
    async function loadBookings() {
      setBookingsLoading(true);
      setBookingsError('');
      try {
        if (!account?.email) throw new Error('Sign in again to view your bookings.');
        const filter = account.id
          ? `user_id.eq.${account.id},email.ilike.${account.email}`
          : `email.ilike.${account.email}`;

        const { data, error } = await supabase
          .from('bookings')
          .select('*')
          .or(filter)
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Could not query bookings:', error.message);
          throw new Error('Unable to load your bookings.');
        }

        if (active) {
          const mapped: Booking[] = (data || []).map((row: any) => ({
            id: row.id,
            userId: row.user_id,
            customerName: row.customer_name,
            email: row.email,
            phone: row.phone,
            notes: row.notes,
            activityIds: row.activity_ids ?? [],
            activityQuantities: row.activity_quantities ?? {},
            activityDateTime: row.activity_date_time,
            accommodationIds: row.accommodation_ids ?? [],
            accommodationQuantities: row.accommodation_quantities ?? {},
            checkInDate: row.check_in_date,
            checkOutDate: row.check_out_date,
            status: row.status ?? 'pending',
            pricing: row.pricing ?? (typeof row.total_price === 'number' ? { total: row.total_price } : undefined),
            createdAt: row.created_at,
          }));
          setBookings(mapped);
        }
      } catch (error) {
        if (active) {
          setBookingsError(
            error instanceof Error ? error.message : 'Unable to load your bookings.',
          );
        }
      } finally {
        if (active) setBookingsLoading(false);
      }
    }

    void loadBookings();
    return () => {
      active = false;
    };
  }, [account]);

  async function register() {
    if (password.length < 8) {
      setMessage('Choose a password with at least 8 characters.');
      return;
    }
    if (password.length > 128) {
      setMessage('Your password must be 128 characters or fewer.');
      return;
    }
    setIsBusy(true);
    setMessage('');
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
          },
        },
      });

      if (error) {
        setMessage(error.message);
        return;
      }

      if (data.session && data.user) {
        const clientAccount: ClientAccount = {
          id: data.user.id,
          fullName: fullName.trim(),
          email: data.user.email ?? email.trim(),
          phone: phone.trim(),
          emailVerified: true,
        };
        setAccount(clientAccount);
        await storeAccountSession(data.session.access_token, clientAccount);
        setMessage('Account created and signed in successfully!');
        setPassword('');
        return;
      }

      setMode('signIn');
      setVerificationPending(true);
      setMessage('Account created! Please check your email to verify your address, then sign in.');
      setPassword('');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to reach the account service.');
    } finally {
      setIsBusy(false);
    }
  }

  async function signIn() {
    setIsBusy(true);
    setMessage('');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        if (error.message.toLowerCase().includes('email not confirmed')) {
          setVerificationPending(true);
        }
        setMessage(error.message);
        return;
      }

      if (!data.user || !data.session) {
        setMessage('Unable to sign in. Please verify your credentials.');
        return;
      }

      const clientAccount: ClientAccount = {
        id: data.user.id,
        fullName: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || '',
        email: data.user.email ?? email.trim(),
        phone: data.user.user_metadata?.phone,
        emailVerified: Boolean(data.user.email_confirmed_at),
      };

      await storeAccountSession(data.session.access_token, clientAccount);
      setAccount(clientAccount);
      setFullName(clientAccount.fullName);
      setPhone(clientAccount.phone ?? '');
      setPassword('');
      setMessage(`Signed in as ${clientAccount.email}.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to reach the account service.');
    } finally {
      setIsBusy(false);
    }
  }

  async function resendVerification() {
    setIsBusy(true);
    setMessage('');
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      });
      if (error) {
        setMessage(error.message);
      } else {
        setMessage('Verification email resent. Please check your inbox.');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to reach the account service.');
    } finally {
      setIsBusy(false);
    }
  }

  async function signOut() {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      Alert.alert(
        'Signed out',
        error instanceof Error ? error.message : 'Session cleared.',
      );
    } finally {
      await clearAccountSession();
      setAccount(null);
      setBookings([]);
      setBookingsError('');
      setBookingsLoading(false);
      setMessage('You have signed out.');
    }
  }

  return (
    <PageLayout
      eyebrow="Client account"
      title="Your Adventure Escape account"
      intro="Create a free account to save your details and easily request adventure bookings."
      image={require('../assets/site-images/hero-landscape.png')}
    >
      <Section eyebrow="Secure access" title={account ? 'Account details' : mode === 'register' ? 'Create your account' : 'Sign in'}>
        {account ? (
          <View style={styles.card}>
            <Text style={styles.accountName}>{account.fullName}</Text>
            <Text style={styles.detail}>{account.email}</Text>
            {account.phone ? <Text style={styles.detail}>{account.phone}</Text> : null}
            <Text style={styles.status}>Email verified</Text>
            <Pressable style={styles.secondaryButton} onPress={() => void signOut()}>
              <Text style={styles.buttonText}>Sign out</Text>
            </Pressable>
          </View>
        ) : (
          <>
            {mode === 'register' ? (
              <>
                <TextInput
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Full name"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  autoComplete="name"
                  accessibilityLabel="Full name"
                />
                <TextInput
                  value={phone}
                  onChangeText={setPhone}
                  placeholder="Phone number (optional)"
                  placeholderTextColor={colors.muted}
                  style={styles.input}
                  keyboardType="phone-pad"
                  accessibilityLabel="Phone number (optional)"
                />
              </>
            ) : null}
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email address"
              placeholderTextColor={colors.muted}
              style={styles.input}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              accessibilityLabel="Email address"
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder={mode === 'register' ? 'Password (at least 8 characters)' : 'Password'}
              placeholderTextColor={colors.muted}
              style={styles.input}
              secureTextEntry
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              accessibilityLabel="Password"
            />
            {mode === 'register' ? (
              <Text style={styles.note}>
                Your name, email, and optional phone are stored securely in Supabase. Passwords are encrypted and never emailed.
              </Text>
            ) : null}
            {message ? <Text accessibilityLiveRegion="polite" style={styles.message}>{message}</Text> : null}
            <Pressable
              style={[styles.primaryButton, isBusy && styles.disabledButton]}
              onPress={() => void (mode === 'register' ? register() : signIn())}
              disabled={isBusy}
              accessibilityRole="button"
              accessibilityState={{ disabled: isBusy, busy: isBusy }}
            >
              <Text style={styles.buttonText}>
                {isBusy ? 'Please wait...' : mode === 'register' ? 'Create account' : 'Sign in'}
              </Text>
            </Pressable>
            {verificationPending || mode === 'signIn' ? (
              <Pressable
                style={styles.textButton}
                onPress={() => void resendVerification()}
                disabled={isBusy || !email.trim()}
              >
                <Text style={styles.linkText}>Resend verification email</Text>
              </Pressable>
            ) : null}
            <Pressable
              style={styles.textButton}
              onPress={() => {
                setMode(mode === 'register' ? 'signIn' : 'register');
                setMessage('');
              }}
              disabled={isBusy}
            >
              <Text style={styles.linkText}>
                {mode === 'register' ? 'Already have an account? Sign in' : 'New here? Create an account'}
              </Text>
            </Pressable>
          </>
        )}
      </Section>
      {account ? (
        <Section eyebrow="Booking history" title="Your bookings">
          {bookingsLoading ? (
            <Text style={styles.detail}>Loading your bookings...</Text>
          ) : bookingsError ? (
            <Text accessibilityLiveRegion="polite" style={styles.message}>
              {bookingsError}
            </Text>
          ) : bookings.length ? (
            bookings.map((booking) => {
              const items = [
                ...(booking.activityIds ?? []),
                ...(booking.accommodationIds ?? []),
              ];
              return (
                <View key={booking.id} style={[styles.card, styles.bookingCard]}>
                  <Text style={styles.accountName}>
                    {items.length ? items.join(', ') : 'Adventure booking'}
                  </Text>
                  <Text style={styles.detail}>Date: {formatBookingDate(booking)}</Text>
                  <Text style={styles.detail}>Status: {booking.status}</Text>
                  {booking.pricing ? (
                    <Text style={styles.detail}>
                      Estimated total: R{booking.pricing.total.toLocaleString('en-ZA')}
                    </Text>
                  ) : null}
                  <Text style={styles.bookingReference}>Reference: {booking.id}</Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.detail}>You haven't made any bookings yet.</Text>
          )}
        </Section>
      ) : null}
    </PageLayout>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundDark,
    borderColor: colors.border,
    borderRadius: 16,
    borderWidth: 1,
    padding: spacing.lg,
  },
  accountName: { color: colors.text, fontSize: 22, fontWeight: '700', marginBottom: spacing.sm },
  bookingCard: { marginBottom: spacing.md },
  bookingReference: { color: colors.muted, fontSize: 12, marginTop: spacing.xs },
  detail: { color: colors.muted, fontSize: 16, marginBottom: spacing.xs },
  status: { color: '#B6E3BD', fontSize: 14, fontWeight: '700', marginVertical: spacing.md },
  input: {
    backgroundColor: colors.backgroundDark,
    borderColor: colors.border,
    borderRadius: 12,
    borderWidth: 1,
    color: colors.text,
    fontSize: 16,
    marginBottom: spacing.md,
    minHeight: 52,
    paddingHorizontal: spacing.md,
  },
  note: { color: colors.muted, fontSize: 14, lineHeight: 21, marginBottom: spacing.md },
  message: { color: colors.accent, fontSize: 14, lineHeight: 21, marginBottom: spacing.md },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.accent,
    borderRadius: 999,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: spacing.lg,
  },
  secondaryButton: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 999,
    justifyContent: 'center',
    marginTop: spacing.sm,
    minHeight: 48,
  },
  disabledButton: { opacity: 0.6 },
  textButton: { alignItems: 'center', justifyContent: 'center', marginTop: spacing.md, minHeight: 44 },
  buttonText: { color: colors.text, fontSize: 16, fontWeight: '700' },
  linkText: { color: colors.accent, fontSize: 15, fontWeight: '600' },
});