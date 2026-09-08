import React, { useState } from 'react';
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
import { ConfirmationModal } from '../../components/feedback/ConfirmationModal';
import { FarmerStackParamList, Market } from '../../types';

export const BestPlacesToSellScreen: React.FC = () => {
  const [state] = useAppStore();
  const navigation = useNavigation<NativeStackNavigationProp<FarmerStackParamList>>();
  const [sortMode, setSortMode] = useState<'net' | 'distance' | 'waiting'>('net');
  const [breakdownModalMarket, setBreakdownModalMarket] = useState<Market | null>(null);

  const sortedMarkets = [...state.markets].sort((a, b) => {
    if (sortMode === 'distance') return a.distanceKm - b.distanceKm;
    if (sortMode === 'waiting') return a.gateWaitingMinutes - b.gateWaitingMinutes;
    return b.expectedNetPayout - a.expectedNetPayout;
  });

  return (
    <View style={styles.container}>
      <AppHeader
        title="Best Places to Sell"
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
        {/* Contextual Crop & Realization Header */}
        <View style={styles.contextHeader}>
          <View style={styles.tagRow}>
            <View style={styles.lotContextTag}>
              <Ionicons name="leaf" size={13} color={colors.primaryLight} />
              <Text style={styles.lotContextText}>Wheat (Kanak) • 20 QTL Lot</Text>
            </View>
            <TouchableOpacity
              style={styles.changeLotBtn}
              onPress={() => navigation.navigate('CropLotsList')}
            >
              <Ionicons name="options-outline" size={15} color={colors.primaryLight} />
              <Text style={styles.changeLotText}>Change Lot</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.mainTitle}>Best Places to Sell</Text>
          <Text style={styles.subTitle}>
            Showing 3 active mandis for Wheat (20 QTL) ranked by Expected Net Realization
          </Text>
        </View>

        {/* Educational Explainer Banner */}
        <View style={styles.explainerBanner}>
          <View style={styles.explainerIconCircle}>
            <Ionicons name="bulb-outline" size={20} color={colors.info} />
          </View>
          <View style={styles.explainerTextContainer}>
            <Text style={styles.explainerTitle}>Why Net Realization?</Text>
            <Text style={styles.explainerBody}>
              We calculate gross crop value minus transport distance and queue waiting loss to find your real take-home earnings.
            </Text>
          </View>
        </View>

        {/* Filter & Sort Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortChipsRow}>
          <TouchableOpacity
            style={[styles.sortChip, sortMode === 'net' && styles.sortChipActive]}
            onPress={() => setSortMode('net')}
          >
            <Ionicons
              name="trending-up"
              size={15}
              color={sortMode === 'net' ? colors.onPrimary : colors.textSecondary}
            />
            <Text style={[styles.sortChipText, sortMode === 'net' && styles.sortChipTextActive]}>
              Rank by Net Realization
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sortChip, sortMode === 'distance' && styles.sortChipActive]}
            onPress={() => setSortMode('distance')}
          >
            <Ionicons
              name="navigate-outline"
              size={15}
              color={sortMode === 'distance' ? colors.onPrimary : colors.textSecondary}
            />
            <Text style={[styles.sortChipText, sortMode === 'distance' && styles.sortChipTextActive]}>
              Shortest Distance
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sortChip, sortMode === 'waiting' && styles.sortChipActive]}
            onPress={() => setSortMode('waiting')}
          >
            <Ionicons
              name="time-outline"
              size={15}
              color={sortMode === 'waiting' ? colors.onPrimary : colors.textSecondary}
            />
            <Text style={[styles.sortChipText, sortMode === 'waiting' && styles.sortChipTextActive]}>
              Lowest Waiting Time
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Mandi Cards Stream */}
        <View style={styles.cardsStream}>
          {sortedMarkets.map((mkt) => {
            const isTopRecommended = mkt.isRecommended;

            return (
              <View
                key={mkt.id}
                style={[
                  styles.mandiCard,
                  isTopRecommended && styles.mandiCardRecommended,
                ]}
              >
                {/* Top Recommended Strip */}
                {isTopRecommended && (
                  <View style={styles.topPickStrip}>
                    <View style={styles.topPickLeft}>
                      <Ionicons name="star" size={14} color={colors.onPrimary} />
                      <Text style={styles.topPickText}>RECOMMENDED BEST NET REALIZATION</Text>
                    </View>
                    <View style={styles.topPickBadge}>
                      <Text style={styles.topPickBadgeText}>Top Pick</Text>
                    </View>
                  </View>
                )}

                <View style={styles.mandiCardBody}>
                  {/* Header & Distance */}
                  <View style={styles.cardHeaderRow}>
                    <View>
                      <View style={styles.locationRow}>
                        <Ionicons name="location-sharp" size={13} color={colors.textSecondary} />
                        <Text style={styles.distanceText}>
                          {mkt.name.split(' ')[0]} • {mkt.distanceKm} km away{' '}
                          {mkt.distanceKm === 10 && '(Closest)'}
                        </Text>
                      </View>
                      <Text style={styles.mandiNameText}>{mkt.name}</Text>
                    </View>

                    {/* Congestion chip */}
                    <View
                      style={[
                        styles.gateStatusPill,
                        mkt.queueCongestion === 'High'
                          ? styles.gatePillDanger
                          : mkt.queueCongestion === 'Low'
                          ? styles.gatePillSuccess
                          : styles.gatePillInfo,
                      ]}
                    >
                      <View
                        style={[
                          styles.gateDot,
                          {
                            backgroundColor:
                              mkt.queueCongestion === 'High'
                                ? colors.danger
                                : mkt.queueCongestion === 'Low'
                                ? colors.success
                                : colors.info,
                          },
                        ]}
                      />
                      <Text
                        style={[
                          styles.gateStatusText,
                          {
                            color:
                              mkt.queueCongestion === 'High'
                                ? colors.danger
                                : mkt.queueCongestion === 'Low'
                                ? colors.success
                                : colors.info,
                          },
                        ]}
                      >
                        {mkt.queueCongestion === 'High'
                          ? 'Crowded'
                          : mkt.queueCongestion === 'Low'
                          ? 'Fast Gate'
                          : 'Moderate'}
                      </Text>
                    </View>
                  </View>

                  {/* Net Realization Highlight Box */}
                  <View
                    style={[
                      styles.netBox,
                      isTopRecommended ? styles.netBoxSuccess : styles.netBoxNeutral,
                    ]}
                  >
                    <View style={styles.netBoxHeader}>
                      <Text style={styles.netBoxLabel}>EXPECTED NET PAYOUT</Text>
                      <Text
                        style={[
                          styles.netRateTag,
                          { color: isTopRecommended ? colors.success : colors.primaryDark },
                        ]}
                      >
                        ₹{mkt.netRatePerQuintal.toLocaleString('en-IN')} / QTL Net
                      </Text>
                    </View>

                    <View style={styles.netAmountRow}>
                      <Text
                        style={[
                          styles.netAmountText,
                          { color: isTopRecommended ? colors.primaryDark : colors.textPrimary },
                        ]}
                      >
                        ₹{mkt.expectedNetPayout.toLocaleString('en-IN')}
                      </Text>
                      <Text style={styles.netAmountSub}>for 20 Quintals</Text>
                    </View>

                    <Text
                      style={[
                        styles.netRationale,
                        { color: isTopRecommended ? colors.success : colors.textSecondary },
                      ]}
                    >
                      {mkt.recommendationReason}
                    </Text>
                  </View>

                  {/* Mini Cost Breakdown Strip */}
                  <View style={styles.breakdownStrip}>
                    <View style={styles.breakdownCol}>
                      <Text style={styles.breakdownLabel}>Base Gross Price</Text>
                      <Text style={styles.breakdownValue}>
                        ₹{mkt.grossPricePerQuintal.toLocaleString('en-IN')}{' '}
                        <Text style={styles.breakdownSub}>/ QTL</Text>
                      </Text>
                      <Text style={styles.breakdownTotal}>
                        Total: ₹{(mkt.grossPricePerQuintal * 20).toLocaleString('en-IN')}
                      </Text>
                    </View>
                    <View style={styles.breakdownCol}>
                      <Text style={styles.breakdownLabel}>Deductions & Transit</Text>
                      <Text style={[styles.breakdownValue, { color: colors.danger }]}>
                        -₹{(mkt.transportCost + mkt.mandiCessDeduction).toLocaleString('en-IN')}
                      </Text>
                      <Text style={styles.breakdownTotal}>
                        Transport ₹{mkt.transportCost} • Mandi ₹{mkt.mandiCessDeduction}
                      </Text>
                    </View>
                  </View>

                  {/* Operational Metrics Grid */}
                  <View style={styles.metricsGrid}>
                    <View style={styles.metricItem}>
                      <Ionicons
                        name="bus-outline"
                        size={17}
                        color={mkt.gateWaitingMinutes > 60 ? colors.danger : colors.success}
                      />
                      <View>
                        <Text style={styles.metricLabel}>Gate Waiting</Text>
                        <Text
                          style={[
                            styles.metricValue,
                            mkt.gateWaitingMinutes > 60 && { color: colors.danger },
                          ]}
                        >
                          ~{mkt.gateWaitingMinutes} min {mkt.gateWaitingMinutes > 60 && '⚠️'}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.metricItem}>
                      <Ionicons name="calendar-outline" size={17} color={colors.primaryLight} />
                      <View>
                        <Text style={styles.metricLabel}>Daily Quota</Text>
                        <Text style={styles.metricValue}>{mkt.dailySlotsRemaining} slots today</Text>
                      </View>
                    </View>

                    <View style={styles.metricItem}>
                      <Ionicons name="bar-chart-outline" size={17} color={colors.primaryLight} />
                      <View>
                        <Text style={styles.metricLabel}>Market Demand</Text>
                        <Text style={styles.metricValue}>{mkt.openDemandQuintals} QTL open</Text>
                      </View>
                    </View>

                    <View style={styles.metricItem}>
                      <Ionicons name="people-outline" size={17} color={colors.primaryLight} />
                      <View>
                        <Text style={styles.metricLabel}>Yard Crowd</Text>
                        <Text style={styles.metricValue}>{mkt.queueCongestion} Density</Text>
                      </View>
                    </View>
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.actionsRow}>
                    <TouchableOpacity
                      style={styles.breakdownBtn}
                      onPress={() => setBreakdownModalMarket(mkt)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="receipt-outline" size={17} color={colors.textPrimary} />
                      <Text style={styles.breakdownBtnText}>Breakdown</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.requestSlotBtn}
                      onPress={() => navigation.navigate('BookSlot', { marketId: mkt.id })}
                      activeOpacity={0.88}
                    >
                      <Ionicons name="ticket-outline" size={18} color={colors.onPrimary} />
                      <Text style={styles.requestSlotBtnText}>Request Slot</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Breakdown Details Modal */}
      {breakdownModalMarket && (
        <ConfirmationModal
          visible={!!breakdownModalMarket}
          title={`${breakdownModalMarket.name} Breakdown`}
          message={`Gross Price: ₹${breakdownModalMarket.grossPricePerQuintal}/QTL (₹${(
            breakdownModalMarket.grossPricePerQuintal * 20
          ).toLocaleString('en-IN')} for 20 QTL)\n\n• Transport Cost: -₹${
            breakdownModalMarket.transportCost
          } (${breakdownModalMarket.distanceKm} km)\n• Mandi Cess & Fee: -₹${
            breakdownModalMarket.mandiCessDeduction
          }\n\nNet Realization: ₹${breakdownModalMarket.expectedNetPayout.toLocaleString(
            'en-IN'
          )} (₹${breakdownModalMarket.netRatePerQuintal}/QTL)\n\nGate Queue Delay: ~${
            breakdownModalMarket.gateWaitingMinutes
          } mins`}
          confirmText="Book at this Mandi"
          cancelText="Close"
          iconName="receipt-outline"
          onConfirm={() => {
            const mId = breakdownModalMarket.id;
            setBreakdownModalMarket(null);
            navigation.navigate('BookSlot', { marketId: mId });
          }}
          onCancel={() => setBreakdownModalMarket(null)}
        />
      )}
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
  contextHeader: {
    gap: 4,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lotContextTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  lotContextText: {
    ...typography.badgeLabel,
    color: colors.textPrimary,
  },
  changeLotBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  changeLotText: {
    ...typography.captionBold,
    color: colors.primaryLight,
  },
  mainTitle: {
    ...typography.headlineXlMobile,
    color: colors.textPrimary,
    marginTop: 2,
  },
  subTitle: {
    ...typography.bodyBase,
    color: colors.textSecondary,
  },
  explainerBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.spaceSm,
    backgroundColor: colors.infoTint,
    borderRadius: radius.xl,
    padding: spacing.spaceMd,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  explainerIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  explainerTextContainer: {
    flex: 1,
  },
  explainerTitle: {
    ...typography.captionBold,
    color: colors.info,
  },
  explainerBody: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  sortChipsRow: {
    flexDirection: 'row',
    gap: spacing.spaceXs,
    paddingVertical: 2,
  },
  sortChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
  },
  sortChipActive: {
    backgroundColor: colors.primaryLight,
  },
  sortChipText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  sortChipTextActive: {
    color: colors.onPrimary,
  },
  cardsStream: {
    gap: spacing.spaceMd,
  },
  mandiCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  mandiCardRecommended: {
    ...shadows.md,
    borderColor: colors.primaryLight,
  },
  topPickStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.success,
    paddingHorizontal: spacing.spaceMd,
    paddingVertical: 7,
  },
  topPickLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  topPickText: {
    ...typography.badgeLabel,
    color: colors.onPrimary,
    letterSpacing: 0.5,
  },
  topPickBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  topPickBadgeText: {
    ...typography.captionBold,
    color: colors.onPrimary,
    fontSize: 10,
  },
  mandiCardBody: {
    padding: spacing.spaceMd,
    gap: spacing.spaceSm,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  mandiNameText: {
    ...typography.headlineLg,
    color: colors.textPrimary,
    marginTop: 2,
  },
  gateStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  gatePillSuccess: {
    backgroundColor: colors.successTint,
  },
  gatePillDanger: {
    backgroundColor: colors.dangerTint,
  },
  gatePillInfo: {
    backgroundColor: colors.infoTint,
  },
  gateDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  gateStatusText: {
    ...typography.captionBold,
    fontSize: 11,
  },
  netBox: {
    borderRadius: radius.lg,
    padding: spacing.spaceSm,
    gap: 4,
  },
  netBoxSuccess: {
    backgroundColor: colors.successTint,
  },
  netBoxNeutral: {
    backgroundColor: colors.surfaceContainerLow,
  },
  netBoxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  netBoxLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  netRateTag: {
    ...typography.captionBold,
  },
  netAmountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  netAmountText: {
    ...typography.currencyDisplayMobile,
    fontWeight: '700',
  },
  netAmountSub: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  netRationale: {
    ...typography.caption,
    lineHeight: 16,
    marginTop: 2,
  },
  breakdownStrip: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.md,
    padding: spacing.spaceSm,
    gap: spacing.spaceSm,
  },
  breakdownCol: {
    flex: 1,
  },
  breakdownLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  breakdownValue: {
    ...typography.bodyBaseMedium,
    color: colors.textPrimary,
    fontWeight: '600',
    marginTop: 2,
  },
  breakdownSub: {
    ...typography.caption,
    color: colors.textSecondary,
    fontWeight: '400',
  },
  breakdownTotal: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.spaceXs,
  },
  metricItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.md,
    padding: 8,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
  },
  metricValue: {
    ...typography.captionBold,
    color: colors.textPrimary,
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.spaceSm,
    marginTop: 4,
  },
  breakdownBtn: {
    flex: 1,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainerHigh,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  breakdownBtnText: {
    ...typography.bodyBaseMedium,
    color: colors.textPrimary,
  },
  requestSlotBtn: {
    flex: 1.6,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    ...shadows.primaryAction,
  },
  requestSlotBtnText: {
    ...typography.bodyBaseMedium,
    color: colors.onPrimary,
    fontWeight: '600',
  },
});
