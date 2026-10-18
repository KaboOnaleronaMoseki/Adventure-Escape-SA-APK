import { useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { ActionButton, Card, PageLayout, Section } from '@/components/SiteUI';
import { colors, spacing } from '@/constants/theme';

const faqs = [
  {
    question: 'How far in advance should I book?',
    answer:
      'Booking ahead is recommended, especially for weekends, school holidays, and group adventures. Contact us with your preferred date to check availability.',
  },
  {
    question: "What if I'm a complete beginner?",
    answer:
      'Many of our adventures welcome beginners. Your professional guide will provide an orientation and safety briefing before the activity.',
  },
  {
    question: 'Can children take part?',
    answer:
      'Age requirements vary by activity. Check the activity details and contact us if you are planning an adventure with children.',
  },
  {
    question: 'What happens if the weather is bad?',
    answer:
      'Guest safety comes first. If conditions are unsuitable, our team will discuss rescheduling or an alternative with you.',
  },
  {
    question: 'Can we have a private guide?',
    answer:
      'Ask our team about private guiding when you enquire, and we will discuss the options for your group and activity.',
  },
  {
    question: 'What if I have dietary restrictions?',
    answer:
      'Tell our team about dietary needs when you contact us so we can discuss suitable arrangements for your booking.',
  },
  {
    question: 'Can I take photographs during an activity?',
    answer:
      'Photography guidance can vary by activity and conditions. Your guide will let you know how to capture the experience safely.',
  },
  {
    question: 'Do you offer refunds or rescheduling?',
    answer:
      'Contact us as early as possible if plans change. Our team can explain the applicable booking and rescheduling options.',
  },
];

const subjects = [
  'Booking Question',
  'Group Event Inquiry',
  'Custom Package Request',
  'Feedback or Testimonial',
  'Other',
];

export default function ContactScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [groupSize, setGroupSize] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  async function openContact(url: string) {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Unable to open this link', 'Please contact us at hello@adventureescapesa.co.za.');
    }
  }

  function sendMessage() {
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      Alert.alert('Missing details', 'Please enter your name, email address, subject, and message.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert('Check your email', 'Enter a valid email address so we can reply to you.');
      return;
    }
    if (groupSize && (!Number.isInteger(Number(groupSize)) || Number(groupSize) < 1)) {
      Alert.alert('Check group size', 'Enter a whole-number group size of at least one.');
      return;
    }

    const emailSubject = encodeURIComponent(`${subject.trim()} - ${name.trim()}`);
    const body = encodeURIComponent(
      `${message.trim()}\n\nReply to: ${email.trim()}\nPhone: ${phone.trim() || 'Not provided'}\nGroup size: ${groupSize || 'Not provided'}`,
    );
    void openContact(
      `mailto:hello@adventureescapesa.co.za?subject=${emailSubject}&body=${body}`,
    );
  }

  return (
    <PageLayout
      eyebrow="We are here to help"
      title="Get in touch"
      intro="Have a question or ready to plan your next adventure? Reach out to our Western Cape team."
      image={require('../assets/site-images/guide-team.png')}
    >
      <Section eyebrow="Contact methods" title="Talk to our team">
        <Card title="Email us" body="hello@adventureescapesa.co.za" />
        <Card title="Call us" body="+27 21 000 0000" />
        <Card
          title="Visit us"
          body="Portion 11A of farm 433 Harkerville, Plettenberg Bay, 6604"
        />
        <Pressable
          onPress={() => void openContact('mailto:hello@adventureescapesa.co.za')}
          style={styles.contactButton}
          accessibilityRole="button"
        >
          <Text style={styles.contactButtonText}>Email Adventure Escape SA</Text>
        </Pressable>
        <Pressable
          onPress={() => void openContact('tel:+27210000000')}
          style={styles.contactButton}
          accessibilityRole="button"
        >
          <Text style={styles.contactButtonText}>Call Adventure Escape SA</Text>
        </Pressable>
      </Section>

      <Section eyebrow="Send us a message" title="Tell us about your plans">
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Your Name *"
          placeholderTextColor={colors.muted}
          autoComplete="name"
          style={styles.input}
          accessibilityLabel="Your name"
        />
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="Email Address *"
          placeholderTextColor={colors.muted}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          style={styles.input}
          accessibilityLabel="Email address"
        />
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="Phone Number (optional)"
          placeholderTextColor={colors.muted}
          keyboardType="phone-pad"
          style={styles.input}
          accessibilityLabel="Phone number (optional)"
        />
        <TextInput
          value={groupSize}
          onChangeText={setGroupSize}
          placeholder="Expected Group Size (optional)"
          placeholderTextColor={colors.muted}
          keyboardType="number-pad"
          style={styles.input}
          accessibilityLabel="Group size (optional)"
        />
        <Text style={styles.fieldLabel}>Subject *</Text>
        <View style={styles.subjectOptions}>
          {subjects.map((option) => (
            <Pressable
              key={option}
              onPress={() => setSubject(option)}
              style={[styles.subjectChip, subject === option && styles.subjectChipActive]}
              accessibilityRole="button"
              accessibilityState={{ selected: subject === option }}
            >
              <Text
                style={[
                  styles.subjectText,
                  subject === option && styles.subjectTextActive,
                ]}
              >
                {option}
              </Text>
            </Pressable>
          ))}
        </View>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Message *"
          placeholderTextColor={colors.muted}
          multiline
          textAlignVertical="top"
          style={[styles.input, styles.messageInput]}
          accessibilityLabel="Message"
        />
        <Pressable
          onPress={sendMessage}
          style={({ pressed }) => [styles.contactButton, pressed && styles.pressed]}
          accessibilityRole="button"
        >
          <Text style={styles.contactButtonText}>Send your message</Text>
        </Pressable>
      </Section>

      <Section eyebrow="Frequently asked questions" title="Before you go">
        {faqs.map((faq) => (
          <Card key={faq.question} title={faq.question} body={faq.answer} />
        ))}
      </Section>

      <Section title="Ready to book?">
        <ActionButton label="Calculate your fees" route="/fees" />
      </Section>

      <Section eyebrow="Follow our adventures" title="Find us on social">
        <View style={styles.socialRow}>
          {['Facebook', 'Instagram', 'YouTube'].map((network) => (
            <View key={network} style={styles.socialChip}>
              <Text style={styles.socialText}>{network}</Text>
            </View>
          ))}
        </View>
      </Section>
    </PageLayout>
  );
}

const styles = StyleSheet.create({
  input: {
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 13,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    color: colors.text,
    backgroundColor: colors.backgroundDark,
    fontSize: 14,
  },
  messageInput: { minHeight: 130 },
  fieldLabel: {
    marginBottom: spacing.sm,
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  subjectOptions: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md },
  subjectChip: {
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    backgroundColor: colors.backgroundDark,
  },
  subjectChipActive: { backgroundColor: colors.accent },
  subjectText: { color: colors.text, fontSize: 12, fontWeight: '700' },
  subjectTextActive: { color: colors.backgroundDark },
  socialRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  socialChip: {
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
  },
  socialText: { color: colors.accent, fontSize: 13, fontWeight: '700' },
  contactButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
    borderRadius: 999,
    backgroundColor: colors.accent,
  },
  pressed: { opacity: 0.8 },
  contactButtonText: {
    color: colors.backgroundDark,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
});
