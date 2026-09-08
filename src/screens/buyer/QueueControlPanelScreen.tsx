import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { useAppStore } from '../../store';
import { AppHeader } from '../../components/common/AppHeader';
import { StatusChip } from '../../components/common/StatusChip';
import { BuyerStackParamList } from '../../types';

export const QueueControlPanelScreen: React.FC = () => {
  const [state, store] = useAppStore();
  const navigation = useNavigation<NativeStackNavigationProp<BuyerStackParamList>>();

  const handleCallLot = () => {
    store.clearQueueDelay();
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Live Queue Control"
        subtitle="Weighbridge & Gate Dispatch"
        showBack
        onBack={() => navigation.goBack()}
        onNotificationPress={() => navigation.navigate('BuyerNotifications')}
        onProfilePress={() => navigation.navigate('BuyerProfile')}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Terminal Status Strip */}
        <View style={styles.statusStrip}>
          <View style={styles.statusLeft}>
            <View style={styles.dot} />
            <Text style={styles.statusText}>
              Inflow Counter 4 • {state.queue.delayMinutes > 0 ? `+${state.queue.delayMinutes}m Gate Delay` : 'Operating at Velocity'}
            </Text>
          </View>
          <Text style={styles.queueTotalText}>{state.queue.totalQueueLoad} Total Queue</Text>
        </View>

        {/* Now Serving Card */}
        <View style={styles.servingCard}>
          <View style={styles.servingHeader}>
            <Text style={styles.cardHeaderLabel}>CURRENTLY ON WEIGHBRIDGE</Text>
            <View style={styles.weighPill}>
              <Ionicons name="speedometer" size={13} color={colors.info} />
              <Text style={styles.weighPillText}>Scale #2 Active</Text>
            </View>
          </View>

          <View style={styles.servingMain}>
            <View style={styles.servingTokenCircle}>
              <Text style={styles.tokenLabel}>TOKEN</Text>
              <Text style={styles.tokenNum}>{state.queue.currentServingToken}</Text>
            </View>
            <View style={styles.servingDetails}>
              <Text style={styles.servingFarmer}>Gurdeep Singh</Text>
              <Text style={styles.servingCrop}>Paddy (Basmati 1121) • 35 Quintals</Text>
              <Text style={styles.servingCarrier}>Tractor PB-02-CD-9124 • Bay #02</Text>
            </View>
          </View>

          <View style={styles.servingActions}>
            <TouchableOpacity
              style={styles.completeWeighBtn}
              onPress={() => store.callNextLot()}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-done" size={18} color={colors.onPrimary} />
              <Text style={styles.completeWeighText}>Complete Weighment & Call Next</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Delay & Dispatch Operational Controls */}
        <View style={styles.controlsCard}>
          <Text style={styles.cardHeaderLabel}>GATE VELOCITY & DELAY CONTROLS</Text>
          <Text style={styles.controlsDesc}>
            Adjusting gate delay automatically broadcasts WAIT or LEAVE NOW state signals to farmer devices.
          </Text>

          <View style={styles.delayButtonsRow}>
            <TouchableOpacity
              style={styles.delayBtn}
              onPress={() => store.addQueueDelay(10)}
            >
              <Text style={styles.delayBtnText}>+10 min</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.delayBtn, { backgroundColor: colors.warningTint }]}
              onPress={() => store.addQueueDelay(20)}
            >
              <Text style={[styles.delayBtnText, { color: colors.warningDark }]}>+20 min</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.delayBtn, { backgroundColor: colors.dangerTint }]}
              onPress={() => store.addQueueDelay(30)}
            >
              <Text style={[styles.delayBtnText, { color: colors.dangerDark }]}>+30 min</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.delayBtn, { backgroundColor: colors.successTint }]}
              onPress={() => store.clearQueueDelay()}
            >
              <Ionicons name="flash" size={14} color={colors.success} />
              <Text style={[styles.delayBtnText, { color: colors.successDark }]}>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Next Farmers in Queue */}
        <View style={styles.queueListSection}>
          <Text style={styles.cardHeaderLabel}>NEXT FARMERS IN INFLOW QUEUE</Text>

          {/* Item 1: Rajesh Kumar */}
          <View style={styles.queueRowCard}>
            <View style={styles.queueTokenCol}>
              <Text style={styles.qTokenNum}>#{state.queue.tokenNumber}</Text>
              <Text style={styles.qPos}>Pos #01</Text>
            </View>

            <View style={styles.qFarmerCol}>
              <Text style={styles.qFarmerName}>{state.farmer.name}</Text>
              <Text style={styles.qCropDetails}>Wheat (Sharbati) • 20 Quintals</Text>
              <Text style={styles.qStatusNotice}>
                {state.queue.departureState === 'ARRIVED'
                  ? '✓ Arrived at Gate 2 • Inflow Bay 3'
                  : state.queue.departureState === 'LEAVE_NOW'
                  ? 'En route (~18m transit)'
                  : 'Waiting at farm shed'}
              </Text>
            </View>

            <View style={styles.qActionsCol}>
              <TouchableOpacity
                style={styles.inspectQuickBtn}
                onPress={() =>
                  navigation.navigate('PhysicalInspectionStation', {
                    bookingId: state.activeBookingId,
                  })
                }
              >
                <Ionicons name="flask-outline" size={15} color={colors.onPrimary} />
                <Text style={styles.inspectQuickText}>Inspect</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.callFarmerQuickBtn}
                onPress={handleCallLot}
              >
                <Text style={styles.callFarmerQuickText}>Call Now</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Item 2: Harpreet Kaur */}
          <View style={styles.queueRowCard}>
            <View style={styles.queueTokenCol}>
              <Text style={styles.qTokenNum}>#MKT-B-143</Text>
              <Text style={styles.qPos}>Pos #02</Text>
            </View>
            <View style={styles.qFarmerCol}>
              <Text style={styles.qFarmerName}>Harpreet Kaur</Text>
              <Text style={styles.qCropDetails}>Wheat (HD-2967) • 40 Quintals</Text>
              <Text style={styles.qStatusNotice}>Assigned slot: 04:00 – 04:30 PM</Text>
            </View>
            <StatusChip label="QUEUED" variant="neutral" />
          </View>

          {/* Item 3: Baljit Singh */}
          <View style={styles.queueRowCard}>
            <View style={styles.queueTokenCol}>
              <Text style={styles.qTokenNum}>#MKT-B-144</Text>
              <Text style={styles.qPos}>Pos #03</Text>
            </View>
            <View style={styles.qFarmerCol}>
              <Text style={styles.qFarmerName}>Baljit Singh</Text>
              <Text style={styles.qCropDetails}>Mustard (Pusa Bold) • 15 Quintals</Text>
              <Text style={styles.qStatusNotice}>Assigned slot: 04:30 – 05:00 PM</Text>
            </View>
            <StatusChip label="QUEUED" variant="neutral" />
          </View>
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
  statusStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.card,
    padding: spacing.spaceSm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.success,
  },
  statusText: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  queueTotalText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  servingCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.spaceMd,
    borderWidth: 1.5,
    borderColor: colors.info,
    ...shadows.md,
    gap: spacing.spaceSm,
  },
  servingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardHeaderLabel: {
    ...typography.badgeLabel,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  weighPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.infoTint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  weighPillText: {
    ...typography.badgeLabel,
    color: colors.info,
  },
  servingMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceSm,
  },
  servingTokenCircle: {
    width: 68,
    height: 68,
    borderRadius: radius.lg,
    backgroundColor: colors.infoTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tokenLabel: {
    ...typography.badgeLabel,
    fontSize: 9,
    color: colors.info,
  },
  tokenNum: {
    ...typography.captionBold,
    color: colors.info,
  },
  servingDetails: {
    flex: 1,
    gap: 2,
  },
  servingFarmer: {
    ...typography.headlineMd,
    color: colors.textPrimary,
  },
  servingCrop: {
    ...typography.bodyBaseMedium,
    color: colors.textPrimary,
  },
  servingCarrier: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  servingActions: {
    marginTop: 4,
  },
  completeWeighBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.primaryLight,
    height: 46,
    borderRadius: radius.lg,
    ...shadows.primaryAction,
  },
  completeWeighText: {
    ...typography.bodyBaseMedium,
    color: colors.onPrimary,
    fontWeight: '600',
  },
  controlsCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.spaceMd,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
    gap: spacing.spaceSm,
  },
  controlsDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  delayButtonsRow: {
    flexDirection: 'row',
    gap: spacing.spaceXs,
    marginTop: 2,
  },
  delayBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    height: 42,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainer,
  },
  delayBtnText: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  queueListSection: {
    gap: spacing.spaceSm,
  },
  queueRowCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.spaceSm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
    gap: spacing.spaceSm,
  },
  queueTokenCol: {
    alignItems: 'center',
    backgroundColor: colors.surfaceContainerLow,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: radius.md,
    minWidth: 70,
  },
  qTokenNum: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  qPos: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 10,
  },
  qFarmerCol: {
    flex: 1,
    gap: 1,
  },
  qFarmerName: {
    ...typography.bodyBaseMedium,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  qCropDetails: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  qStatusNotice: {
    ...typography.caption,
    color: colors.primaryDark,
    marginTop: 1,
  },
  qActionsCol: {
    gap: 4,
  },
  inspectQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  inspectQuickText: {
    ...typography.captionBold,
    color: colors.onPrimary,
    fontSize: 11,
  },
  callFarmerQuickBtn: {
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.sm,
    alignItems: 'center',
  },
  callFarmerQuickText: {
    ...typography.captionBold,
    color: colors.textSecondary,
    fontSize: 10,
  },
});
