import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { FarmerStackParamList } from '../../types';
import { useIntelligence } from '../../features/intelligence/hooks/useIntelligence';
import {
  PredictionCard,
  FreshnessBadge,
  ConfidenceIndicator,
  StaleDataBanner,
  ExplainabilityDrawer,
} from '../../features/intelligence/components';
import { IntelligenceFormatters } from '../../features/intelligence/formatters/intelligenceFormatters';

export const MarketIntelligenceScreen: React.FC = () => {
  const navigation = useNavigation<NativeStackNavigationProp<FarmerStackParamList>>();
  const [showExplainer, setShowExplainer] = useState(false);

  // Connect to live intelligence API for Wheat
  const {
    bundle,
    viewState,
    isStale,
    isRefreshing,
    refresh,
  } = useIntelligence('crop', '55555555-5555-5555-5555-555555555501');

  const rec = bundle?.recommendation;
  const pred = bundle?.prediction;
  const freshness = bundle?.freshness;

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
        {/* Stale Warning Banner with manual refresh CTA */}
        {isStale && (
          <StaleDataBanner
            observedAt={freshness?.last_observed_at}
            onRefresh={refresh}
            isRefreshing={isRefreshing}
          />
        )}

        {/* Live / Refresh Status Strip */}
        <View style={styles.topStatusStrip}>
          <FreshnessBadge
            status={freshness?.status || 'LIVE'}
            observedAt={freshness?.last_observed_at}
          />
          <TouchableOpacity
            style={styles.refreshControlBtn}
            onPress={refresh}
            disabled={isRefreshing}
            activeOpacity={0.8}
          >
            {isRefreshing ? (
              <ActivityIndicator size="small" color={colors.primaryLight} />
            ) : (
              <>
                <Ionicons name="refresh" size={13} color={colors.primaryLight} />
                <Text style={styles.refreshControlText}>Refresh Feed</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Dynamic OASSM-10 Price Prediction Card */}
        <PredictionCard
          prediction={pred || null}
          cropName="Wheat (Sharbati)"
          freshnessStatus={freshness?.status || 'LIVE'}
          observedAt={freshness?.last_observed_at}
        />

        {/* Dynamic Decision Recommendation Card */}
        {rec && (
          <View style={styles.decisionCard}>
            <View style={styles.decisionHeader}>
              <View style={styles.decisionBadge}>
                <Ionicons name="flash" size={14} color={colors.warning} />
                <Text style={styles.decisionBadgeText}>RECOMMENDED ACTION</Text>
              </View>
              <ConfidenceIndicator confidence={rec.confidence} size="sm" />
            </View>

            <Text style={styles.actionTitle}>
              {IntelligenceFormatters.formatActionTitle(rec.decision)}
            </Text>
            <Text style={styles.actionSubtitle}>
              Optimal net realization strategy for 20 QTL Sharbati Wheat
            </Text>

            {/* Split Allocation Bars */}
            {rec.sell_percent !== undefined && (
              <View style={styles.splitBarContainer}>
                <View style={[styles.splitSell, { width: `${rec.sell_percent}%` as `${number}%` }]}>
                  <Text style={styles.splitBarText}>Sell {rec.sell_percent}% Now</Text>
                </View>
                <View style={[styles.splitHold, { width: `${rec.hold_percent ?? (100 - rec.sell_percent)}%` as `${number}%` }]}>
                  <Text style={styles.splitBarText}>Hold {rec.hold_percent ?? (100 - rec.sell_percent)}%</Text>
                </View>
              </View>
            )}

            {/* Decision Rationale */}
            <View style={styles.rationaleContainer}>
              <Text style={styles.rationaleTitle}>Decision Rationale</Text>
              <Text style={styles.rationaleText}>{rec.reason}</Text>

              {/* Dynamic Factors List */}
              {rec.factors && rec.factors.length > 0 && (
                <View style={styles.factorsList}>
                  {rec.factors.slice(0, 3).map((f, i) => (
                    <View key={f.id || i} style={styles.factorBullet}>
                      <Ionicons
                        name={f.impact === 'positive' ? 'checkmark-circle' : 'alert-circle'}
                        size={15}
                        color={f.impact === 'positive' ? colors.success : colors.warning}
                      />
                      <Text style={styles.bulletText}>
                        <Text style={styles.factorNameBold}>{f.factor}: </Text>
                        {f.value}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* Explainer Trigger CTA */}
            <TouchableOpacity
              style={styles.explainerTrigger}
              onPress={() => setShowExplainer(true)}
              activeOpacity={0.8}
            >
              <Ionicons name="information-circle-outline" size={16} color={colors.primaryLight} />
              <Text style={styles.explainerTriggerText}>
                Why this recommendation? View Algorithmic Factors
              </Text>
              <Ionicons name="chevron-forward" size={14} color={colors.primaryLight} />
            </TouchableOpacity>
          </View>
        )}

        {/* CTA to compare best places to sell */}
        <PrimaryButton
          title="Compare Best Places to Sell (3 Mandis)"
          rightIconName="arrow-forward"
          onPress={() => navigation.navigate('BestPlacesToSell')}
        />
      </ScrollView>

      {/* Decision Explainability Drawer */}
      <ExplainabilityDrawer
        visible={showExplainer}
        recommendation={rec || null}
        onClose={() => setShowExplainer(false)}
      />
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
  topStatusStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  refreshControlBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  refreshControlText: {
    ...typography.captionBold,
    color: colors.primaryLight,
    fontSize: 11,
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
    fontSize: 10,
  },
  actionTitle: {
    ...typography.headlineLg,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  actionSubtitle: {
    ...typography.bodyBaseMedium,
    color: colors.primaryDark,
    fontSize: 13,
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
    fontSize: 13,
  },
  factorsList: {
    gap: 6,
    marginTop: 4,
  },
  factorBullet: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  factorNameBold: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
  bulletText: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
  explainerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.md,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 4,
  },
  explainerTriggerText: {
    ...typography.captionBold,
    color: colors.primaryLight,
    flex: 1,
    marginLeft: 6,
  },
});
