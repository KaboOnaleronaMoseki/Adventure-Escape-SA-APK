import { router } from 'expo-router';
import Head from 'expo-router/head';
import { Image, ImageBackground, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';

import { colors, spacing } from '@/constants/theme';

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <Head>
        <title>Adventure Escape SA | Your next great escape</title>
        <meta
          name="description"
          content="Guided outdoor adventures and eco-tourism in the Western Cape, South Africa."
        />
      </Head>
      <StatusBar style="light" />
      <ImageBackground
        source={require('../assets/site-images/hero-landscape.png')}
        resizeMode="cover"
        style={styles.background}
        imageStyle={styles.backgroundImage}
      >
        <View style={styles.shade}>
          <View style={styles.content}>
            <Image
              source={require('../assets/site-images/logo.png')}
              style={styles.logo}
              resizeMode="contain"
              accessibilityLabel="Adventure Escape SA"
            />
            <Text style={styles.eyebrow}>Western Cape, South Africa</Text>
            <Text style={styles.title}>Adventure begins{'\n'}where ordinary ends.</Text>
            <Text style={styles.caption}>Your next great escape is waiting.</Text>
            <Pressable
              onPress={() => router.push('/home')}
              style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
              accessibilityRole="button"
            >
              <Text style={styles.buttonText}>Enter the adventure  →</Text>
            </Pressable>
          </View>
          <Text style={styles.footer}>GUIDED OUTDOOR ADVENTURES  •  SINCE 2024</Text>
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.backgroundDark },
  background: { flex: 1, justifyContent: 'center' },
  backgroundImage: { width: '100%', height: '100%' },
  shade: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: 'rgba(36,29,30,0.57)',
  },
  content: { width: '100%', maxWidth: 680, alignItems: 'center' },
  logo: { width: 112, height: 112, marginBottom: spacing.md },
  eyebrow: {
    marginBottom: spacing.md,
    color: colors.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 2.5,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  title: {
    color: colors.text,
    fontSize: 48,
    fontWeight: '900',
    lineHeight: 51,
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.45)',
    textShadowRadius: 20,
  },
  caption: {
    marginTop: spacing.lg,
    color: 'rgba(255,255,255,0.9)',
    fontSize: 17,
    textAlign: 'center',
  },
  button: {
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    paddingVertical: 15,
    borderRadius: 999,
    backgroundColor: colors.accent,
  },
  buttonPressed: { opacity: 0.8, transform: [{ scale: 0.98 }] },
  buttonText: {
    color: colors.backgroundDark,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  footer: {
    position: 'absolute',
    bottom: spacing.md,
    color: 'rgba(255,255,255,0.75)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
});
