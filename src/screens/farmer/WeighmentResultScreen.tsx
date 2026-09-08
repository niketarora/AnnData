import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { useAppStore } from '../../store';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { FarmerStackParamList } from '../../types';

export const WeighmentResultScreen: React.FC = () => {
  const [state] = useAppStore();
  const navigation = useNavigation<NativeStackNavigationProp<FarmerStackParamList>>();
  const route = useRoute<RouteProp<FarmerStackParamList, 'WeighmentResult'>>();

  const bookingId = route.params?.bookingId || state.activeBookingId;
  const weighment = state.weighments[bookingId] || Object.values(state.weighments)[0];

  return (
    <View style={styles.container}>
      <AppHeader
        title="Weighbridge Slip"
        subtitle="Electronic Scale #2 Verification"
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
        {/* Verified Scale Hero Card */}
        <View style={styles.slipCard}>
          <View style={styles.slipHeader}>
            <View>
              <Text style={styles.slipTitle}>OFFICIAL SCALE SLIP</Text>
              <Text style={styles.slipNumber}>#{weighment?.scaleSlipNumber || 'WB-TAR-2026-9041'}</Text>
            </View>
            <View style={styles.calibratedBadge}>
              <Ionicons name="checkmark-circle" size={14} color={colors.success} />
              <Text style={styles.calibratedText}>Calibrated</Text>
            </View>
          </View>

          {/* Big Net Weight Callout */}
          <View style={styles.netWeightContainer}>
            <Text style={styles.netWeightLabel}>FINAL VERIFIED NET QUANTITY</Text>
            <Text style={styles.netWeightText}>{weighment?.netQuintals || 19.70} Quintals</Text>
            <Text style={styles.netWeightKgText}>
              ({(weighment?.netWeightKg || 1970).toLocaleString('en-IN')} kg net grain)
            </Text>
          </View>

          <View style={styles.divider} />

          {/* Scale Math Breakdown Table */}
          <View style={styles.mathTable}>
            <View style={styles.mathRow}>
              <Text style={styles.mathLabel}>Gross Scale (Tractor + Wheat)</Text>
              <Text style={styles.mathValue}>{(weighment?.grossWeightKg || 5420).toLocaleString('en-IN')} kg</Text>
            </View>

            <View style={styles.mathRow}>
              <Text style={styles.mathLabel}>Tare Weight (Empty Carrier)</Text>
              <Text style={[styles.mathValue, { color: colors.danger }]}>
                -{(weighment?.tareWeightKg || 3450).toLocaleString('en-IN')} kg
              </Text>
            </View>

            <View style={[styles.mathRow, styles.mathRowHighlight]}>
              <Text style={styles.mathLabelBold}>Actual Net Weight</Text>
              <Text style={styles.mathValueBold}>
                {(weighment?.netWeightKg || 1970).toLocaleString('en-IN')} kg (19.70 QTL)
              </Text>
            </View>

            <View style={styles.mathRow}>
              <Text style={styles.mathLabel}>Initial Declared Estimate</Text>
              <Text style={styles.mathValue}>2,000 kg (20.00 QTL)</Text>
            </View>

            <View style={styles.mathRow}>
              <Text style={styles.mathLabel}>Net Moisture/Chaff Variance</Text>
              <Text style={[styles.mathValue, { color: colors.warning }]}>-30 kg (-1.5%)</Text>
            </View>
          </View>

          <View style={styles.operatorRow}>
            <Text style={styles.operatorText}>
              Operator: {weighment?.scaleOperator || 'Dharam Pal (Electronic Weighbridge #2)'}
            </Text>
            <Text style={styles.timeText}>{weighment?.weighedAt || '04:05 PM'}</Text>
          </View>
        </View>

        {/* Financial Implication Card */}
        <View style={styles.financialCard}>
          <Text style={styles.finTitle}>Financial Settlement Implications</Text>
          <Text style={styles.finBody}>
            Buyer's binding purchase offer will be calculated against the verified net weight of{' '}
            <Text style={styles.bold}>{weighment?.netQuintals || 19.70} Quintals</Text> at Grade A rate.
          </Text>
        </View>

        {/* Action Button */}
        <PrimaryButton
          title="Review Buyer's Purchase Offer"
          iconName="pricetag-outline"
          onPress={() => navigation.navigate('FarmerOfferDecision', { offerId: 'offer-001' })}
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
    gap: spacing.spaceMd,
    paddingBottom: 60,
  },
  slipCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.spaceMd,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  slipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  slipTitle: {
    ...typography.badgeLabel,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  slipNumber: {
    ...typography.titleCard,
    color: colors.textPrimary,
    marginTop: 2,
  },
  calibratedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.successTint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  calibratedText: {
    ...typography.captionBold,
    color: colors.success,
  },
  netWeightContainer: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
    padding: spacing.spaceMd,
    alignItems: 'center',
    marginVertical: spacing.spaceMd,
  },
  netWeightLabel: {
    ...typography.badgeLabel,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  netWeightText: {
    ...typography.currencyDisplay,
    color: colors.primaryDark,
    fontSize: 34,
    marginVertical: 4,
  },
  netWeightKgText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginBottom: spacing.spaceSm,
  },
  mathTable: {
    gap: 8,
  },
  mathRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  mathRowHighlight: {
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.sm,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  mathLabel: {
    ...typography.bodyBase,
    color: colors.textSecondary,
  },
  mathLabelBold: {
    ...typography.bodyBaseMedium,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  mathValue: {
    ...typography.bodyBaseMedium,
    color: colors.textPrimary,
  },
  mathValueBold: {
    ...typography.bodyBaseMedium,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  operatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.spaceMd,
    paddingTop: spacing.spaceSm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  operatorText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  timeText: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  financialCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.xl,
    padding: spacing.spaceMd,
    gap: 6,
  },
  finTitle: {
    ...typography.titleCard,
    color: colors.textPrimary,
  },
  finBody: {
    ...typography.bodyBase,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  bold: {
    fontWeight: '700',
    color: colors.textPrimary,
  },
});
