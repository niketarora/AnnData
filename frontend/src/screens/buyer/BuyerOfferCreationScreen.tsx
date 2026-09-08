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
  BadgeDollarSign,
  TrendingUp,
  ShieldCheck,
  Zap,
  Info,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react-native';
import { useAppStore } from '../../store';
import { mockStore } from '../../store/mockStore';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { CurrencyDisplay } from '../../components/common/CurrencyDisplay';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SecondaryButton } from '../../components/common/SecondaryButton';
import { StatusChip } from '../../components/common/StatusChip';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BuyerStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<BuyerStackParamList, 'BuyerOfferCreation'>;

export const BuyerOfferCreationScreen: React.FC<Props> = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const state = useAppStore();
  const bookingId = route.params?.bookingId || state.activeBookingId;
  const booking = state.bookings.find((b) => b.id === bookingId) || state.bookings[0];
  const lot = state.lots.find((l) => l.id === booking?.lotId) || state.lots[0];
  const weighment = state.weighments[bookingId];
  const inspection = state.inspections[bookingId];

  const netQuintals = weighment?.netQuintals || 19.7;
  const [offeredRate, setOfferedRate] = useState<string>('2520');
  const [remarks, setRemarks] = useState<string>(
    'Grade A price for low-moisture Sharbati wheat. Payment will be sent after acceptance.'
  );
  const [submitting, setSubmitting] = useState(false);

  const rateNumber = parseFloat(offeredRate) || 0;
  const grossAmount = rateNumber * netQuintals;
  const mandiFee = grossAmount * 0.015; // 1.5% APMC fee
  const weighmentFee = 245.0; // Fixed Weighbridge charge
  const netPayout = Math.max(0, grossAmount - mandiFee - weighmentFee);

  const submitOffer = () => {
    setSubmitting(true);
    mockStore.submitOffer({
      id: `offer-${Date.now()}`,
      bookingId,
      lotId: lot.id,
      buyerId: state.buyer.id,
      buyerName: state.buyer.name,
      buyerFirmName: state.buyer.firmName || state.buyer.organizationName,
      crop: lot.crop,
      variety: lot.variety,
      netQuintals,
      offeredPricePerQuintal: rateNumber,
      grossAmount,
      mandiFee,
      weighmentCharge: weighmentFee,
      netPayout,
      expiresAt: 'In 45 minutes',
      status: 'PENDING',
      terms: 'Instant DBT via Mandi Escrow • Settlement upon digital acceptance',
    });

    setTimeout(() => {
      setSubmitting(false);
      Alert.alert(
        'Offer sent',
        `Your offer of ₹${netPayout.toLocaleString('en-IN', {
          maximumFractionDigits: 2,
        })} was sent to Rajesh Kumar.`,
        [
          {
            text: 'Open payments',
            onPress: () => navigation.navigate('BuyerTransactions'),
          },
        ]
      );
    }, 400);
  };

  const handleSendOffer = () => {
    if (rateNumber <= 0) {
      Alert.alert('Check offered rate', 'Enter a valid price per quintal.');
      return;
    }

    Alert.alert(
      `Send offer of ₹${Math.round(netPayout).toLocaleString('en-IN')}?`,
      `${lot.farmerName} will see ₹${rateNumber.toLocaleString('en-IN')} per quintal and a final amount of ₹${Math.round(netPayout).toLocaleString('en-IN')}.`,
      [
        { text: 'Check again', style: 'cancel' },
        { text: 'Send offer', onPress: submitOffer },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Send price offer"
        subtitle={`Token #${booking?.tokenNumber || 'MKT-B-142'} • ${lot.farmerName}`}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Lot Specs & Verified Quality */}
        <View style={styles.verifiedCard}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cropTitle}>{lot.variety} {lot.crop}</Text>
              <Text style={styles.cropSub}>Farmer: {lot.farmerName} • Lot #{lot.id}</Text>
            </View>
            <StatusChip label="READY FOR OFFER" status="success" />
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Final weight</Text>
              <Text style={styles.metricValue}>{netQuintals} QTL</Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Quality grade</Text>
              <Text style={[styles.metricValue, { color: colors.primary }]}>
                {inspection?.physicalGrade || 'Grade A'} (89/100)
              </Text>
            </View>
            <View style={styles.metricItem}>
              <Text style={styles.metricLabel}>Moisture</Text>
              <Text style={styles.metricValue}>{inspection?.moistureReading || inspection?.moisturePercent || 11.8}%</Text>
            </View>
          </View>
        </View>

        {/* Market Rate Context */}
        <View style={styles.marketContextCard}>
          <View style={styles.contextHeader}>
            <TrendingUp size={16} color={colors.primary} />
            <Text style={styles.contextTitle}>Today’s mandi prices</Text>
          </View>
          <View style={styles.benchmarkRow}>
            <View style={styles.benchmarkItem}>
              <Text style={styles.benchLabel}>Average price</Text>
              <Text style={styles.benchVal}>₹2,470 / QTL</Text>
            </View>
            <View style={styles.benchmarkItem}>
              <Text style={styles.benchLabel}>Highest Grade A</Text>
              <Text style={styles.benchVal}>₹2,580 / QTL</Text>
            </View>
            <View style={styles.benchmarkItem}>
              <Text style={styles.benchLabel}>Your maximum</Text>
              <Text style={styles.benchValHighlight}>₹2,550 / QTL</Text>
            </View>
          </View>
        </View>

        {/* Offer Input */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your price per quintal</Text>
          <Text style={styles.cardDesc}>
            The farmer’s final amount updates as you change the price.
          </Text>

          <View style={styles.rateInputRow}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.rateInput}
              keyboardType="numeric"
              value={offeredRate}
              onChangeText={setOfferedRate}
              placeholder="2520"
            />
            <Text style={styles.perQtl}>/ Quintal</Text>
          </View>

          {/* Quick Increment Chips */}
          <View style={styles.quickChips}>
            {[2480, 2500, 2520, 2550].map((rate) => (
              <TouchableOpacity
                key={rate}
                style={[
                  styles.chip,
                  rateNumber === rate && styles.chipActive,
                ]}
                onPress={() => setOfferedRate(String(rate))}
              >
                <Text style={[styles.chipText, rateNumber === rate && styles.chipTextActive]}>
                  ₹{rate}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Net Settlement Breakdown */}
        <View style={styles.breakdownCard}>
          <Text style={styles.breakdownTitle}>Farmer payment details</Text>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Gross Crop Value ({netQuintals} QTL × ₹{rateNumber})</Text>
            <Text style={styles.breakdownValue}>
              ₹{grossAmount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Mandi fee (1.5%)</Text>
            <Text style={styles.breakdownDeduct}>
              -₹{mandiFee.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
            </Text>
          </View>

          <View style={styles.breakdownRow}>
            <Text style={styles.breakdownLabel}>Weighing and labour</Text>
            <Text style={styles.breakdownDeduct}>-₹{weighmentFee.toFixed(2)}</Text>
          </View>

          <View style={styles.totalDivider} />

          <View style={styles.netPayoutRow}>
            <View>
              <Text style={styles.netPayoutTitle}>Farmer receives</Text>
              <Text style={styles.netPayoutSub}>Sent after farmer accepts</Text>
            </View>
            <CurrencyDisplay
              amount={netPayout}
              size="2xl"
              bold
              color={colors.primaryDark}
            />
          </View>
        </View>

        {/* Terms & Remark */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Message to farmer</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={2}
            value={remarks}
            onChangeText={setRemarks}
          />
          <View style={styles.escrowNotice}>
            <ShieldCheck size={16} color={colors.primary} />
            <Text style={styles.escrowText}>
              Payment is released only after the farmer accepts the offer.
            </Text>
          </View>
        </View>

        {/* Action Button */}
        <View style={styles.actionContainer}>
          <PrimaryButton
            title={`Send offer of ₹${netPayout.toLocaleString('en-IN', {
              maximumFractionDigits: 0,
            })}`}
            icon="receipt"
            loading={submitting}
            onPress={handleSendOffer}
          />
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
  verifiedCard: {
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
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  cropTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fontFamilies.bold,
    color: colors.textPrimary,
  },
  cropSub: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metricItem: {
    alignItems: 'flex-start',
  },
  metricLabel: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.medium,
    color: colors.textTertiary,
  },
  metricValue: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamilies.bold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  marketContextCard: {
    backgroundColor: colors.primaryBg,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  contextHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  contextTitle: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.bold,
    color: colors.primaryDark,
    textTransform: 'uppercase',
  },
  benchmarkRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  benchmarkItem: {
    alignItems: 'flex-start',
  },
  benchLabel: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
  },
  benchVal: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamilies.semiBold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  benchValHighlight: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamilies.bold,
    color: colors.primary,
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
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
  rateInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.backgroundLight,
    height: 56,
  },
  currencySymbol: {
    fontSize: 24,
    fontFamily: typography.fontFamilies.bold,
    color: colors.primary,
    marginRight: 4,
  },
  rateInput: {
    flex: 1,
    fontSize: 28,
    fontFamily: typography.fontFamilies.bold,
    color: colors.textPrimary,
  },
  perQtl: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamilies.semiBold,
    color: colors.textSecondary,
  },
  quickChips: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  chip: {
    flex: 1,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.borderLight,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.semiBold,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: colors.surface,
    fontFamily: typography.fontFamilies.bold,
  },
  breakdownCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  breakdownTitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamilies.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  breakdownLabel: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
  },
  breakdownValue: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.semiBold,
    color: colors.textPrimary,
  },
  breakdownDeduct: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.semiBold,
    color: colors.error,
  },
  totalDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.sm,
  },
  netPayoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },
  netPayoutTitle: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamilies.bold,
    color: colors.textPrimary,
  },
  netPayoutSub: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.regular,
    color: colors.primaryDark,
    marginTop: 2,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    padding: spacing.sm,
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textPrimary,
    minHeight: 50,
    backgroundColor: colors.backgroundLight,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  escrowNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primaryBg,
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  escrowText: {
    flex: 1,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.regular,
    color: colors.primaryDark,
    lineHeight: 16,
  },
  actionContainer: {
    marginTop: spacing.xs,
  },
});
