import React from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { useAppStore } from '../../store';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SecondaryButton } from '../../components/common/SecondaryButton';
import { FarmerStackParamList } from '../../types';

export const PaymentStatusScreen: React.FC = () => {
  const [state] = useAppStore();
  const navigation = useNavigation<NativeStackNavigationProp<FarmerStackParamList>>();
  const route = useRoute<RouteProp<FarmerStackParamList, 'PaymentStatus'>>();

  const transactionId = route.params?.transactionId || state.activeTransactionId;
  const txn = state.transactions.find((t) => t.id === transactionId) || state.transactions[0];
  const isPaid = txn?.paymentStatus === 'PAID';

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Mandi Settlement Receipt: Received ₹${(txn?.netAmount || 48654.5).toLocaleString(
          'en-IN'
        )} for 19.70 QTL Wheat at Taraori APMC Mandi. Reference: ${txn?.bankReference}`,
      });
    } catch (err) {}
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Payment"
        subtitle="Money sent to your bank"
        showBack
        onBack={() => navigation.navigate('FarmerHome')}
        onNotificationPress={() => navigation.navigate('Notifications')}
        onProfilePress={() => navigation.navigate('FarmerProfile')}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Payment Received Hero Icon */}
        <View style={[styles.statusIconCircle, isPaid ? styles.paidCircle : styles.processingCircle]}>
          <Ionicons
            name={isPaid ? 'checkmark-circle' : 'hourglass-outline'}
            size={56}
            color={isPaid ? colors.success : colors.warning}
          />
        </View>

        <Text style={styles.statusTitle}>
          {isPaid ? 'Money received' : 'Payment pending'}
        </Text>
        <Text style={styles.statusSub}>
          {isPaid
            ? 'The money was sent to your State Bank of India account ending in 8492.'
            : 'The buyer approved your payment. It usually reaches your bank within 30 minutes.'}
        </Text>

        {/* Hero Amount Card */}
        <View style={styles.payoutCard}>
          <Text style={styles.payoutCardLabel}>{isPaid ? 'AMOUNT RECEIVED' : 'AMOUNT ON THE WAY'}</Text>
          <Text style={styles.payoutAmountText}>
            ₹{(txn?.netAmount || 48654.5).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </Text>

          <View style={styles.statusPill}>
            <View style={[styles.dot, { backgroundColor: isPaid ? colors.success : colors.warning }]} />
            <Text style={[styles.statusPillText, { color: isPaid ? colors.success : colors.warning }]}>
              {isPaid ? 'MONEY RECEIVED' : 'PAYMENT PENDING'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.txnDetails}>
            <View style={styles.txnRow}>
              <Text style={styles.txnLabel}>Transaction ID</Text>
              <Text style={styles.txnValue}>{txn?.id.toUpperCase() || 'TXN-28491'}</Text>
            </View>
            <View style={styles.txnRow}>
              <Text style={styles.txnLabel}>Bank Reference</Text>
              <Text style={styles.txnValue}>{txn?.bankReference || 'UPI-CR-20260908-98124'}</Text>
            </View>
            <View style={styles.txnRow}>
              <Text style={styles.txnLabel}>Bank account</Text>
              <Text style={styles.txnValue}>SBI A/C ••8492 (Rajesh Kumar)</Text>
            </View>
            <View style={styles.txnRow}>
              <Text style={styles.txnLabel}>Last updated</Text>
              <Text style={styles.txnValue}>08 Sep 2026, 04:18 PM</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsCol}>
          <PrimaryButton
            title="View receipt"
            iconName="receipt-outline"
            onPress={() => navigation.navigate('DigitalReceipt', { transactionId: txn?.id })}
          />

          <SecondaryButton
            title="Share payment receipt"
            iconName="share-social-outline"
            variant="outline"
            onPress={handleShare}
          />

          {!isPaid && (
            <SecondaryButton
              title="Report missing payment"
              iconName="call-outline"
              variant="outline"
              onPress={() => Linking.openURL('tel:18001239876')}
            />
          )}
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
  statusIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.spaceMd,
  },
  paidCircle: {
    backgroundColor: colors.successTint,
  },
  processingCircle: {
    backgroundColor: colors.warningTint,
  },
  statusTitle: {
    ...typography.headlineXlMobile,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  statusSub: {
    ...typography.bodyBase,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },
  payoutCard: {
    width: '100%',
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.spaceXl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  payoutCardLabel: {
    ...typography.badgeLabel,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  payoutAmountText: {
    ...typography.currencyDisplay,
    color: colors.primaryDark,
    fontSize: 34,
    marginVertical: 4,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: radius.full,
    marginTop: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusPillText: {
    ...typography.badgeLabel,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.spaceMd,
  },
  txnDetails: {
    width: '100%',
    gap: 8,
  },
  txnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  txnLabel: {
    ...typography.bodyBase,
    color: colors.textSecondary,
  },
  txnValue: {
    ...typography.bodyBaseMedium,
    color: colors.textPrimary,
  },
  simReleaseBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: colors.successTint,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.success,
  },
  simReleaseText: {
    ...typography.captionBold,
    color: colors.successDark,
  },
  actionsCol: {
    width: '100%',
    gap: spacing.spaceSm,
    marginTop: spacing.spaceXs,
  },
});
