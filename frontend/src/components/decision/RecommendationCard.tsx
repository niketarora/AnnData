import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { CurrencyDisplay } from '../common/CurrencyDisplay';
import { Market } from '../../types';

interface RecommendationCardProps {
  market: Market;
  onBookPress: () => void;
  onViewDetailsPress?: () => void;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({
  market,
  onBookPress,
  onViewDetailsPress,
}) => {
  return (
    <View style={styles.card}>
      {/* Header Badging */}
      <View style={styles.headerRow}>
        <View style={styles.recommendBadge}>
          <Ionicons name="sparkles" size={14} color={colors.success} />
          <Text style={styles.recommendBadgeText}>Best Selling Option</Text>
        </View>
        <Text style={styles.timestampText}>Updated 4m ago</Text>
      </View>

      {/* Market Name & Rates */}
      <View style={styles.marketRow}>
        <View style={styles.marketInfo}>
          <Text style={styles.marketName}>{market.name}</Text>
          <Text style={styles.logisticsText}>
            {market.distanceKm} km away • Approx {market.transitMinutes} mins transit
          </Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.grossPrice}>₹{market.grossPricePerQuintal.toLocaleString('en-IN')}</Text>
          <Text style={styles.priceUnit}>/ QTL</Text>
        </View>
      </View>

      {/* Highlight Net Realization Callout */}
      <View style={styles.realizationCallout}>
        <Text style={styles.realizationLabel}>ESTIMATED NET REALIZATION</Text>
        <View style={styles.realizationValueRow}>
          <CurrencyDisplay
            amount={market.expectedNetPayout}
            size="lg"
            color={colors.primaryDark}
          />
          <View style={styles.deltaBadge}>
            <Text style={styles.deltaBadgeText}>+₹1,450 vs avg</Text>
          </View>
        </View>
        <Text style={styles.rationaleText}>
          {market.recommendationReason ||
            `Market gives the highest net realization factoring transport (₹${market.transportCost}) and quick queue clearance.`}
        </Text>
      </View>

      {/* Operational Chips */}
      <View style={styles.chipsRow}>
        <View style={styles.chip}>
          <View style={[styles.chipDot, { backgroundColor: colors.success }]} />
          <Text style={styles.chipText}>Low congestion</Text>
        </View>
        <View style={styles.chip}>
          <View style={[styles.chipDot, { backgroundColor: colors.success }]} />
          <Text style={styles.chipText}>
            High demand ({market.openDemandQuintals} QTL open)
          </Text>
        </View>
      </View>

      {/* Dynamic CTA */}
      <TouchableOpacity
        style={styles.ctaButton}
        onPress={onBookPress}
        activeOpacity={0.88}
        accessibilityRole="button"
      >
        <Ionicons name="flash" size={18} color={colors.onPrimary} />
        <Text style={styles.ctaText}>Sell Here & Book Slot</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.spaceMd,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.spaceXs,
  },
  recommendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.successTint,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  recommendBadgeText: {
    ...typography.badgeLabel,
    color: colors.success,
    textTransform: 'uppercase',
  },
  timestampText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  marketRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: spacing.spaceXs,
  },
  marketInfo: {
    flex: 1,
    marginRight: spacing.spaceSm,
  },
  marketName: {
    ...typography.headlineMd,
    color: colors.textPrimary,
  },
  logisticsText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  grossPrice: {
    ...typography.titleCard,
    color: colors.success,
    fontSize: 18,
    fontWeight: '700',
  },
  priceUnit: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  realizationCallout: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
    padding: spacing.spaceSm,
    marginTop: spacing.spaceSm,
  },
  realizationLabel: {
    ...typography.badgeLabel,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  realizationValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  deltaBadge: {
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  deltaBadgeText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  rationaleText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 6,
    lineHeight: 16,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: spacing.spaceSm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chipText: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  ctaButton: {
    minHeight: spacing.touchMin,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: spacing.spaceMd,
    ...shadows.primaryAction,
  },
  ctaText: {
    ...typography.bodyBaseMedium,
    color: colors.onPrimary,
    fontWeight: '600',
    fontSize: 15,
  },
});
