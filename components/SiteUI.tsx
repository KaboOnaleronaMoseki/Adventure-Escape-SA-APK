import { Href, router, usePathname } from 'expo-router';
import Head from 'expo-router/head';
import { ReactNode, useState } from 'react';
import {
  Image,
  ImageBackground,
  ImageSourcePropType,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { colors, spacing } from '@/constants/theme';

const navigationGroups: { title: string; items: { label: string; route: Href; action?: boolean }[] }[] = [
  {
    title: 'Discover',
    items: [
      { label: 'Home', route: '/home' },
      { label: 'About Us', route: '/about' },
      { label: 'Activities', route: '/activities' },
      { label: 'Packages', route: '/packages' },
      { label: 'Destinations', route: '/destinations' },
      { label: 'Gallery', route: '/gallery' },
    ],
  },
  {
    title: 'Plan your escape',
    items: [
      { label: 'Accommodation', route: '/accommodation' },
      { label: 'Safety', route: '/safety' },
      { label: 'Client Account', route: '/account' },
      { label: 'Calculate Fees', route: '/fees' },
      { label: 'Contact', route: '/contact' },
      { label: 'Book Now', route: '/fees', action: true },
    ],
  },
];

type PageLayoutProps = {
  eyebrow: string;
  title: string;
  intro: string;
  image: ImageSourcePropType;
  children: ReactNode;
};

export function PageLayout({
  eyebrow,
  title,
  intro,
  image,
  children,
}: PageLayoutProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Head>
        <title>{`${title} | Adventure Escape SA`}</title>
        <meta
          name="description"
          content={intro}
        />
      </Head>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.pageContent}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Pressable style={styles.brand} onPress={() => router.push('/home')}>
              <Image
                source={require('../assets/site-images/logo.png')}
                style={styles.logo}
                resizeMode="contain"
                accessibilityLabel="Adventure Escape SA"
              />
              <View style={styles.brandCopy}>
                <Text style={styles.brandTitle}>ADVENTURE ESCAPE SA</Text>
                <Text style={styles.brandCaption}>WESTERN CAPE, SOUTH AFRICA</Text>
              </View>
            </Pressable>
            <Pressable
              onPress={() => setMenuOpen((open) => !open)}
              style={({ pressed }) => [
                styles.menuToggle,
                menuOpen && styles.menuToggleActive,
                pressed && styles.menuTogglePressed,
              ]}
              accessibilityRole="button"
              accessibilityLabel={menuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              accessibilityState={{ expanded: menuOpen }}
            >
              <Text style={styles.menuToggleText}>{menuOpen ? 'CLOSE' : 'MENU'}</Text>
              <Text style={styles.menuToggleIcon}>{menuOpen ? '×' : '☰'}</Text>
            </Pressable>
          </View>
          {menuOpen ? (
            <View style={styles.megaMenu} accessibilityLabel="Main navigation">
              <Text style={styles.menuEyebrow}>Adventure Escape SA  ·  Explore all pages</Text>
              <View style={styles.menuGroups}>
                {navigationGroups.map((group) => (
                  <View key={group.title} style={styles.menuGroup}>
                    <Text style={styles.menuGroupTitle}>{group.title}</Text>
                    {group.items.map((item) => {
                      const active = !item.action && pathname === String(item.route);
                      return (
                        <Pressable
                          key={item.label}
                          onPress={() => {
                            setMenuOpen(false);
                            if (!active) router.push(item.route);
                          }}
                          style={({ pressed }) => [
                            styles.menuLink,
                            active && styles.menuLinkActive,
                            item.action && styles.menuLinkCta,
                            pressed && styles.menuLinkPressed,
                          ]}
                          accessibilityRole="link"
                          accessibilityState={{ selected: active }}
                        >
                          <Text
                            style={[
                              styles.menuLinkLabel,
                              active && styles.menuLinkLabelActive,
                              item.action && styles.menuLinkCtaLabel,
                            ]}
                          >
                            {item.label}
                          </Text>
                          {item.action ? <Text style={styles.menuLinkArrow}>›</Text> : null}
                        </Pressable>
                      );
                    })}
                  </View>
                ))}
              </View>
            </View>
          ) : null}
        </View>

        <ImageBackground source={image} style={styles.hero} imageStyle={styles.heroImage}>
          <View style={styles.heroShade}>
            <Text style={styles.eyebrow}>{eyebrow}</Text>
            <Text style={styles.pageTitle}>{title}</Text>
            <Text style={styles.heroIntro}>{intro}</Text>
          </View>
        </ImageBackground>

        <View style={styles.body}>{children}</View>

        <View style={styles.footer}>
          <Image
            source={require('../assets/site-images/logo.png')}
            style={styles.footerLogo}
            resizeMode="contain"
          />
          <Text style={styles.footerTitle}>Adventure Escape SA</Text>
          <Text style={styles.footerText}>
            Guided outdoor adventures and eco-tourism across the Western Cape.
          </Text>
          <Text style={styles.footerCopyright}>© 2026 Adventure Escape SA</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function Section({
  eyebrow,
  title,
  children,
}: {
  eyebrow?: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      {eyebrow ? <Text style={styles.sectionEyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

export function Card({
  title,
  body,
  image,
  imageDescription,
  meta,
  action,
}: {
  title: string;
  body: string;
  image?: ImageSourcePropType;
  imageDescription?: string;
  meta?: string;
  action?: { label: string; route: Href };
}) {
  return (
    <View style={styles.card}>
      {image ? (
        <Image
          source={image}
          style={styles.cardImage}
          resizeMode="cover"
          accessible={Boolean(imageDescription)}
          accessibilityLabel={imageDescription}
        />
      ) : null}
      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{title}</Text>
        {meta ? <Text style={styles.cardMeta}>{meta}</Text> : null}
        <Text style={styles.cardText}>{body}</Text>
        {action ? (
          <Pressable
            onPress={() => router.push(action.route)}
            style={styles.textAction}
            accessibilityRole="link"
          >
            <Text style={styles.textActionLabel}>{action.label}  ›</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

export function ActionButton({
  label,
  route,
}: {
  label: string;
  route: Href;
}) {
  return (
    <Pressable
      onPress={() => router.push(route)}
      style={({ pressed }) => [styles.actionButton, pressed && styles.actionButtonPressed]}
      accessibilityRole="link"
    >
      <Text style={styles.actionButtonLabel}>{label}  ›</Text>
    </Pressable>
  );
}

export function BulletList({ items }: { items: string[] }) {
  return (
    <View style={styles.bulletList}>
      {items.map((item) => (
        <View key={item} style={styles.bulletRow}>
          <Text style={styles.bullet}>✦</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export function BodyText({ children }: { children: string }) {
  return <Text style={styles.bodyText}>{children}</Text>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.backgroundDark },
  pageContent: { flexGrow: 1, backgroundColor: colors.background },
  header: {
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    backgroundColor: colors.backgroundDark,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTop: {
    minHeight: 58,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  brand: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  brandCopy: { flexShrink: 1 },
  logo: { width: 52, height: 52 },
  brandTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 1,
  },
  brandCaption: {
    marginTop: 2,
    color: colors.accent,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  menuToggle: {
    minHeight: 42,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'rgba(222,158,72,0.08)',
  },
  menuToggleActive: { backgroundColor: 'rgba(222,158,72,0.18)' },
  menuTogglePressed: { opacity: 0.78 },
  menuToggleText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  menuToggleIcon: { color: colors.accent, fontSize: 19, fontWeight: '700' },
  megaMenu: {
    marginTop: spacing.md,
    marginHorizontal: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    backgroundColor: colors.surface,
  },
  menuEyebrow: {
    marginBottom: spacing.md,
    color: colors.accent,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  menuGroups: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  menuGroup: { flexGrow: 1, flexBasis: 180 },
  menuGroupTitle: {
    marginBottom: spacing.xs,
    color: colors.text,
    fontSize: 14,
    fontWeight: '900',
  },
  menuLink: {
    minHeight: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    paddingHorizontal: 10,
    borderRadius: 9,
  },
  menuLinkActive: { backgroundColor: 'rgba(222,158,72,0.14)' },
  menuLinkCta: { marginTop: spacing.xs, backgroundColor: colors.accent },
  menuLinkPressed: { opacity: 0.76 },
  menuLinkLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  menuLinkLabelActive: { color: colors.accent },
  menuLinkCtaLabel: { color: colors.backgroundDark, fontWeight: '900' },
  menuLinkArrow: { color: colors.backgroundDark, fontSize: 20, fontWeight: '900' },
  hero: { minHeight: 300, justifyContent: 'flex-end', overflow: 'hidden' },
  heroImage: {
    width: '100%',
    height: '100%',
    maxWidth: '100%',
    maxHeight: '100%',
    opacity: 0.88,
  },
  heroShade: {
    paddingHorizontal: spacing.lg,
    paddingTop: 54,
    paddingBottom: spacing.xl,
    backgroundColor: 'rgba(30,24,25,0.64)',
  },
  eyebrow: {
    marginBottom: spacing.sm,
    color: colors.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  pageTitle: {
    color: colors.text,
    fontSize: 42,
    fontWeight: '900',
    lineHeight: 46,
  },
  heroIntro: {
    marginTop: spacing.md,
    color: colors.text,
    fontSize: 15,
    lineHeight: 24,
  },
  body: {
    width: '100%',
    maxWidth: 1120,
    alignSelf: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  section: { paddingTop: spacing.xl },
  sectionEyebrow: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  sectionTitle: {
    marginTop: 4,
    marginBottom: spacing.md,
    color: colors.text,
    fontSize: 27,
    fontWeight: '900',
    lineHeight: 33,
  },
  card: {
    marginBottom: spacing.md,
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  cardImage: { width: '100%', height: 190, backgroundColor: colors.backgroundDark },
  cardBody: { padding: spacing.md },
  cardTitle: { color: colors.text, fontSize: 21, fontWeight: '800' },
  cardMeta: {
    marginTop: 5,
    marginBottom: 8,
    color: colors.accent,
    fontSize: 13,
    fontWeight: '700',
  },
  cardText: { marginTop: 8, color: colors.muted, fontSize: 14, lineHeight: 22 },
  textAction: { alignSelf: 'flex-start', marginTop: spacing.md },
  textActionLabel: {
    color: colors.accent,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  actionButton: {
    alignSelf: 'flex-start',
    marginTop: spacing.md,
    paddingVertical: 13,
    paddingHorizontal: 19,
    borderRadius: 999,
    backgroundColor: colors.accent,
  },
  actionButtonPressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  actionButtonLabel: {
    color: colors.backgroundDark,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  bodyText: {
    marginBottom: spacing.md,
    color: colors.muted,
    fontSize: 15,
    lineHeight: 24,
  },
  bulletList: { gap: 12 },
  bulletRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  bullet: { color: colors.accent, fontSize: 14, lineHeight: 22 },
  bulletText: { flex: 1, color: colors.muted, fontSize: 14, lineHeight: 22 },
  footer: {
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.backgroundDark,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  footerLogo: { width: 58, height: 58, marginBottom: spacing.sm },
  footerTitle: { color: colors.text, fontSize: 16, fontWeight: '800' },
  footerText: {
    maxWidth: 300,
    marginTop: spacing.xs,
    color: colors.muted,
    fontSize: 12,
    lineHeight: 19,
    textAlign: 'center',
  },
  footerCopyright: { marginTop: spacing.md, color: colors.accent, fontSize: 11 },
});
