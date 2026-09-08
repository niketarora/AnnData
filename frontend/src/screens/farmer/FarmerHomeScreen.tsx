import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { useAppStore } from '../../store';
import { AppHeader } from '../../components/common/AppHeader';
import { RecommendationCard } from '../../components/decision/RecommendationCard';
import { CurrencyDisplay } from '../../components/common/CurrencyDisplay';
import { FarmerStackParamList } from '../../types';

export const FarmerHomeScreen: React.FC = () => {
  const [state, store] = useAppStore();
  const navigation = useNavigation<NativeStackNavigationProp<FarmerStackParamList>>();

  const activeLot = state.lots.find((l) => l.id === state.activeLotId) || state.lots[0];
  const recommendedMarket = state.markets.find((m) => m.isRecommended) || state.markets[0];
  const activeBooking = state.bookings[0];

  return (
    <View style={styles.container}>
      <AppHeader
        onNotificationPress={() => navigation.navigate('Notifications')}
        onProfilePress={() => navigation.navigate('FarmerProfile')}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Welcome Header Banner */}
        <View style={styles.welcomeBanner}>
          <View style={styles.welcomeLeft}>
            <View style={styles.greetingRow}>
              <Text style={styles.greetingText}>Good Morning, {state.farmer.name.split(' ')[0]}</Text>
              <Text style={styles.waveEmoji}>👋</Text>
            </View>
            <View style={styles.regionRow}>
              <Ionicons name="location-sharp" size={14} color={colors.primaryLight} />
              <Text style={styles.regionText}>{state.farmer.mandiRegion}</Text>
            </View>
          </View>

          <View style={styles.liveSyncPill}>
            <View style={styles.liveSyncDot} />
            <Text style={styles.liveSyncText}>Live Sync active</Text>
          </View>
        </View>

        {/* Today's Booking Urgency Alert Card */}
        {activeBooking && (
          <View style={styles.urgencyCard}>
            <View style={styles.urgencyHeader}>
              <View style={styles.urgencyTitleRow}>
                <Ionicons name="time-outline" size={20} color={colors.warning} />
                <Text style={styles.urgencyTitle}>Today's Booking Status</Text>
              </View>
              <View style={styles.tokenTag}>
                <Text style={styles.tokenTagText}>Token #{activeBooking.tokenNumber}</Text>
              </View>
            </View>

            {/* Status Alert Banner */}
            <View
              style={[
                styles.alertBanner,
                state.queue.departureState === 'LEAVE_NOW'
                  ? styles.alertBannerSuccess
                  : styles.alertBannerWarning,
              ]}
            >
              <Ionicons
                name={
                  state.queue.departureState === 'LEAVE_NOW'
                    ? 'checkmark-circle'
                    : 'warning'
                }
                size={20}
                color={
                  state.queue.departureState === 'LEAVE_NOW'
                    ? colors.success
                    : colors.warning
                }
                style={styles.alertIcon}
              />
              <View style={styles.alertTextContainer}>
                <View style={styles.alertTagRow}>
                  <Text
                    style={[
                      styles.alertBadgeText,
                      {
                        color:
                          state.queue.departureState === 'LEAVE_NOW'
                            ? colors.success
                            : colors.warning,
                      },
                    ]}
                  >
                    {state.queue.departureState === 'LEAVE_NOW' ? 'LEAVE NOW' : 'WAIT'}
                  </Text>
                  <Text style={styles.alertDot}>•</Text>
                  <Text
                    style={[
                      styles.alertDetailText,
                      {
                        color:
                          state.queue.departureState === 'LEAVE_NOW'
                            ? colors.success
                            : colors.warning,
                      },
                    ]}
                  >
                    {state.queue.departureState === 'LEAVE_NOW'
                      ? 'Gate Express Line open'
                      : `${state.queue.delayMinutes} min delay at gate`}
                  </Text>
                </View>
                <Text style={styles.alertMessage}>
                  {state.queue.departureState === 'LEAVE_NOW'
                    ? 'Mandi gate congestion cleared. Proceed to Taraori Mandi Gate 2.'
                    : `Mandi unloading queue is delayed by ~${state.queue.delayMinutes} min. Do not leave your farm yet. Next departure ETA: ${state.queue.revisedDepartureTime}.`}
                </Text>
              </View>
            </View>

            {/* Token Details Strip */}
            <View style={styles.tokenStrip}>
              <View style={styles.stripCol}>
                <Text style={styles.stripLabel}>Scheduled Slot</Text>
                <Text style={styles.stripValue}>{activeBooking.scheduledSlot}</Text>
              </View>
              <View style={[styles.stripCol, { alignItems: 'flex-end' }]}>
                <Text style={styles.stripLabel}>Destination</Text>
                <Text style={styles.stripValue}>{activeBooking.marketName.split(' ')[0]} Mandi</Text>
              </View>
            </View>

            {/* Live Queue Button */}
            <TouchableOpacity
              style={styles.queueButton}
              onPress={() => navigation.navigate('LiveMandiQueue', { bookingId: activeBooking.id })}
              activeOpacity={0.85}
            >
              <Ionicons name="speedometer-outline" size={19} color={colors.primaryLight} />
              <Text style={styles.queueButtonText}>View Live Mandi Queue</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Selling Recommendation Card */}
        <RecommendationCard
          market={recommendedMarket}
          onBookPress={() => navigation.navigate('BookSlot', { marketId: recommendedMarket.id })}
          onViewDetailsPress={() => navigation.navigate('BestPlacesToSell')}
        />

        {/* Active Crop Lot Card */}
        {activeLot && (
          <View style={styles.cropLotCard}>
            <View style={styles.cropCardHeader}>
              <Text style={styles.cropCardSub}>ACTIVE HARVEST LOT</Text>
              <Text style={styles.lotIdText}>Lot #{activeLot.id.toUpperCase()}</Text>
            </View>

            <View style={styles.cropInfoRow}>
              <Image source={{ uri: activeLot.images[0] }} style={styles.cropThumbnail} />
              <View style={styles.cropDetailsCol}>
                <View style={styles.cropTitleRow}>
                  <Text style={styles.cropName}>{activeLot.crop} ({activeLot.variety})</Text>
                  <Text style={styles.cropQuantity}>{activeLot.quantityQuintals} QTL</Text>
                </View>

                {activeLot.qualityAssessment && (
                  <View style={styles.gradeRow}>
                    <View style={styles.gradeBadge}>
                      <Text style={styles.gradeBadgeText}>
                        AI {activeLot.qualityAssessment.predictedGrade}
                      </Text>
                    </View>
                    <Text style={styles.confidenceText}>
                      Score: {activeLot.qualityAssessment.overallScore}/100 ({activeLot.qualityAssessment.confidenceScore}% conf.)
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Estimated Value */}
            <View style={styles.estValueRow}>
              <View>
                <Text style={styles.estValueLabel}>Estimated Market Value</Text>
                <Text style={styles.estValueNumber}>₹48,400 – ₹50,400</Text>
              </View>
              <View style={styles.trendBadge}>
                <Ionicons name="trending-up" size={15} color={colors.success} />
                <Text style={styles.trendText}>Firm +2.4%</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.cropDetailsButton}
              onPress={() => navigation.navigate('CropQualityResult', { lotId: activeLot.id })}
              activeOpacity={0.8}
            >
              <Ionicons name="document-text-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.cropDetailsButtonText}>View AI Quality Analysis</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Quick Actions 2x2 Grid */}
        <View style={styles.quickActionsContainer}>
          <View style={styles.quickActionsHeader}>
            <Text style={styles.quickActionsTitle}>QUICK ACTIONS</Text>
            <Text style={styles.quickActionsSub}>Frequent tasks</Text>
          </View>

          <View style={styles.grid2x2}>
            {/* Quick Action 1: Sell / Scan Crop */}
            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => navigation.navigate('CreateCropLot')}
              activeOpacity={0.8}
            >
              <View style={[styles.gridIconCircle, { backgroundColor: colors.successTint }]}>
                <Ionicons name="camera" size={20} color={colors.success} />
              </View>
              <Text style={styles.gridItemTitle}>Sell / Scan Crop</Text>
              <Text style={styles.gridItemSub}>Instant AI grade</Text>
            </TouchableOpacity>

            {/* Quick Action 2: Best Markets */}
            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => navigation.navigate('BestPlacesToSell')}
              activeOpacity={0.8}
            >
              <View style={[styles.gridIconCircle, { backgroundColor: colors.infoTint }]}>
                <Ionicons name="bar-chart" size={20} color={colors.info} />
              </View>
              <Text style={styles.gridItemTitle}>Best Markets</Text>
              <Text style={styles.gridItemSub}>Compare live rates</Text>
            </TouchableOpacity>

            {/* Quick Action 3: Active Bookings */}
            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => navigation.navigate('LiveMandiQueue', {})}
              activeOpacity={0.8}
            >
              <View style={[styles.gridIconCircle, { backgroundColor: colors.warningTint }]}>
                <Ionicons name="ticket" size={20} color={colors.warning} />
              </View>
              <Text style={styles.gridItemTitle}>Active Bookings</Text>
              <Text style={styles.gridItemSub}>1 Slot active</Text>
            </TouchableOpacity>

            {/* Quick Action 4: Sales & Payments */}
            <TouchableOpacity
              style={styles.gridItem}
              onPress={() => navigation.navigate('SalesHistory')}
              activeOpacity={0.8}
            >
              <View style={[styles.gridIconCircle, { backgroundColor: colors.surfaceContainerHigh }]}>
                <Ionicons name="wallet" size={20} color={colors.primaryLight} />
              </View>
              <Text style={styles.gridItemTitle}>Sales & Payments</Text>
              <Text style={styles.gridItemSub}>Direct bank credit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Financial Summary Card */}
        <View style={styles.financialCard}>
          <View style={styles.financialHeader}>
            <View style={styles.financialTitleRow}>
              <Ionicons name="wallet-outline" size={18} color={colors.primaryLight} />
              <Text style={styles.financialHeaderTitle}>THIS MONTH (OCT 2026)</Text>
            </View>
            <View style={styles.onTrackBadge}>
              <Text style={styles.onTrackText}>On Track</Text>
            </View>
          </View>

          <View style={styles.settledVolumeContainer}>
            <Text style={styles.settledLabel}>Total Settled Volume</Text>
            <CurrencyDisplay amount={124500} size="lg" color={colors.textPrimary} />
          </View>

          {/* Split Ledgers */}
          <View style={styles.ledgersRow}>
            <View style={[styles.ledgerCol, { backgroundColor: colors.successTint }]}>
              <View style={styles.ledgerStatusRow}>
                <Ionicons name="checkmark-circle" size={15} color={colors.success} />
                <Text style={[styles.ledgerStatusText, { color: colors.success }]}>PAID</Text>
              </View>
              <Text style={[styles.ledgerAmount, { color: colors.success }]}>₹1,12,100</Text>
              <Text style={styles.ledgerNote}>Credited to SBI Bank</Text>
            </View>

            <View style={[styles.ledgerCol, { backgroundColor: colors.warningTint }]}>
              <View style={styles.ledgerStatusRow}>
                <Ionicons name="hourglass" size={15} color={colors.warning} />
                <Text style={[styles.ledgerStatusText, { color: colors.warning }]}>PENDING</Text>
              </View>
              <Text style={[styles.ledgerAmount, { color: colors.warning }]}>₹12,400</Text>
              <Text style={styles.ledgerNote}>Mandi gate clearance</Text>
            </View>
          </View>

          {/* Progress Bar */}
          <View style={styles.progressBar}>
            <View style={[styles.progressPaid, { width: '90%' }]} />
            <View style={[styles.progressPending, { width: '10%' }]} />
          </View>

          <TouchableOpacity
            style={styles.viewHistoryButton}
            onPress={() => navigation.navigate('SalesHistory')}
            activeOpacity={0.8}
          >
            <Text style={styles.viewHistoryText}>View Complete Sales History</Text>
            <Ionicons name="arrow-forward" size={18} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
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
    paddingBottom: 100,
  },
  welcomeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.spaceMd,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  welcomeLeft: {
    flex: 1,
  },
  greetingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  greetingText: {
    ...typography.headlineXlMobile,
    color: colors.textPrimary,
  },
  waveEmoji: {
    fontSize: 20,
  },
  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  regionText: {
    ...typography.bodyBaseMedium,
    color: colors.textSecondary,
  },
  liveSyncPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.successTint,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  liveSyncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  liveSyncText: {
    ...typography.captionBold,
    color: colors.success,
  },
  urgencyCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.spaceMd,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  urgencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  urgencyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  urgencyTitle: {
    ...typography.titleCard,
    color: colors.textPrimary,
  },
  tokenTag: {
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  tokenTagText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.spaceSm,
    borderRadius: radius.lg,
    marginTop: spacing.spaceSm,
    gap: 10,
  },
  alertBannerWarning: {
    backgroundColor: colors.warningTint,
  },
  alertBannerSuccess: {
    backgroundColor: colors.successTint,
  },
  alertIcon: {
    marginTop: 2,
  },
  alertTextContainer: {
    flex: 1,
  },
  alertTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  alertBadgeText: {
    ...typography.captionBold,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  alertDot: {
    color: colors.textSecondary,
  },
  alertDetailText: {
    ...typography.captionBold,
  },
  alertMessage: {
    ...typography.caption,
    color: colors.textPrimary,
    marginTop: 4,
    lineHeight: 16,
  },
  tokenStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.md,
    paddingHorizontal: spacing.spaceSm,
    paddingVertical: 8,
    marginTop: spacing.spaceSm,
  },
  stripCol: {},
  stripLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  stripValue: {
    ...typography.bodyBaseMedium,
    color: colors.textPrimary,
    marginTop: 2,
  },
  queueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.lg,
    height: 44,
    marginTop: spacing.spaceSm,
  },
  queueButtonText: {
    ...typography.bodyBaseMedium,
    color: colors.textPrimary,
  },
  cropLotCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.spaceMd,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  cropCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.spaceXs,
  },
  cropCardSub: {
    ...typography.captionBold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  lotIdText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  cropInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceSm,
    marginTop: spacing.spaceXs,
  },
  cropThumbnail: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerHigh,
  },
  cropDetailsCol: {
    flex: 1,
  },
  cropTitleRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
  },
  cropName: {
    ...typography.headlineMd,
    color: colors.textPrimary,
  },
  cropQuantity: {
    ...typography.titleCard,
    color: colors.textPrimary,
  },
  gradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  gradeBadge: {
    backgroundColor: colors.successTint,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  gradeBadgeText: {
    ...typography.badgeLabel,
    color: colors.success,
  },
  confidenceText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  estValueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
    padding: spacing.spaceSm,
    marginTop: spacing.spaceMd,
  },
  estValueLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  estValueNumber: {
    ...typography.titleCard,
    color: colors.primaryLight,
    marginTop: 2,
  },
  trendBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    ...typography.captionBold,
    color: colors.success,
  },
  cropDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.lg,
    height: 44,
    marginTop: spacing.spaceSm,
  },
  cropDetailsButtonText: {
    ...typography.bodyBaseMedium,
    color: colors.textPrimary,
  },
  quickActionsContainer: {
    gap: spacing.spaceXs,
  },
  quickActionsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  quickActionsTitle: {
    ...typography.captionBold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  quickActionsSub: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  grid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.spaceSm,
  },
  gridItem: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.spaceSm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  gridIconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.spaceXs,
  },
  gridItemTitle: {
    ...typography.bodyBaseMedium,
    color: colors.textPrimary,
  },
  gridItemSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  financialCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.spaceMd,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  financialHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  financialTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  financialHeaderTitle: {
    ...typography.captionBold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  onTrackBadge: {
    backgroundColor: colors.successTint,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  onTrackText: {
    ...typography.captionBold,
    color: colors.success,
  },
  settledVolumeContainer: {
    marginVertical: spacing.spaceSm,
  },
  settledLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  ledgersRow: {
    flexDirection: 'row',
    gap: spacing.spaceSm,
    marginTop: spacing.spaceXs,
  },
  ledgerCol: {
    flex: 1,
    padding: spacing.spaceSm,
    borderRadius: radius.lg,
  },
  ledgerStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ledgerStatusText: {
    ...typography.captionBold,
  },
  ledgerAmount: {
    ...typography.titleCard,
    marginTop: 4,
  },
  ledgerNote: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  progressBar: {
    flexDirection: 'row',
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
    overflow: 'hidden',
    marginTop: spacing.spaceMd,
  },
  progressPaid: {
    height: '100%',
    backgroundColor: colors.success,
  },
  progressPending: {
    height: '100%',
    backgroundColor: colors.warning,
  },
  viewHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.lg,
    height: 44,
    paddingHorizontal: spacing.spaceMd,
    marginTop: spacing.spaceMd,
  },
  viewHistoryText: {
    ...typography.bodyBaseMedium,
    color: colors.textPrimary,
  },
});
