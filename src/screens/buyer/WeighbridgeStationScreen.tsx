import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Scale,
  Truck,
  CheckCircle2,
  Lock,
  ArrowRight,
  ShieldCheck,
  FileText,
  RefreshCw,
} from 'lucide-react-native';
import { useAppStore } from '../../store';
import { mockStore } from '../../store/mockStore';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { StatusChip } from '../../components/common/StatusChip';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SecondaryButton } from '../../components/common/SecondaryButton';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BuyerStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<BuyerStackParamList, 'WeighbridgeStation'>;

export const WeighbridgeStationScreen: React.FC<Props> = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const state = useAppStore();
  const bookingId = route.params?.bookingId || state.activeBookingId;
  const booking = state.bookings.find((b) => b.id === bookingId) || state.bookings[0];
  const lot = state.lots.find((l) => l.id === booking?.lotId) || state.lots[0];
  const existingWeighment = state.weighments[bookingId];

  // Scale readings
  const [grossWeight, setGrossWeight] = useState<string>(
    existingWeighment ? `${existingWeighment.grossWeightKg}` : '5420'
  );
  const [tareWeight, setTareWeight] = useState<string>(
    existingWeighment ? `${existingWeighment.tareWeightKg}` : '3450'
  );
  const [bagDeduction, setBagDeduction] = useState<string>('0');
  const [scaleLocked, setScaleLocked] = useState<boolean>(!!existingWeighment);
  const [isSaving, setIsSaving] = useState(false);

  const grossNum = parseFloat(grossWeight) || 0;
  const tareNum = parseFloat(tareWeight) || 0;
  const bagNum = parseFloat(bagDeduction) || 0;
  const netKg = Math.max(0, grossNum - tareNum - bagNum);
  const netQuintals = parseFloat((netKg / 100).toFixed(2));

  const handleRecordWeighment = () => {
    if (netQuintals <= 0) {
      Alert.alert('Invalid Weight', 'Gross weight must be greater than tare weight.');
      return;
    }

    setIsSaving(true);
    mockStore.recordWeighment({
      bookingId,
      lotId: lot.id,
      grossWeightKg: grossNum,
      tareWeightKg: tareNum,
      netWeightKg: netKg,
      netQuintals,
      scaleSlipNumber: `WB-2026-${booking?.tokenNumber?.replace(/[^0-9]/g, '') || '142'}`,
      weighedAt: new Date().toISOString(),
      scaleOperator: 'Ramesh Singh (Weighbridge Supv.)',
      scaleCalibrationVerified: true,
    });

    setTimeout(() => {
      setIsSaving(false);
      setScaleLocked(true);
      Alert.alert(
        'Scale Weight Locked',
        `Official net weight of ${netQuintals} Quintals (${netKg.toLocaleString('en-IN')} kg) recorded on slip WB-2026-142. Ready to issue binding offer.`,
        [
          {
            text: 'Create Purchase Offer',
            onPress: () => navigation.navigate('BuyerOfferCreation', { bookingId }),
          },
          {
            text: 'Review Queue',
            onPress: () => navigation.navigate('QueueControlPanel'),
            style: 'cancel',
          },
        ]
      );
    }, 400);
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Weighbridge Scale Station"
        subtitle={`Scale #2 • Slip WB-2026-${booking?.tokenNumber?.replace(/[^0-9]/g, '') || '142'}`}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Hardware Status Banner */}
        <View style={styles.hardwareBanner}>
          <View style={styles.scaleStatusLeft}>
            <View style={styles.livePulse} />
            <Text style={styles.scaleStatusText}>Electronic Scale Link: Connected (±0.5kg cal.)</Text>
          </View>
          <View style={styles.certBadge}>
            <ShieldCheck size={14} color={colors.primary} />
            <Text style={styles.certText}>W&M Certified 2026</Text>
          </View>
        </View>

        {/* Vehicle & Lot Info */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardHeaderLeft}>
              <Truck size={20} color={colors.primary} />
              <View>
                <Text style={styles.vehicleNo}>{booking?.vehicleNumber || 'HR-05-AB-4821'}</Text>
                <Text style={styles.vehicleSub}>
                  {lot.farmerName} • {lot.variety} {lot.crop}
                </Text>
              </View>
            </View>
            <StatusChip
              label={scaleLocked ? 'WEIGHED & LOCKED' : 'ON SCALE'}
              status={scaleLocked ? 'success' : 'brand'}
            />
          </View>

          <View style={styles.declaredRow}>
            <Text style={styles.declaredLabel}>Declared Lot Estimate:</Text>
            <Text style={styles.declaredVal}>{lot.quantityQuintals} Quintals (approx 2,000 kg)</Text>
          </View>
        </View>

        {/* Net Quintals Highlight Card */}
        <View style={styles.netHighlightCard}>
          <Text style={styles.netHighlightLabel}>CALCULATED NET SCALE WEIGHT</Text>
          <View style={styles.netWeightRow}>
            <Text style={styles.netWeightNumber}>{netQuintals}</Text>
            <Text style={styles.netWeightUnit}>Quintals</Text>
          </View>
          <Text style={styles.netSubText}>
            ({netKg.toLocaleString('en-IN')} kg net billable crop weight)
          </Text>
        </View>

        {/* Gross & Tare Scale Slips Input */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Scale Readout Values</Text>
          <Text style={styles.cardDesc}>
            Dual digital load cells record loaded vehicle gross and empty vehicle tare.
          </Text>

          {/* Gross Weight */}
          <View style={styles.weightInputField}>
            <View style={styles.inputTitleRow}>
              <Text style={styles.fieldLabel}>Gross Weight (Vehicle + Crop)</Text>
              <Text style={styles.fieldHint}>First weigh-in</Text>
            </View>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.weightInput}
                keyboardType="numeric"
                value={grossWeight}
                onChangeText={setGrossWeight}
                editable={!scaleLocked}
                placeholder="5420"
              />
              <Text style={styles.unitText}>KG</Text>
            </View>
          </View>

          {/* Tare Weight */}
          <View style={styles.weightInputField}>
            <View style={styles.inputTitleRow}>
              <Text style={styles.fieldLabel}>Tare Weight (Empty Vehicle)</Text>
              <Text style={styles.fieldHint}>Post-unloading weigh-out</Text>
            </View>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.weightInput}
                keyboardType="numeric"
                value={tareWeight}
                onChangeText={setTareWeight}
                editable={!scaleLocked}
                placeholder="3450"
              />
              <Text style={styles.unitText}>KG</Text>
            </View>
          </View>

          {/* Bag / Packaging deduction */}
          <View style={styles.weightInputField}>
            <View style={styles.inputTitleRow}>
              <Text style={styles.fieldLabel}>Dunnage / Gunny Bag Allowance</Text>
              <Text style={styles.fieldHint}>Mandatory APMC standard</Text>
            </View>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.weightInput}
                keyboardType="numeric"
                value={bagDeduction}
                onChangeText={setBagDeduction}
                editable={!scaleLocked}
                placeholder="0"
              />
              <Text style={styles.unitText}>KG</Text>
            </View>
          </View>
        </View>

        {/* Electronic Slip Specifications */}
        <View style={styles.card}>
          <View style={styles.slipHeader}>
            <FileText size={18} color={colors.textSecondary} />
            <Text style={styles.slipTitle}>Official APMC Weighment Slip Details</Text>
          </View>
          <View style={styles.slipRow}>
            <Text style={styles.slipKey}>Slip Serial</Text>
            <Text style={styles.slipVal}>
              {existingWeighment?.scaleSlipNumber || 'WB-2026-142'}
            </Text>
          </View>
          <View style={styles.slipRow}>
            <Text style={styles.slipKey}>Scale Operator</Text>
            <Text style={styles.slipVal}>Ramesh Singh (ID #OP-921)</Text>
          </View>
          <View style={styles.slipRow}>
            <Text style={styles.slipKey}>Timestamp</Text>
            <Text style={styles.slipVal}>Today, 3:32 PM (Synced)</Text>
          </View>
          <View style={styles.slipRow}>
            <Text style={styles.slipKey}>Discrepancy vs Declared</Text>
            <Text style={[styles.slipVal, { color: colors.textSecondary }]}>
              -0.30 QTL (-1.5% within normal margin)
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionContainer}>
          {!scaleLocked ? (
            <PrimaryButton
              title="Lock & Issue Digital Weighment Slip"
              icon="scale"
              loading={isSaving}
              onPress={handleRecordWeighment}
            />
          ) : (
            <View style={styles.lockedActionGroup}>
              <PrimaryButton
                title="Create Binding Purchase Offer"
                icon="receipt"
                onPress={() => navigation.navigate('BuyerOfferCreation', { bookingId })}
              />
              <SecondaryButton
                title="Unlock & Re-weigh Scale"
                onPress={() => setScaleLocked(false)}
              />
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  hardwareBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.primaryBg,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  scaleStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  livePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  scaleStatusText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.medium,
    color: colors.primaryDark,
  },
  certBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  certText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.bold,
    color: colors.primary,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  vehicleNo: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamilies.bold,
    color: colors.textPrimary,
  },
  vehicleSub: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  declaredRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  declaredLabel: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.medium,
    color: colors.textSecondary,
  },
  declaredVal: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.bold,
    color: colors.textPrimary,
  },
  netHighlightCard: {
    backgroundColor: colors.primaryDark,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.md,
  },
  netHighlightLabel: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.bold,
    color: colors.accentYellow,
    letterSpacing: 1,
  },
  netWeightRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.xs,
    marginVertical: 4,
  },
  netWeightNumber: {
    fontSize: 42,
    fontFamily: typography.fontFamilies.bold,
    color: colors.surface,
  },
  netWeightUnit: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fontFamilies.semiBold,
    color: colors.surfaceTranslucent,
  },
  netSubText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.medium,
    color: colors.surfaceTranslucent,
  },
  cardTitle: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamilies.bold,
    color: colors.textPrimary,
  },
  cardDesc: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  weightInputField: {
    marginBottom: spacing.sm,
  },
  inputTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.semiBold,
    color: colors.textPrimary,
  },
  fieldHint: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textTertiary,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.backgroundLight,
    height: 48,
  },
  weightInput: {
    flex: 1,
    fontSize: typography.sizes.lg,
    fontFamily: typography.fontFamilies.bold,
    color: colors.textPrimary,
  },
  unitText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamilies.bold,
    color: colors.textSecondary,
  },
  slipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  slipTitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamilies.semiBold,
    color: colors.textPrimary,
  },
  slipRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  slipKey: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
  },
  slipVal: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.bold,
    color: colors.textPrimary,
  },
  actionContainer: {
    marginTop: spacing.xs,
  },
  lockedActionGroup: {
    gap: spacing.sm,
  },
});
