import React, { useEffect, useRef } from 'react';
import {
  Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View, StatusBar,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../app/navigation/types';
import { Icon } from '../../../shared/components/Icon';
import { colors, spacing, typography, radius } from '../../../shared/theme';

type Props = { navigation: NativeStackNavigationProp<AuthStackParamList, 'Welcome'> };

const { height } = Dimensions.get('window');

const FEATURES = [
  { icon: 'pill',           label: 'Medicines' },
  { icon: 'calendar-heart', label: 'Health' },
  { icon: 'shield-check',   label: 'Assets' },
  { icon: 'bell-ring',      label: 'Reminders' },
  { icon: 'folder',         label: 'Vault' },
  { icon: 'car',            label: 'Vehicles' },
];

function useStagger(count: number, delay = 80) {
  const anims = useRef(Array.from({ length: count }, () => new Animated.Value(0))).current;
  useEffect(() => {
    Animated.stagger(delay, anims.map((a) =>
      Animated.spring(a, { toValue: 1, tension: 80, friction: 10, useNativeDriver: true }),
    )).start();
  }, []);
  return anims;
}

export default function WelcomeScreen({ navigation }: Props) {
  const heroFade   = useRef(new Animated.Value(0)).current;
  const heroSlide  = useRef(new Animated.Value(32)).current;
  const pillsAnim  = useRef(new Animated.Value(0)).current;
  const ctaAnim    = useRef(new Animated.Value(0)).current;
  const pulseAnim  = useRef(new Animated.Value(1)).current;
  const featureAnims = useStagger(FEATURES.length, 70);

  useEffect(() => {
    // Hero entrance
    Animated.parallel([
      Animated.timing(heroFade,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(heroSlide, { toValue: 0, tension: 70, friction: 12, useNativeDriver: true }),
    ]).start();

    // Pills + CTA delayed
    setTimeout(() => {
      Animated.timing(pillsAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 400);
    setTimeout(() => {
      Animated.timing(ctaAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    }, 600);

    // Pulse on logo
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.06, duration: 1800, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 1800, useNativeDriver: true }),
      ]),
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      {/* Decorative top wave */}
      <View style={styles.heroBackground}>
        <View style={styles.heroCircle1} />
        <View style={styles.heroCircle2} />
      </View>

      {/* Logo + headline */}
      <Animated.View style={[styles.heroSection, { opacity: heroFade, transform: [{ translateY: heroSlide }] }]}>
        <Animated.View style={[styles.logoWrap, { transform: [{ scale: pulseAnim }] }]}>
          <View style={styles.logoOuter}>
            <View style={styles.logoInner}>
              <Icon name="shield-half-full" size={34} color={colors.white} />
            </View>
          </View>
        </Animated.View>
        <Text style={styles.appName}>LifeVault</Text>
        <Text style={styles.tagline}>Never forget an important{'\n'}life responsibility again.</Text>
      </Animated.View>

      {/* Feature pills */}
      <Animated.View style={[styles.pillsSection, { opacity: pillsAnim }]}>
        <View style={styles.pillsGrid}>
          {FEATURES.map((f, i) => (
            <Animated.View
              key={f.label}
              style={[
                styles.pill,
                {
                  opacity: featureAnims[i],
                  transform: [{
                    scale: featureAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0.8, 1] }),
                  }],
                },
              ]}
            >
              <Icon name={f.icon} size={15} color={colors.primary} />
              <Text style={styles.pillLabel}>{f.label}</Text>
            </Animated.View>
          ))}
        </View>
      </Animated.View>

      {/* CTA */}
      <Animated.View style={[styles.ctaSection, { opacity: ctaAnim }]}>
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate('Register')}
          activeOpacity={0.85}
        >
          <Text style={styles.primaryBtnText}>Get Started</Text>
          <Icon name="arrow-right" size={20} color={colors.white} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={() => navigation.navigate('Login')}
          activeOpacity={0.7}
        >
          <Text style={styles.secondaryBtnText}>Already have an account? </Text>
          <Text style={styles.secondaryBtnLink}>Sign in</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.xl,
  },

  // Decorative background
  heroBackground: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: height * 0.42,
    backgroundColor: colors.primary,
    overflow: 'hidden',
  },
  heroCircle1: {
    position: 'absolute',
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: 'rgba(255,255,255,0.07)',
    top: -80, right: -60,
  },
  heroCircle2: {
    position: 'absolute',
    width: 200, height: 200, borderRadius: 100,
    backgroundColor: 'rgba(255,255,255,0.05)',
    bottom: -40, left: -40,
  },

  // Hero
  heroSection: {
    alignItems: 'center',
    paddingTop: height * 0.1,
    paddingBottom: spacing.xxl,
    width: '100%',
  },
  logoWrap: { marginBottom: spacing.lg },
  logoOuter: {
    width: 90, height: 90, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.35)',
  },
  logoInner: {
    width: 68, height: 68, borderRadius: 20,
    backgroundColor: colors.primaryDark,
    alignItems: 'center', justifyContent: 'center',
  },
  appName: {
    fontSize: 38,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: -1,
    marginBottom: spacing.sm,
  },
  tagline: {
    ...typography.body,
    color: 'rgba(255,255,255,0.80)',
    textAlign: 'center',
    lineHeight: 24,
  },

  // Pills
  pillsSection: { width: '100%', paddingHorizontal: spacing.lg },
  pillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...{
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
      elevation: 2,
    },
  },
  pillLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text,
  },

  // CTA
  ctaSection: {
    width: '100%',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  primaryBtn: {
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    paddingVertical: 17,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 14,
    elevation: 7,
  },
  primaryBtnText: { ...typography.button, color: colors.white, fontSize: 16 },
  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: { ...typography.body, color: colors.textSecondary },
  secondaryBtnLink: { ...typography.body, color: colors.primary, fontWeight: '700' },
});
