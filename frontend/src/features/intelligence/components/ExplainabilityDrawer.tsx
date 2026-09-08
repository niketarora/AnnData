/**
 * Explainability Drawer / Modal Component
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Section 21: Full Decision Explainability Requirement
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadows } from '../../../theme';
import {
  Recommendation,
  RecommendationFactor,
} from '../types/intelligence.types';
import { ConfidenceIndicator } from './ConfidenceIndicator';
import { IntelligenceFormatters } from '../formatters/intelligenceFormatters';

interface ExplainabilityDrawerProps {
  visible: boolean;
  recommendation: Recommendation | null;
  onClose: () => void;
}

export const ExplainabilityDrawer: React.FC<ExplainabilityDrawerProps> = ({
  visible,
  recommendation,
  onClose,
}) => {
  if (!recommendation) return null;

  const factors: RecommendationFactor[] = recommendation.factors || [];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.sheetContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconBadge}>
                <Ionicons name="bulb" size={18} color={colors.primaryLight} />
              </View>
              <View>
                <Text style={styles.title}>Algorithmic Decision Explainer</Text>
                <Text style={styles.subtitle}>
                  Model: {recommendation.model_version} • KrishiNetra Decision Engine
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
            {/* 1. What is the recommendation? */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>1. Recommended Action</Text>
              <View style={styles.actionBox}>
                <Text style={styles.actionTitle}>
                  {IntelligenceFormatters.formatActionTitle(recommendation.decision)}
                </Text>
                {recommendation.sell_percent !== undefined && (
                  <Text style={styles.actionSplit}>
                    Sell {recommendation.sell_percent}% • Hold {recommendation.hold_percent}%
                  </Text>
                )}
              </View>
            </View>

            {/* 2. Why? */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>2. Decision Rationale</Text>
              <Text style={styles.rationaleBody}>{recommendation.reason}</Text>
            </View>

            {/* 3. What data influenced it? (Factors) */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>3. Contributing Decision Factors</Text>
              <View style={styles.factorsList}>
                {factors.map((f, idx) => {
                  const isPositive = f.impact === 'positive';
                  const isNegative = f.impact === 'negative';
                  const chipColor = isPositive ? colors.success : isNegative ? colors.danger : colors.textSecondary;
                  const chipBg = isPositive ? colors.successTint : isNegative ? colors.dangerTint : colors.surfaceContainer;

                  return (
                    <View key={f.id || idx} style={styles.factorCard}>
                      <View style={styles.factorTopRow}>
                        <Text style={styles.factorName}>{f.factor}</Text>
                        <View style={[styles.impactChip, { backgroundColor: chipBg }]}>
                          <Ionicons
                            name={isPositive ? 'arrow-up' : isNegative ? 'arrow-down' : 'remove'}
                            size={12}
                            color={chipColor}
                          />
                          <Text style={[styles.impactText, { color: chipColor }]}>
                            {f.impact.toUpperCase()}
                          </Text>
                        </View>
                      </View>
                      <Text style={styles.factorValue}>{f.value}</Text>
                      <View style={styles.weightBarContainer}>
                        <View
                          style={[
                            styles.weightBarFill,
                            { width: `${Math.round(f.weight * 100)}%`, backgroundColor: chipColor },
                          ]}
                        />
                      </View>
                      <Text style={styles.weightText}>
                        Model Influence Weight: {Math.round(f.weight * 100)}%
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            {/* 4. How confident is the system? */}
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>4. Confidence & Validation</Text>
              <ConfidenceIndicator confidence={recommendation.confidence} />
            </View>

            {/* 5 & 6. When generated and when does it expire? */}
            <View style={styles.metadataStrip}>
              <View style={styles.metaCol}>
                <Text style={styles.metaLabel}>Generated At</Text>
                <Text style={styles.metaValue}>
                  {IntelligenceFormatters.formatRelativeTime(recommendation.generated_at)}
                </Text>
              </View>
              <View style={[styles.metaCol, { alignItems: 'flex-end' }]}>
                <Text style={styles.metaLabel}>Expires In</Text>
                <Text style={styles.metaValue}>
                  {recommendation.expires_at
                    ? `${Math.max(1, Math.round((new Date(recommendation.expires_at).getTime() - Date.now()) / 60000))} mins`
                    : '15 mins'}
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheetContainer: {
    backgroundColor: colors.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    padding: spacing.spaceLg,
    gap: spacing.spaceMd,
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.spaceSm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.headlineMd,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  closeBtn: {
    padding: 6,
  },
  scroll: {
    flexGrow: 0,
  },
  section: {
    marginBottom: spacing.spaceMd,
    gap: 6,
  },
  sectionLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  actionBox: {
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.spaceSm,
    borderRadius: radius.md,
    gap: 2,
  },
  actionTitle: {
    ...typography.headlineMd,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  actionSplit: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  rationaleBody: {
    ...typography.bodyBase,
    color: colors.textPrimary,
    lineHeight: 22,
  },
  factorsList: {
    gap: 8,
  },
  factorCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.md,
    padding: spacing.spaceSm,
    gap: 4,
  },
  factorTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  factorName: {
    ...typography.bodyBaseMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  impactChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  impactText: {
    ...typography.captionBold,
    fontSize: 9,
  },
  factorValue: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  weightBarContainer: {
    height: 4,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginTop: 2,
  },
  weightBarFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  weightText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
  },
  metadataStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.md,
    padding: spacing.spaceSm,
    marginTop: spacing.spaceSm,
    marginBottom: spacing.spaceLg,
  },
  metaCol: {
    flex: 1,
  },
  metaLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  metaValue: {
    ...typography.captionBold,
    color: colors.textPrimary,
    marginTop: 2,
  },
});
