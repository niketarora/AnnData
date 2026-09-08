import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { useAppStore } from '../../store';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { FarmerStackParamList } from '../../types';

export const FarmerCheckInScreen: React.FC = () => {
  const [state] = useAppStore();
  const navigation = useNavigation<NativeStackNavigationProp<FarmerStackParamList>>();

  return (
    <View style={styles.container}>
      <AppHeader
        title="Mandi Gate Check-In"
        subtitle="Arrival Confirmed"
        showBack={false}
        onNotificationPress={() => navigation.navigate('Notifications')}
        onProfilePress={() => navigation.navigate('FarmerProfile')}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.checkedInBadgeCircle}>
          <Ionicons name="checkmark-done-circle" size={56} color={colors.success} />
        </View>

        <Text style={styles.title}>Gate Check-In Verified!</Text>
        <Text style={styles.subtitle}>
          Vehicle HR-05-AB-4812 cleared Gate 2 Express Line at 03:42 PM.
        </Text>

        {/* Assigned Bay Card */}
        <View style={styles.bayCard}>
          <View style={styles.bayHeader}>
            <Text style={styles.bayLabel}>ASSIGNED INSPECTION BAY</Text>
            <View style={styles.activePill}>
              <Text style={styles.activePillText}>READY FOR UNLOADING</Text>
            </View>
          </View>

          <Text style={styles.bayNumber}>Bay #03</Text>
          <Text style={styles.baySub}>Quality Assaying Platform • Taraori Mandi</Text>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Token Number</Text>
            <Text style={styles.infoValue}>#{state.queue.tokenNumber}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Assigned Weighbridge</Text>
            <Text style={[styles.infoValue, { color: colors.primaryDark, fontWeight: '700' }]}>
              Electronic Scale #2
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mandi Inspector</Text>
            <Text style={styles.infoValue}>Ramesh Verma (Inspector #14)</Text>
          </View>
        </View>

        {/* Step Guide */}
        <View style={styles.instructionsBox}>
          <Text style={styles.instructionTitle}>Next Steps:</Text>
          <View style={styles.stepItem}>
            <Text style={styles.stepNum}>1.</Text>
            <Text style={styles.stepText}>Park tractor trolley at Bay #03 for physical sampling.</Text>
          </View>
          <View style={styles.stepItem}>
            <Text style={styles.stepNum}>2.</Text>
            <Text style={styles.stepText}>Inspector verifies moisture meter and admixture %.</Text>
          </View>
          <View style={styles.stepItem}>
            <Text style={styles.stepNum}>3.</Text>
            <Text style={styles.stepText}>Proceed directly onto Scale #2 for digital gross weighment.</Text>
          </View>
        </View>

        {/* Action Button */}
        <PrimaryButton
          title="View Physical Quality Inspection"
          iconName="eye-outline"
          onPress={() => navigation.navigate('PhysicalInspectionResult', { bookingId: state.activeBookingId })}
        />
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
  checkedInBadgeCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.successTint,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.spaceMd,
  },
  title: {
    ...typography.headlineXlMobile,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.bodyBase,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },
  bayCard: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.spaceXl,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
    alignItems: 'center',
  },
  bayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  bayLabel: {
    ...typography.badgeLabel,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  activePill: {
    backgroundColor: colors.successTint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  activePillText: {
    ...typography.badgeLabel,
    color: colors.success,
  },
  bayNumber: {
    ...typography.currencyDisplay,
    color: colors.primaryDark,
    fontSize: 40,
    marginVertical: 4,
  },
  baySub: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.spaceMd,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 3,
  },
  infoLabel: {
    ...typography.bodyBase,
    color: colors.textSecondary,
  },
  infoValue: {
    ...typography.bodyBaseMedium,
    color: colors.textPrimary,
  },
  instructionsBox: {
    width: '100%',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
    padding: spacing.spaceMd,
    gap: 8,
  },
  instructionTitle: {
    ...typography.captionBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  stepNum: {
    ...typography.bodyBaseMedium,
    color: colors.primaryLight,
    fontWeight: '700',
  },
  stepText: {
    ...typography.caption,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 18,
  },
});
