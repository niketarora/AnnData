import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { useAppStore } from '../../store';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { FarmerStackParamList } from '../../types';

export const MarketIntelligenceScreen: React.FC = () => {
  const [state] = useAppStore();
  const navigation = useNavigation<NativeStackNavigationProp<FarmerStackParamList>>();
  const rec = state.recommendation;

  return (
    <View style={styles.container}>
      <AppHeader
        title="Market Intelligence"
        subtitle="AI Price Outlook & Decision Model"
        showBack
        onBack={() => navigation.goBack()}
        onNotificationPress={() => navigation.navigate('Notifications')}
        onProfilePress={() => navigation.navigate('FarmerProfile')}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Market Outlook Card */}
        <View style={styles.outlookCard}>
          <View style={styles.outlookHeader}>
            <View style={styles.outlookTag}>
              <Ionicons name="analytics" size={14} color={colors.primaryLight} />
              <Text style={styles.outlookTagText}>MARKET OUTLOOK • WHEAT</Text>
            </View>
            <Text style={styles.updatedText}>Updated 10m ago</Text>
          </View>

          <View style={styles.priceRow}>
            <View>
              <Text style={styles.priceLabel}>Expected Price Range</Text>
              <Text style={styles.priceRange}>{rec.marketPriceRange}</Text>
            </View>
            <View style={styles.trendCol}>
              <View style={styles.trendPill}>
                <Ionicons name="trending-up" size={15} color={colors.success} />
                <Text style={styles.trendPillText}>↑ {rec.sevenDayTrendPercent}%</Text>
              </View>
              <Text style={styles.trendSub}>7-day outlook</Text>
            </View>
          </View>

          {/* Current vs Expected Comparison Strip */}
          <View style={styles.compStrip}>
            <View style={styles.compCol}>
              <Text style={styles.compLabel}>Current APMC Baseline</Text>
              <Text style={styles.compValue}>₹2,390 / QTL</Text>
            </View>
            <View style={[styles.compCol, { alignItems: 'flex-end' }]}>
              <Text style={styles.compLabel}>Target Realization</Text>
              <Text style={[styles.compValue, { color: colors.success }]}>₹2,500 / QTL Net</Text>
            </View>
          </View>
        </View>

        {/* Dynamic Recommendation Card: PARTIAL SELL */}
        <View style={styles.decisionCard}>
          <View style={styles.decisionHeader}>
            <View style={styles.decisionBadge}>
              <Ionicons name="flash" size={15} color={colors.warning} />
              <Text style={styles.decisionBadgeText}>RECOMMENDED ACTION</Text>
            </View>
            <Text style={styles.confidenceText}>High Algorithmic Confidence</Text>
          </View>

          <Text style={styles.actionTitle}>{rec.actionTitle}</Text>
          <Text style={styles.actionSubtitle}>{rec.actionSubtitle}</Text>

          {/* Split Bars */}
          <View style={styles.splitBarContainer}>
            <View style={[styles.splitSell, { width: `${rec.sellPercent || 40}%` }]}>
              <Text style={styles.splitBarText}>Sell {rec.sellPercent}% Now</Text>
            </View>
            <View style={[styles.splitHold, { width: `${rec.holdPercent || 60}%` }]}>
              <Text style={styles.splitBarText}>Hold {rec.holdPercent}%</Text>
            </View>
          </View>

          {/* Rationale Breakdown */}
          <View style={styles.rationaleContainer}>
            <Text style={styles.rationaleTitle}>Decision Rationale</Text>
            <Text style={styles.rationaleText}>{rec.rationale}</Text>

            <View style={styles.factorBullet}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.bulletText}>
                Taraori Mandi queue clearance is ~25 min today (lowest delay among all regional yards).
              </Text>
            </View>
            <View style={styles.factorBullet}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.bulletText}>
                Buyer demand is robust with 500 Quintals open quota at premium rate.
              </Text>
            </View>
            <View style={styles.factorBullet}>
              <Ionicons name="checkmark-circle" size={16} color={colors.success} />
              <Text style={styles.bulletText}>
                Holding 60% allows capitalizing on expected regional price hardening over the next 5 days.
              </Text>
            </View>
          </View>
        </View>

        {/* CTA to compare best places to sell */}
        <PrimaryButton
          title="Compare Best Places to Sell (3 Mandis)"
          rightIconName="arrow-forward"
          onPress={() => navigation.navigate('BestPlacesToSell')}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.gutterMobile,
    gap: spacing.spaceMd,
    paddingBottom: 60,
  },
  outlookCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.spaceMd,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
    gap: spacing.spaceSm,
  },
  outlookHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  outlookTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  outlookTagText: {
    ...typography.badgeLabel,
    color: colors.primaryLight,
  },
  updatedText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.spaceXs,
  },
  priceLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  priceRange: {
    ...typography.headlineLg,
    color: colors.textPrimary,
    fontWeight: '700',
    marginTop: 2,
  },
  trendCol: {
    alignItems: 'flex-end',
  },
  trendPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.successTint,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  trendPillText: {
    ...typography.captionBold,
    color: colors.success,
  },
  trendSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  compStrip: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.md,
    padding: spacing.spaceSm,
    marginTop: spacing.spaceXs,
  },
  compCol: {
    flex: 1,
  },
  compLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  compValue: {
    ...typography.bodyBaseMedium,
    color: colors.textPrimary,
    marginTop: 2,
  },
  decisionCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.spaceMd,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    ...shadows.md,
    gap: spacing.spaceSm,
  },
  decisionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  decisionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.warningTint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  decisionBadgeText: {
    ...typography.badgeLabel,
    color: colors.warning,
  },
  confidenceText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  actionTitle: {
    ...typography.headlineLg,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  actionSubtitle: {
    ...typography.bodyBaseMedium,
    color: colors.primaryDark,
  },
  splitBarContainer: {
    flexDirection: 'row',
    height: 32,
    borderRadius: radius.md,
    overflow: 'hidden',
    marginVertical: spacing.spaceXs,
  },
  splitSell: {
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splitHold: {
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: 'center',
    justifyContent: 'center',
  },
  splitBarText: {
    ...typography.captionBold,
    color: colors.onPrimary,
    fontSize: 11,
  },
  rationaleContainer: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
    padding: spacing.spaceSm,
    gap: 8,
  },
  rationaleTitle: {
    ...typography.captionBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  rationaleText: {
    ...typography.bodyBase,
    color: colors.textPrimary,
    lineHeight: 20,
  },
  factorBullet: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bulletText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
});
