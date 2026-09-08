import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { useAppStore } from '../../store';
import { AppHeader } from '../../components/common/AppHeader';
import { MetricCard } from '../../components/common/MetricCard';
import { StatusChip } from '../../components/common/StatusChip';
import { BuyerStackParamList } from '../../types';
import { navigationRef } from '../../navigation/RootNavigator';

export const BuyerDashboardScreen: React.FC = () => {
  const [state, store] = useAppStore();
  const navigation = useNavigation<NativeStackNavigationProp<BuyerStackParamList>>();

  const buyer = state.buyer;
  const activeLot = state.lots[0];

  return (
    <View style={styles.container}>
      <AppHeader
        title="Mandi Control Centre"
        subtitle={buyer.marketName}
        onNotificationPress={() => navigation.navigate('BuyerNotifications')}
        onProfilePress={() => navigation.navigate('BuyerProfile')}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Mandi Operator Header Card */}
        <View style={styles.headerCard}>
          <View style={styles.operatorRow}>
            <View>
              <Text style={styles.operatorGreeting}>Today's Procurement Terminal</Text>
              <Text style={styles.terminalDetails}>
                {buyer.marketName} • {buyer.counterId} • {buyer.mandiGate}
              </Text>
            </View>
            <View style={styles.terminalStatusPill}>
              <View style={styles.pulseDot} />
              <Text style={styles.terminalStatusText}>TERMINAL ACTIVE</Text>
            </View>
          </View>
        </View>

        {/* Quick Portal Switcher to Farmer Mode */}
        <TouchableOpacity
          style={styles.portalSwitchBanner}
          onPress={() => {
            store.setRole('FARMER');
            if (navigationRef.isReady()) {
              navigationRef.navigate('FarmerRoot');
            }
          }}
          activeOpacity={0.85}
        >
          <View style={styles.portalSwitchLeft}>
            <View style={styles.portalSwitchIcon}>
              <Ionicons name="person" size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.portalSwitchTitle}>Switch to Kisan (Farmer) Portal</Text>
              <Text style={styles.portalSwitchSub}>View lots, market intelligence, and true net realization</Text>
            </View>
          </View>
          <Ionicons name="arrow-forward" size={18} color={colors.primary} />
        </TouchableOpacity>

        {/* Primary Operational KPIs 2x2 + Big Total */}
        <View style={styles.kpiGrid}>
          <MetricCard
            title="Today's Expected Lots"
            value="124"
            subtitle="37 Gate Arrivals cleared"
            iconName="cube-outline"
            style={{ width: '48%' }}
          />

          <MetricCard
            title="Active Queue Load"
            value={`${state.queue.totalQueueLoad} Lots`}
            subtitle={`Avg ${state.queue.avgLotClearMinutes}m clear time`}
            iconName="speedometer-outline"
            badgeText={state.queue.delayMinutes > 0 ? `+${state.queue.delayMinutes}m Delay` : 'Normal'}
            badgeVariant={state.queue.delayMinutes > 0 ? 'warning' : 'success'}
            style={{ width: '48%' }}
          />

          <MetricCard
            title="Pending Inspection"
            value="3 Lots"
            subtitle="Bay #03 active"
            iconName="flask-outline"
            badgeText="Bay Active"
            style={{ width: '48%' }}
          />

          <MetricCard
            title="Procurement Value"
            value="₹16.42L"
            subtitle="680 QTL procured today"
            iconName="cash-outline"
            badgeText="68% Quota"
            highlightBandColor={colors.success}
            style={{ width: '48%' }}
          />
        </View>

        {/* Operational Quick Controls Strip */}
        <View style={styles.quickControlsCard}>
          <Text style={styles.sectionLabel}>QUEUE & INFLOW OPERATIONAL CONTROLS</Text>
          <View style={styles.controlsRow}>
            <TouchableOpacity
              style={[styles.controlBtn, { backgroundColor: colors.warningTint }]}
              onPress={() => store.addQueueDelay(20)}
            >
              <Ionicons name="time-outline" size={18} color={colors.warning} />
              <Text style={[styles.controlBtnText, { color: colors.warningDark }]}>
                Add +20m Gate Delay
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.controlBtn, { backgroundColor: colors.successTint }]}
              onPress={() => store.clearQueueDelay()}
            >
              <Ionicons name="flash-outline" size={18} color={colors.success} />
              <Text style={[styles.controlBtnText, { color: colors.successDark }]}>
                Clear Delay (Leave Now)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Currently Serving & Next In Line Banner */}
        <View style={styles.queueBannerCard}>
          <View style={styles.queueBannerHeader}>
            <Text style={styles.sectionLabel}>LIVE GATE & WEIGHBRIDGE QUEUE</Text>
            <TouchableOpacity onPress={() => navigation.navigate('QueueControlPanel')}>
              <Text style={styles.viewAllText}>Queue Control →</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.queueItemHighlight}>
            <View style={styles.queueLeft}>
              <View style={styles.tokenBox}>
                <Text style={styles.tokenBoxLabel}>SERVING</Text>
                <Text style={styles.tokenBoxNum}>#MKT-B-139</Text>
              </View>
              <View>
                <Text style={styles.queueFarmerName}>Gurdeep Singh</Text>
                <Text style={styles.queueCropDetails}>Paddy (Basmati 1121) • 35 QTL</Text>
              </View>
            </View>
            <StatusChip label="ON WEIGHBRIDGE" variant="info" />
          </View>

          <View style={styles.queueItemNext}>
            <View style={styles.queueLeft}>
              <View style={[styles.tokenBox, { backgroundColor: colors.surfaceContainer }]}>
                <Text style={styles.tokenBoxLabel}>NEXT</Text>
                <Text style={styles.tokenBoxNum}>#MKT-B-142</Text>
              </View>
              <View>
                <Text style={styles.queueFarmerName}>Rajesh Kumar</Text>
                <Text style={styles.queueCropDetails}>Wheat (Sharbati) • 20 QTL</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.callNextBtn}
              onPress={() => navigation.navigate('PhysicalInspectionStation', { bookingId: 'booking-b142' })}
            >
              <Text style={styles.callNextText}>Inspect Bay 3</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Incoming Farmer Lots Section */}
        <View style={styles.incomingSection}>
          <View style={styles.incomingHeader}>
            <Text style={styles.sectionLabel}>INCOMING HARVEST LOTS</Text>
            <TouchableOpacity onPress={() => navigation.navigate('IncomingLots')}>
              <Text style={styles.viewAllText}>View All ({state.lots.length}) →</Text>
            </TouchableOpacity>
          </View>

          {state.lots.slice(0, 2).map((lot) => (
            <TouchableOpacity
              key={lot.id}
              style={styles.lotItemCard}
              onPress={() => navigation.navigate('BuyerLotDetails', { lotId: lot.id })}
              activeOpacity={0.88}
            >
              <View style={styles.lotItemTop}>
                <View>
                  <Text style={styles.lotItemFarmer}>{lot.farmerName}</Text>
                  <Text style={styles.lotItemCommodity}>{lot.crop} ({lot.variety}) • {lot.quantityQuintals} Quintals</Text>
                </View>
                <StatusChip
                  label={lot.status.replace('_', ' ')}
                  variant={
                    lot.status === 'GATE_CHECKED_IN'
                      ? 'info'
                      : lot.status === 'PAID'
                      ? 'success'
                      : 'warning'
                  }
                />
              </View>

              <View style={styles.lotItemFooter}>
                <Text style={styles.lotPreGrade}>
                  AI Pre-Grade: <Text style={{ color: colors.success, fontWeight: '700' }}>Grade A</Text> (88/100)
                </Text>
                <Text style={styles.reviewActionText}>Review Lot Details →</Text>
              </View>
            </TouchableOpacity>
          ))}
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
    paddingBottom: 60,
  },
  headerCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.spaceMd,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  operatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  operatorGreeting: {
    ...typography.headlineMd,
    color: colors.textPrimary,
  },
  terminalDetails: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  terminalStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.successTint,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  terminalStatusText: {
    ...typography.badgeLabel,
    color: colors.success,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.spaceSm,
  },
  quickControlsCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.spaceMd,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
    gap: spacing.spaceSm,
  },
  sectionLabel: {
    ...typography.badgeLabel,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  controlsRow: {
    flexDirection: 'row',
    gap: spacing.spaceSm,
  },
  controlBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: radius.lg,
  },
  controlBtnText: {
    ...typography.captionBold,
  },
  queueBannerCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.spaceMd,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
    gap: spacing.spaceSm,
  },
  queueBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewAllText: {
    ...typography.captionBold,
    color: colors.primaryLight,
  },
  queueItemHighlight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
    padding: spacing.spaceSm,
  },
  queueItemNext: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.spaceSm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  queueLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tokenBox: {
    backgroundColor: colors.primaryTint,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  tokenBoxLabel: {
    ...typography.badgeLabel,
    fontSize: 9,
    color: colors.primaryDark,
  },
  tokenBoxNum: {
    ...typography.captionBold,
    color: colors.primaryDark,
  },
  queueFarmerName: {
    ...typography.bodyBaseMedium,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  queueCropDetails: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  callNextBtn: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.md,
  },
  callNextText: {
    ...typography.captionBold,
    color: colors.onPrimary,
  },
  incomingSection: {
    gap: spacing.spaceSm,
  },
  incomingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lotItemCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.spaceMd,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
    gap: 6,
  },
  lotItemTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  lotItemFarmer: {
    ...typography.titleCard,
    color: colors.textPrimary,
  },
  lotItemCommodity: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  lotItemFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.spaceXs,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    marginTop: 4,
  },
  lotPreGrade: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  reviewActionText: {
    ...typography.captionBold,
    color: colors.primaryLight,
  },
  portalSwitchBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: radius.lg,
    padding: spacing.spaceMd,
    marginTop: spacing.spaceMd,
  },
  portalSwitchLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceMd,
    flex: 1,
  },
  portalSwitchIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  portalSwitchTitle: {
    ...typography.bodyBaseMedium,
    color: '#166534',
    fontWeight: '600',
  },
  portalSwitchSub: {
    ...typography.caption,
    color: '#15803D',
    marginTop: 1,
  },
});
