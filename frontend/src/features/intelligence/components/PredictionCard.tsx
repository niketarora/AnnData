/**
 * Prediction Card Component
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Section 34: Price Forecast Visualization Card
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadows } from '../../../theme';
import { Prediction, DataFreshnessStatus } from '../types/intelligence.types';
import { FreshnessBadge } from './FreshnessBadge';
import { ConfidenceIndicator } from './ConfidenceIndicator';

interface PredictionCardProps {
  prediction: Prediction | null;
  cropName?: string;
  freshnessStatus?: DataFreshnessStatus;
  observedAt?: string;
}

export const PredictionCard: React.FC<PredictionCardProps> = ({
  prediction,
  cropName = 'Wheat',
  freshnessStatus = 'LIVE',
  observedAt,
}) => {
  if (!prediction) {
    return (
      <View style={styles.card}>
        <Text style={styles.placeholderText}>Price prediction model loading...</Text>
      </View>
    );
  }

  const val = prediction.value_json;
  const isPositiveTrend = (val?.sevenDayTrendPercent || 0) >= 0;

  return (
    <View style={styles.card}>
      {/* Header with Badges */}
      <View style={styles.header}>
        <View style={styles.tag}>
          <Ionicons name="analytics" size={14} color={colors.primaryLight} />
          <Text style={styles.tagText}>PRICE OUTLOOK • {cropName.toUpperCase()}</Text>
        </View>
        <FreshnessBadge status={freshnessStatus} observedAt={observedAt || prediction.generated_at} />
      </View>

      {/* Main Expected Price Range & Trend */}
      <View style={styles.priceRow}>
        <View>
          <Text style={styles.priceLabel}>Expected Wholesale Range</Text>
          <Text style={styles.priceRange}>{val?.expectedPriceRange || '₹2,540 - ₹2,625'}</Text>
        </View>
        <View style={styles.trendCol}>
          <View
            style={[
              styles.trendPill,
              { backgroundColor: isPositiveTrend ? colors.successTint : colors.dangerTint },
            ]}
          >
            <Ionicons
              name={isPositiveTrend ? 'trending-up' : 'trending-down'}
              size={15}
              color={isPositiveTrend ? colors.success : colors.danger}
            />
            <Text
              style={[
                styles.trendPillText,
                { color: isPositiveTrend ? colors.success : colors.danger },
              ]}
            >
              {isPositiveTrend ? '↑' : '↓'} {Math.abs(val?.sevenDayTrendPercent || 0)}%
            </Text>
          </View>
          <Text style={styles.trendSub}>7-day forecast</Text>
        </View>
      </View>

      {/* 1d, 3d, 7d Projection Timeline Strip */}
      <View style={styles.timelineStrip}>
        <View style={styles.timelineItem}>
          <Text style={styles.timelineLabel}>Tomorrow (1d)</Text>
          <Text style={styles.timelineValue}>₹{val?.predictedPrice1d?.toLocaleString('en-IN') || '2,540'}</Text>
        </View>
        <View style={styles.timelineDivider} />
        <View style={styles.timelineItem}>
          <Text style={styles.timelineLabel}>In 3 Days</Text>
          <Text style={styles.timelineValue}>₹{val?.predictedPrice3d?.toLocaleString('en-IN') || '2,580'}</Text>
        </View>
        <View style={styles.timelineDivider} />
        <View style={styles.timelineItem}>
          <Text style={styles.timelineLabel}>In 7 Days</Text>
          <Text style={[styles.timelineValue, { color: colors.success }]}>
            ₹{val?.predictedPrice7d?.toLocaleString('en-IN') || '2,625'}
          </Text>
        </View>
      </View>

      {/* Baseline & Confidence Strip */}
      <View style={styles.bottomRow}>
        <View style={styles.confidenceCol}>
          <ConfidenceIndicator confidence={prediction.confidence} size="sm" />
        </View>
        <Text style={styles.modelVersionText}>Model: {prediction.model_version}</Text>
      </View>
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
    ...shadows.sm,
    gap: spacing.spaceSm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  tagText: {
    ...typography.badgeLabel,
    color: colors.primaryLight,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
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
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  trendPillText: {
    ...typography.captionBold,
  },
  trendSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  timelineStrip: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.md,
    padding: spacing.spaceSm,
    marginTop: 4,
    alignItems: 'center',
  },
  timelineItem: {
    flex: 1,
    alignItems: 'center',
  },
  timelineDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  timelineLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
  },
  timelineValue: {
    ...typography.bodyBaseMedium,
    color: colors.textPrimary,
    fontWeight: '700',
    marginTop: 2,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceContainer,
  },
  confidenceCol: {
    flex: 1,
  },
  modelVersionText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
  },
  placeholderText: {
    ...typography.bodyBase,
    color: colors.textSecondary,
    textAlign: 'center',
    padding: 20,
  },
});
