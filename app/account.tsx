import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { PageLayout, Section } from '@/components/SiteUI';
import { colors, spacing } from '@/constants/theme';
import {
  AccountApiResponse,
  clearAccountSession,
  readAccountSession,
  requestAccountApi,
  storeAccountSession,
  ClientAccount,
} from '@/services/accountClient';

type AccountMode = 'register' | 'signIn';

function responseMessage(body: AccountApiResponse, fallback: string) {
  return body.error || body.message || fallback;
}

export default function AccountScreen() {
  const [mode, setMode] = useState<AccountMode>('register');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [account, setAccount] = useState<ClientAccount | null>(null);
  const [message, setMessage] = useState('');
  const [verificationPending, setVerificationPending] = useState(false);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    let active = true;
    async function restoreSession() {
      try {
        const token = await readAccountSession();
        if (!token) return;
        const { response, body } = await requestAccountApi('/account-session', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!active) return;
        if (response.ok && body.account) {
          setAccount(body.account);
          setFullName(body.account.fullName);
          setEmail(body.account.email);
          setPhone(body.account.phone ?? '');
        } else {
          await clearAccountSession();
        }
      } catch (error) {
        if (active) setMessage(error instanceof Error ? error.message : 'Unable to load account.');
      }
    }
    void restoreSession();
    return () => {
      active = false;
    };
  }, []);

  async function register() {
    if (password.length < 12) {
      setMessage('Choose a password with at least 12 characters.');
      return;
    }
    if (password.length > 128) {
      setMessage('Your password must be 128 characters or fewer.');
      return;
    }
    setIsBusy(true);
    setMessage('');
    try {
      const { response, body } = await requestAccountApi('/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, phone, password }),
      });
      if (!response.ok) {
        setMessage(responseMessage(body, 'Unable to create your account.'));
        return;
      }
      setMode('signIn');
      setVerificationPending(true);
      setMessage(responseMessage(body, 'Account created. Check your email to verify it.'));
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
      const { response, body } = await requestAccountApi('/account-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!response.ok || !body.account || !body.token) {
        if (body.code === 'email_not_verified') setVerificationPending(true);
        setMessage(responseMessage(body, 'Unable to sign in.'));
        return;
      }
      await storeAccountSession(body.token, body.account);
      setAccount(body.account);
      setFullName(body.account.fullName);
      setPhone(body.account.phone ?? '');
      setPassword('');
      setMessage(`Signed in as ${body.account.email}.`);
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
      const { response, body } = await requestAccountApi('/account-verification', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setMessage(
        response.ok
          ? responseMessage(body, 'If the account exists, a verification email has been sent.')
          : responseMessage(body, 'Unable to request a verification email.'),
      );
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to reach the account service.');
    } finally {
      setIsBusy(false);
    }
  }

  async function signOut() {
    const token = await readAccountSession();
    try {
      if (token) {
        await requestAccountApi('/account-session', {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch (error) {
      Alert.alert(
        'Signed out on this device',
        error instanceof Error ? error.message : 'The server could not revoke the session.',
      );
    } finally {
      await clearAccountSession();
      setAccount(null);
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
              placeholder={mode === 'register' ? 'Password (at least 12 characters)' : 'Password'}
              placeholderTextColor={colors.muted}
              style={styles.input}
              secureTextEntry
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              accessibilityLabel="Password"
            />
            {mode === 'register' ? (
              <Text style={styles.note}>
                Your account is stored securely on our server. Verify your email before signing in.
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
                {isBusy ? 'Please wait…' : mode === 'register' ? 'Create account' : 'Sign in'}
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
  disabledButton: { opacity: 0.55 },
  buttonText: { color: colors.backgroundDark, fontSize: 16, fontWeight: '700' },
  textButton: { alignItems: 'center', minHeight: 44, justifyContent: 'center', marginTop: spacing.sm },
  linkText: { color: colors.accent, fontSize: 14, fontWeight: '600', textAlign: 'center' },
});
