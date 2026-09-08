import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Sprout,
  ShieldCheck,
  Zap,
  TrendingUp,
  ArrowRight,
  User,
  Building2,
  Sparkles,
  Scale,
} from 'lucide-react-native';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SecondaryButton } from '../../components/common/SecondaryButton';
import { mockStore } from '../../store/mockStore';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();

  const handleQuickEnterFarmer = () => {
    mockStore.setRole('FARMER');
    navigation.navigate('FarmerRoot');
  };

  const handleQuickEnterBuyer = () => {
    mockStore.setRole('BUYER');
    navigation.navigate('BuyerRoot');
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Brand Header */}
        <View style={styles.heroSection}>
          <View style={styles.brandBadge}>
            <Sprout size={18} color={colors.primary} />
            <Text style={styles.brandBadgeText}>AGRIMANDI OPERATING SYSTEM</Text>
          </View>

          <Text style={styles.heroTitle}>
            Modern Pragmatic{'\n'}
            <Text style={styles.heroHighlight}>AgriFintech</Text> Platform
          </Text>

          <Text style={styles.heroSubtitle}>
            Bridging Indian farmers directly to electronic APMC mandis with AI-powered quality grading, dynamic queue scheduling, and instant DBT escrow settlements.
          </Text>
        </View>

        {/* Value Proposition Cards */}
        <View style={styles.featuresList}>
          <View style={styles.featureCard}>
            <View style={[styles.featureIconBox, { backgroundColor: colors.primaryBg }]}>
              <Sparkles size={20} color={colors.primary} />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>AI Grain Quality & Grading</Text>
              <Text style={styles.featureDesc}>
                Instant smartphone camera analysis for moisture, foreign matter, and AGMARK Grade A determination.
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={[styles.featureIconBox, { backgroundColor: '#FEF3C7' }]}>
              <Zap size={20} color="#D97706" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Dynamic Mandi Queue Tokens</Text>
              <Text style={styles.featureDesc}>
                Avoid 6-hour highway jams. Real-time 'WAIT' or 'LEAVE NOW' velocity guidance synced with mandi weighbridges.
              </Text>
            </View>
          </View>

          <View style={styles.featureCard}>
            <View style={[styles.featureIconBox, { backgroundColor: '#E0F2FE' }]}>
              <ShieldCheck size={20} color="#0284C7" />
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Instant Direct DBT Settlements</Text>
              <Text style={styles.featureDesc}>
                Guaranteed escrow clearing account disbursal with digital APMC J-Form tax receipts.
              </Text>
            </View>
          </View>
        </View>

        {/* Demo Fast-Tracks */}
        <View style={styles.quickAccessSection}>
          <Text style={styles.quickAccessTitle}>Select Role to Start Demo</Text>
          
          <TouchableOpacity
            style={styles.roleCard}
            onPress={handleQuickEnterFarmer}
            activeOpacity={0.85}
          >
            <View style={styles.roleLeft}>
              <View style={[styles.roleIconBox, { backgroundColor: colors.primaryBg }]}>
                <User size={22} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.roleName}>Kisan (Farmer)</Text>
                <Text style={styles.roleSub}>Rajesh Kumar • 20 QTL Sharbati Wheat</Text>
              </View>
            </View>
            <ArrowRight size={20} color={colors.primary} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.roleCard}
            onPress={handleQuickEnterBuyer}
            activeOpacity={0.85}
          >
            <View style={styles.roleLeft}>
              <View style={[styles.roleIconBox, { backgroundColor: '#E0F2FE' }]}>
                <Building2 size={22} color="#0284C7" />
              </View>
              <View>
                <Text style={styles.roleName}>Buyer / Mandi Operator</Text>
                <Text style={styles.roleSub}>Kisan Agro • Taraori Mandi Yard 2</Text>
              </View>
            </View>
            <ArrowRight size={20} color="#0284C7" />
          </TouchableOpacity>
        </View>

        {/* Onboarding Flow CTA */}
        <View style={styles.ctaSection}>
          <SecondaryButton
            title="Step-by-Step Onboarding Walkthrough"
            onPress={() => navigation.navigate('RoleSelection')}
          />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.md,
    gap: spacing.lg,
  },
  heroSection: {
    alignItems: 'flex-start',
    marginTop: spacing.sm,
  },
  brandBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 5,
    borderRadius: radius.full,
    marginBottom: spacing.md,
  },
  brandBadgeText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.bold,
    color: colors.primaryDark,
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: 32,
    lineHeight: 40,
    fontFamily: typography.fontFamilies.bold,
    color: colors.textPrimary,
  },
  heroHighlight: {
    color: colors.primary,
  },
  heroSubtitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 22,
  },
  featuresList: {
    gap: spacing.sm,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    gap: spacing.md,
    ...shadows.sm,
  },
  featureIconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamilies.bold,
    color: colors.textPrimary,
  },
  featureDesc: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 2,
  },
  quickAccessSection: {
    gap: spacing.sm,
  },
  quickAccessTitle: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamilies.bold,
    color: colors.textPrimary,
    marginBottom: 4,
  },
  roleCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  roleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  roleIconBox: {
    width: 46,
    height: 46,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleName: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamilies.bold,
    color: colors.textPrimary,
  },
  roleSub: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  ctaSection: {
    marginTop: spacing.xs,
  },
});
