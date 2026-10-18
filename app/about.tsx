import { ActionButton, BodyText, BulletList, Card, PageLayout, Section } from '@/components/SiteUI';
import { colors, spacing } from '@/constants/theme';
import { Linking, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';

const values = [
  {
    title: 'Our Mission',
    body: 'To provide professionally guided, eco-conscious outdoor adventures that inspire confidence, build community, and foster a lifelong appreciation for the natural beauty of the Western Cape.',
  },
  {
    title: 'Our Vision',
    body: 'To become a leading adventure tourism company in southern Africa, recognized for excellence in safety, environmental stewardship, and customer experience.',
  },
  {
    title: 'Safety First',
    body: 'Every decision prioritizes the wellbeing of our guests and guides through continuous investment in training, equipment inspection, and risk management.',
  },
  {
    title: 'Environmental Respect',
    body: 'We are committed to low-impact tourism that preserves the Western Cape’s unique fynbos, coastlines, and ecosystems.',
  },
  {
    title: 'Team Spirit',
    body: 'Experiences are designed to build confidence, communication, and lasting memories together.',
  },
  {
    title: 'Inclusive Adventures',
    body: 'Adventure is for everyone. Our experiences welcome participants of varying abilities and backgrounds, from beginners to experts.',
  },
];

export default function AboutScreen() {
  return (
    <PageLayout
      eyebrow="Our story"
      title="From passion to profession"
      intro="Meet the people and values behind Adventure Escape SA’s guided outdoor experiences in the Western Cape."
      image={require('../assets/site-images/team-campfire.png')}
    >
      <Section eyebrow="Our story" title="Outdoor adventures with purpose">
        <BodyText>
          Adventure Escape SA was founded in 2024 by Liam Daniels, an experienced outdoor guide
          with a deep love for the Western Cape’s natural landscapes. After years of guiding
          individuals and corporate groups, Liam set out to create a professional, sustainable
          adventure tourism company focused on safety, quality, and a genuine connection with
          nature.
        </BodyText>
        <BodyText>
          Starting with a small team of hand-selected guides, the company has grown intentionally,
          prioritising guide quality and customer satisfaction over rapid expansion.
        </BodyText>
      </Section>

      <Section eyebrow="Why we do this" title="Our mission and values">
        {values.map((value) => (
          <Card key={value.title} title={value.title} body={value.body} />
        ))}
      </Section>

      <Section eyebrow="Quick facts" title="Adventure Escape SA">
        <View style={styles.facts}>
          <Fact label="Founded" value="2024" />
          <Fact label="Professional guides" value="15+" />
          <Fact label="Activities offered" value="4 core adventures" />
          <Fact label="Operating region" value="Western Cape" />
          <Fact label="Guiding standards" value="FGASA & SAG" />
          <Fact label="Annual participants" value="500+" />
        </View>
      </Section>

      <Section eyebrow="Safety & expertise" title="We take safety seriously">
        <BodyText>
          Our guides undergo rigorous training, continuous professional development, and annual
          certifications to ensure every adventure meets high safety standards.
        </BodyText>
        <BulletList
          items={[
            'Certified, experienced guides with ongoing professional training.',
            'Equipment is regularly inspected, serviced, and certified.',
            'Risk assessments, activity briefings, and emergency protocols are reviewed and practiced.',
          ]}
        />
      </Section>

      <Section eyebrow="Find us" title="Visit Adventurers Escape HQ">
        <BodyText>
          Located in the heart of the Western Cape along South Africa&apos;s scenic Garden Route, our base camp is where gear briefings, safety checks, and expedition departures take place.
        </BodyText>

        <View style={styles.mapWrapper}>
          {Platform.OS === 'web' ? (
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3305.6877723285697!2d23.278560875905395!3d-34.05187942856498!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1e78e7637bf08227%3A0x4fe2349db28f5b7c!2sAdventurers%20Escape%20HQ!5e0!3m2!1sen!2sza!4v1792331528139!5m2!1sen!2sza"
              width="100%"
              height="340"
              style={{
                border: 0,
                width: '100%',
                height: 340,
                borderRadius: 14,
                display: 'block',
              }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              title="Adventurers Escape HQ Google Map"
            />
          ) : (
            <WebView
              source={{
                uri: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3305.6877723285697!2d23.278560875905395!3d-34.05187942856498!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x1e78e7637bf08227%3A0x4fe2349db28f5b7c!2sAdventurers%20Escape%20HQ!5e0!3m2!1sen!2sza!4v1792331528139!5m2!1sen!2sza',
              }}
              style={styles.webView}
              nestedScrollEnabled
              javaScriptEnabled
              domStorageEnabled
              startInLoadingState
              scalesPageToFit
            />
          )}
        </View>

        <View style={styles.addressCard}>
          <View style={styles.addressRow}>
            <Text style={styles.addressPinIcon}>📍</Text>
            <View style={styles.addressDetails}>
              <Text style={styles.addressBadge}>HEADQUARTERS & BASE CAMP</Text>
              <Text style={styles.addressTitle}>Adventurers Escape HQ</Text>
              <Text style={styles.addressText}>
                Portion 11A of farm 433 Harkerville, Plettenberg Bay, 6604
              </Text>
              <Text style={styles.addressRegion}>Western Cape, South Africa</Text>
            </View>
          </View>

          <Pressable
            onPress={() =>
              void Linking.openURL(
                'https://www.google.com/maps/search/?api=1&query=' +
                  encodeURIComponent(
                    'Adventurers Escape HQ Portion 11A of farm 433 Harkerville Plettenberg Bay 6604',
                  ),
              )
            }
            style={({ pressed }) => [
              styles.directionsButton,
              pressed && styles.directionsButtonPressed,
            ]}
            accessibilityRole="button"
          >
            <Text style={styles.directionsButtonText}>Get Directions in Google Maps  →</Text>
          </Pressable>
        </View>
      </Section>

      <Section title="Ready to explore with us?">
        <Text style={styles.closingText}>
          Choose a guided activity or build a custom escape for your group.
        </Text>
        <ActionButton label="Explore activities" route="/activities" />
      </Section>
    </PageLayout>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.fact}>
      <Text style={styles.factValue}>{value}</Text>
      <Text style={styles.factLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  facts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  fact: {
    flexGrow: 1,
    flexBasis: '45%',
    minHeight: 92,
    justifyContent: 'center',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  factValue: { color: colors.accent, fontSize: 22, fontWeight: '900' },
  factLabel: {
    marginTop: 4,
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  closingText: { color: colors.muted, fontSize: 15, lineHeight: 23 },
  mapWrapper: {
    marginTop: spacing.md,
    height: 340,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  webView: {
    flex: 1,
    height: 340,
    backgroundColor: colors.backgroundDark,
  },
  addressCard: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  addressRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
  },
  addressPinIcon: {
    fontSize: 24,
    lineHeight: 28,
  },
  addressDetails: {
    flex: 1,
  },
  addressBadge: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  addressTitle: {
    marginTop: 2,
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  addressText: {
    marginTop: 6,
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  addressRegion: {
    marginTop: 2,
    color: colors.muted,
    fontSize: 13,
  },
  directionsButton: {
    marginTop: spacing.md,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: colors.accent,
    alignItems: 'center',
  },
  directionsButtonPressed: {
    opacity: 0.85,
  },
  directionsButtonText: {
    color: colors.backgroundDark,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.4,
  },
});
