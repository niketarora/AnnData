import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { useAppStore } from '../../store';
import { AppHeader } from '../../components/common/AppHeader';
import { DecisionBanner } from '../../components/decision/DecisionBanner';
import { GatePassQR } from '../../components/queue/GatePassQR';
import { StepProgressBar } from '../../components/queue/StepProgressBar';
import { ConfirmationModal } from '../../components/feedback/ConfirmationModal';
import { FarmerStackParamList } from '../../types';

export const LiveMandiQueueScreen: React.FC = () => {
  const [state, store] = useAppStore();
  const navigation = useNavigation<NativeStackNavigationProp<FarmerStackParamList>>();
  const [checkInModalVisible, setCheckInModalVisible] = useState(false);

  const isLeaveNow = state.queue.departureState === 'LEAVE_NOW';
  const isArrived = state.queue.departureState === 'ARRIVED';

  const handleStartNavigation = () => {
    if (isLeaveNow || isArrived) {
      navigation.navigate('TransitNavigation', { bookingId: state.activeBookingId });
    }
  };

  const handleSimulateCheckIn = () => {
    store.checkInFarmer();
    setCheckInModalVisible(false);
    navigation.navigate('FarmerCheckIn', { bookingId: state.activeBookingId });
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Live Queue & Gate Pass"
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
        {/* Header Context Badge */}
        <View style={styles.headerContext}>
          <View style={styles.liveSyncBadge}>
            <View style={styles.livePulseDot} />
            <Text style={styles.liveSyncBadgeText}>LIVE MANDI LINK ACTIVE</Text>
          </View>
          <Text style={styles.pageTitle}>Live Queue & Gate Pass</Text>
          <Text style={styles.mandiTokenSub}>
            Taraori Mandi (Market B) • Token #{state.queue.tokenNumber}
          </Text>
        </View>

        {/* Realtime Decision Banner */}
        <DecisionBanner
          departureState={state.queue.departureState}
          delayMinutes={state.queue.delayMinutes}
          revisedDepartureTime={state.queue.revisedDepartureTime}
          gateNotice={state.queue.gateNotice.message}
          onStateChange={(newState) => store.setDepartureState(newState)}
          showSimulator={true}
        />

        {/* Live Queue Velocity Visualizer Card */}
        <View style={styles.velocityCard}>
          <View style={styles.slotDetailsRow}>
            <View>
              <Text style={styles.slotLabel}>Your Assigned Slot</Text>
              <Text style={styles.lotName}>Lot #B-142 • Sharbati Wheat</Text>
              <Text style={styles.vehicleText}>20 Quintals • Tractor HR-05-AB</Text>
            </View>
            <View style={styles.positionRight}>
              <Text style={styles.positionLabel}>Position in Line</Text>
              <Text style={styles.lotsAheadNumber}>
                {state.queue.lotsAhead > 0 ? `${state.queue.lotsAhead} Lots Ahead` : 'Now Serving!'}
              </Text>
              <Text style={styles.totalLoadText}>{state.queue.totalQueueLoad} total queue load</Text>
            </View>
          </View>

          {/* Metric Sub-strip */}
          <View style={styles.metricSubStrip}>
            <View style={styles.metricSubCol}>
              <Text style={styles.subColLabel}>Estimated Weighment</Text>
              <Text style={styles.subColValue}>{state.queue.estimatedWeighmentTime}</Text>
            </View>
            <View style={styles.metricSubCol}>
              <Text style={styles.subColLabel}>Avg Lot Clear Time</Text>
              <Text style={styles.subColValue}>{state.queue.avgLotClearMinutes} mins</Text>
            </View>
          </View>

          {/* Visual 6-Step Journey Tracker */}
          <StepProgressBar steps={state.queue.journeySteps} />
        </View>

        {/* Digital Token & Contactless Gate Pass Card */}
        <View style={styles.passWrapper}>
          <GatePassQR
            tokenNumber={state.queue.tokenNumber}
            gateName="Gate 2 Express Line"
            windowTime="3:30–4:00 PM (4:15 PM Adjusted)"
          />

          {/* Action Buttons */}
          <View style={styles.passActions}>
            <TouchableOpacity
              style={[
                styles.navActionButton,
                (!isLeaveNow && !isArrived) && styles.navActionButtonLocked,
              ]}
              onPress={handleStartNavigation}
              activeOpacity={0.88}
            >
              <Ionicons
                name="navigate"
                size={19}
                color={(!isLeaveNow && !isArrived) ? colors.textSecondary : colors.onPrimary}
              />
              <Text
                style={[
                  styles.navActionText,
                  (!isLeaveNow && !isArrived) && styles.navActionTextLocked,
                ]}
              >
                {!isLeaveNow && !isArrived
                  ? 'Start Navigation (Locked: Wait at Farm)'
                  : 'Start Live GPS Navigation to Gate 2'}
              </Text>
            </TouchableOpacity>

            {/* Quick Check-in Button */}
            <TouchableOpacity
              style={styles.checkInButton}
              onPress={() => setCheckInModalVisible(true)}
              activeOpacity={0.85}
            >
              <Ionicons name="qr-code-outline" size={18} color={colors.primaryLight} />
              <Text style={styles.checkInButtonText}>I Have Arrived • Scan Gate Pass</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.callOperatorButton}
              onPress={() => Linking.openURL('tel:18001239876')}
              activeOpacity={0.8}
            >
              <Ionicons name="call-outline" size={18} color={colors.primaryLight} />
              <Text style={styles.callOperatorText}>Call Mandi Gate Operator (Counter 4)</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Operator Live Notice Card */}
        <View style={styles.operatorNoticeCard}>
          <View style={styles.noticeIconCircle}>
            <Ionicons name="megaphone-outline" size={20} color={colors.info} />
          </View>
          <View style={styles.noticeContent}>
            <View style={styles.noticeHeader}>
              <Text style={styles.noticeTitle}>YARD NOTICE</Text>
              <Text style={styles.noticeTime}>{state.queue.gateNotice.time}</Text>
            </View>
            <Text style={styles.noticeBody}>{state.queue.gateNotice.message}</Text>
          </View>
        </View>

        {/* Mandi Gate Arrival Cam & Logistics Preview */}
        <View style={styles.cameraFeedCard}>
          <View style={styles.cameraHeader}>
            <View style={styles.cameraLiveDot} />
            <Text style={styles.cameraTitle}>Gate 2 Express Live Camera Feed</Text>
          </View>
          <View style={styles.cameraPlaceholder}>
            <Ionicons name="videocam-outline" size={36} color={colors.textSecondary} />
            <Text style={styles.cameraFeedStatus}>Inflow Lane Clear • Active Scale #2 Ready</Text>
          </View>
        </View>
      </ScrollView>

      {/* Gate Check-in Modal */}
      <ConfirmationModal
        visible={checkInModalVisible}
        title="Check-In at Gate 2"
        message={`Confirm vehicle HR-05-AB arrival at Taraori Mandi Gate 2 Express Line with Token #${state.queue.tokenNumber}?`}
        confirmText="Confirm Check-In"
        cancelText="Cancel"
        iconName="qr-code"
        onConfirm={handleSimulateCheckIn}
        onCancel={() => setCheckInModalVisible(false)}
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
    paddingBottom: 100,
  },
  headerContext: {
    gap: 2,
  },
  liveSyncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  livePulseDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: colors.warning,
  },
  liveSyncBadgeText: {
    ...typography.badgeLabel,
    color: colors.warning,
    letterSpacing: 0.5,
  },
  pageTitle: {
    ...typography.headlineXlMobile,
    color: colors.textPrimary,
    marginTop: 2,
  },
  mandiTokenSub: {
    ...typography.bodyBaseMedium,
    color: colors.textSecondary,
  },
  velocityCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.spaceMd,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
    gap: spacing.spaceSm,
  },
  slotDetailsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  slotLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  lotName: {
    ...typography.titleCard,
    color: colors.textPrimary,
    marginTop: 2,
  },
  vehicleText: {
    ...typography.bodyBase,
    color: colors.textSecondary,
    marginTop: 1,
  },
  positionRight: {
    alignItems: 'flex-end',
  },
  positionLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  lotsAheadNumber: {
    ...typography.headlineMd,
    color: colors.warning,
    fontWeight: '700',
    marginTop: 2,
  },
  totalLoadText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  metricSubStrip: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.md,
    padding: spacing.spaceSm,
    gap: spacing.spaceSm,
  },
  metricSubCol: {
    flex: 1,
  },
  subColLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  subColValue: {
    ...typography.headlineMd,
    color: colors.textPrimary,
    fontWeight: '700',
    marginTop: 2,
  },
  passWrapper: {
    gap: spacing.spaceSm,
  },
  passActions: {
    gap: spacing.spaceSm,
    marginTop: spacing.spaceXs,
  },
  navActionButton: {
    minHeight: spacing.touchMin,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    ...shadows.primaryAction,
  },
  navActionButtonLocked: {
    backgroundColor: colors.surfaceContainerHigh,
    elevation: 0,
    shadowOpacity: 0,
  },
  navActionText: {
    ...typography.bodyBaseMedium,
    color: colors.onPrimary,
    fontWeight: '600',
  },
  navActionTextLocked: {
    color: colors.textSecondary,
  },
  checkInButton: {
    minHeight: spacing.touchMin,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryTint,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  checkInButtonText: {
    ...typography.bodyBaseMedium,
    color: colors.primaryLight,
    fontWeight: '600',
  },
  callOperatorButton: {
    minHeight: spacing.touchMin,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  callOperatorText: {
    ...typography.bodyBaseMedium,
    color: colors.primaryLight,
  },
  operatorNoticeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.spaceSm,
    backgroundColor: colors.infoTint,
    borderRadius: radius.xl,
    padding: spacing.spaceMd,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  noticeIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(37, 99, 235, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noticeContent: {
    flex: 1,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  noticeTitle: {
    ...typography.badgeLabel,
    color: colors.info,
    letterSpacing: 0.5,
  },
  noticeTime: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  noticeBody: {
    ...typography.bodyBase,
    color: colors.textPrimary,
    marginTop: 4,
    lineHeight: 18,
  },
  cameraFeedCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.spaceMd,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  cameraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: spacing.spaceSm,
  },
  cameraLiveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  cameraTitle: {
    ...typography.titleCard,
    color: colors.textPrimary,
  },
  cameraPlaceholder: {
    height: 120,
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  cameraFeedStatus: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
});
