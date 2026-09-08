import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { useAppStore } from '../../store';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SecondaryButton } from '../../components/common/SecondaryButton';
import { FarmerStackParamList } from '../../types';

export const BookingConfirmationScreen: React.FC = () => {
  const [state] = useAppStore();
  const navigation = useNavigation<NativeStackNavigationProp<FarmerStackParamList>>();
  const route = useRoute<RouteProp<FarmerStackParamList, 'BookingConfirmation'>>();

  const booking = state.bookings[0];

  return (
    <View style={styles.container}>
      <AppHeader
        title="Booking Confirmed"
        showBack={false}
        onNotificationPress={() => navigation.navigate('Notifications')}
        onProfilePress={() => navigation.navigate('FarmerProfile')}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Success Header Icon */}
        <View style={styles.successIconCircle}>
          <Ionicons name="checkmark-circle" size={48} color={colors.success} />
        </View>

        <Text style={styles.successHeading}>Slot Successfully Reserved!</Text>
        <Text style={styles.successSubheading}>
          Your Mandi digital token and priority express gate pass have been issued.
        </Text>

        {/* Hero Token Card */}
        <View style={styles.tokenCard}>
          <Text style={styles.tokenLabel}>YOUR MANDI GATE TOKEN</Text>
          <Text style={styles.tokenNumber}>#{booking?.tokenNumber || 'MKT-B-142'}</Text>
          <View style={styles.statusPill}>
            <View style={styles.dot} />
            <Text style={styles.statusPillText}>CONFIRMED & QUEUED</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.detailsGrid}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Destination</Text>
              <Text style={styles.detailValue}>{booking?.marketName || 'Taraori APMC Mandi'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Assigned Inflow</Text>
              <Text style={[styles.detailValue, { color: colors.success }]}>
                {booking?.assignedGate || 'Gate 2 Express Line'}
              </Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Scheduled Window</Text>
              <Text style={styles.detailValue}>{booking?.scheduledSlot || '3:30 – 4:00 PM'}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Carrier</Text>
              <Text style={styles.detailValue}>{booking?.vehicleNumber || 'HR-05-AB-4812'}</Text>
            </View>
          </View>
        </View>

        {/* Departure Notice Box */}
        <View style={styles.noticeBox}>
          <Ionicons name="information-circle-outline" size={22} color={colors.info} />
          <View style={styles.noticeContent}>
            <Text style={styles.noticeTitle}>Smart Departure Guidance</Text>
            <Text style={styles.noticeText}>
              Do not leave your farm immediately. Our Live Queue system monitors weighbridge throughput and will notify you when to leave.
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <PrimaryButton
            title="Open Live Mandi Queue & Gate Pass"
            iconName="speedometer-outline"
            onPress={() => navigation.navigate('LiveMandiQueue', { bookingId: booking?.id })}
          />
          <SecondaryButton
            title="Return to Home Dashboard"
            onPress={() => navigation.navigate('FarmerHome')}
          />
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
    alignItems: 'center',
    gap: spacing.spaceMd,
    paddingBottom: 60,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.successTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.spaceMd,
  },
  successHeading: {
    ...typography.headlineXlMobile,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  successSubheading: {
    ...typography.bodyBase,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },
  tokenCard: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.spaceXl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  tokenLabel: {
    ...typography.badgeLabel,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  tokenNumber: {
    ...typography.currencyDisplay,
    color: colors.primaryDark,
    fontSize: 34,
    marginVertical: 4,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.successTint,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  statusPillText: {
    ...typography.badgeLabel,
    color: colors.success,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.spaceMd,
  },
  detailsGrid: {
    width: '100%',
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  detailLabel: {
    ...typography.bodyBase,
    color: colors.textSecondary,
  },
  detailValue: {
    ...typography.bodyBaseMedium,
    color: colors.textPrimary,
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.spaceSm,
    backgroundColor: colors.infoTint,
    borderRadius: radius.lg,
    padding: spacing.spaceMd,
    width: '100%',
  },
  noticeContent: {
    flex: 1,
  },
  noticeTitle: {
    ...typography.captionBold,
    color: colors.info,
  },
  noticeText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 18,
  },
  actionsContainer: {
    width: '100%',
    gap: spacing.spaceSm,
    marginTop: spacing.spaceXs,
  },
});
