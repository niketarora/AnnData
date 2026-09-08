import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { useAppStore } from '../../store';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SecondaryButton } from '../../components/common/SecondaryButton';
import { ConfirmationModal } from '../../components/feedback/ConfirmationModal';
import { FarmerStackParamList } from '../../types';

export const FarmerOfferDecisionScreen: React.FC = () => {
  const [state, store] = useAppStore();
  const navigation = useNavigation<NativeStackNavigationProp<FarmerStackParamList>>();
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);

  const offer = state.offers[state.activeBookingId] || Object.values(state.offers)[0];

  const handleAcceptConfirm = () => {
    store.acceptOffer();
    setConfirmModalVisible(false);
    navigation.navigate('PaymentStatus', { transactionId: 'txn-28491' });
  };

  const handleRejectConfirm = () => {
    store.rejectOffer(offer?.id || 'offer-001');
    setRejectModalVisible(false);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Buyer Purchase Offer"
        subtitle="Binding Mandi Settlement"
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
        {/* Top Urgency Header */}
        <View style={styles.timerRow}>
          <View style={styles.timerPill}>
            <Ionicons name="time" size={14} color={colors.warning} />
            <Text style={styles.timerText}>Offer expires in 12m 45s</Text>
          </View>
          <Text style={styles.tokenText}>Token #{state.queue.tokenNumber}</Text>
        </View>

        {/* Buyer Offer Card */}
        <View style={styles.offerCard}>
          <View style={styles.buyerHeader}>
            <View style={styles.buyerAvatar}>
              <Ionicons name="business" size={22} color={colors.primaryLight} />
            </View>
            <View style={styles.buyerInfo}>
              <Text style={styles.buyerName}>{offer?.buyerName || 'Anil Sharma'}</Text>
              <Text style={styles.buyerSub}>Authorized APMC Mandi Licensee</Text>
            </View>
            <View style={styles.verifiedTag}>
              <Ionicons name="checkmark-circle" size={13} color={colors.success} />
              <Text style={styles.verifiedTagText}>Escrow Verified</Text>
            </View>
          </View>

          {/* Commodity Details Strip */}
          <View style={styles.commodityStrip}>
            <View>
              <Text style={styles.cropTitle}>{offer?.cropVariety || 'Wheat (Sharbati Gold)'}</Text>
              <Text style={styles.cropGrade}>Verified {offer?.finalGrade || 'Grade A'} Quality</Text>
            </View>
            <View style={styles.rateCol}>
              <Text style={styles.rateAmount}>₹{offer?.ratePerQuintal || 2485}</Text>
              <Text style={styles.rateUnit}>/ Quintal</Text>
            </View>
          </View>

          {/* Big Take-Home Payout Highlight */}
          <View style={styles.payoutHighlight}>
            <Text style={styles.payoutLabel}>FINAL NET TAKE-HOME PAYOUT</Text>
            <Text style={styles.payoutAmount}>
              ₹{(offer?.netPayout || 48654.5).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </Text>
            <Text style={styles.payoutMode}>Direct Instant Bank Credit via UPI</Text>
          </View>

          {/* Full Ledgers Breakdown */}
          <View style={styles.breakdownTable}>
            <Text style={styles.tableTitle}>Settlement Math Breakdown</Text>

            <View style={styles.row}>
              <Text style={styles.rowLabel}>
                Gross Crop Value ({offer?.quantityQuintals || 19.70} QTL × ₹{offer?.ratePerQuintal || 2485})
              </Text>
              <Text style={styles.rowValue}>
                ₹{(offer?.grossAmount || 48954.5).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.rowLabel}>Mandi Cess & Market Development Fee</Text>
              <Text style={[styles.rowValue, { color: colors.danger }]}>
                -₹{(offer?.deductions?.mandiCess || 300).toFixed(2)}
              </Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.rowLabel}>Unloading & Cleaning Charges</Text>
              <Text style={[styles.rowValue, { color: colors.success }]}>₹0.00 (Waived)</Text>
            </View>

            <View style={[styles.row, styles.totalRow]}>
              <Text style={styles.totalLabel}>Net Payable to Farmer</Text>
              <Text style={styles.totalValue}>
                ₹{(offer?.netPayout || 48654.5).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>

          {/* Bank Destination Strip */}
          <View style={styles.bankStrip}>
            <Ionicons name="card-outline" size={20} color={colors.primaryLight} />
            <View style={styles.bankInfo}>
              <Text style={styles.bankName}>{state.farmer.bankAccount.bankName}</Text>
              <Text style={styles.bankAcc}>A/C: {state.farmer.bankAccount.accountNumberMasked} • {state.farmer.bankAccount.upiId}</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons Row */}
        <View style={styles.actionButtonsCol}>
          <PrimaryButton
            title="Accept Binding Offer & Request Payment"
            iconName="checkmark-circle-outline"
            onPress={() => setConfirmModalVisible(true)}
          />

          <SecondaryButton
            title="Decline / Counter Offer"
            iconName="close-circle-outline"
            variant="outline"
            onPress={() => setRejectModalVisible(true)}
          />
        </View>
      </ScrollView>

      {/* Accept Confirmation Modal */}
      <ConfirmationModal
        visible={confirmModalVisible}
        title="Accept Binding Offer?"
        message={`Are you sure you want to accept ₹${(offer?.netPayout || 48654.5).toLocaleString('en-IN', {
          minimumFractionDigits: 2,
        })} for ${offer?.quantityQuintals || 19.70} Quintals of Wheat? This transaction will be electronically settled.`}
        confirmText="Yes, Accept Offer"
        cancelText="Review Again"
        iconName="shield-checkmark"
        onConfirm={handleAcceptConfirm}
        onCancel={() => setConfirmModalVisible(false)}
      />

      {/* Reject Confirmation Modal */}
      <ConfirmationModal
        visible={rejectModalVisible}
        title="Decline Offer?"
        message="Declining will notify the Mandi buyer and release the lot back to market comparison."
        confirmText="Decline Offer"
        cancelText="Cancel"
        confirmVariant="danger"
        iconName="alert-circle"
        onConfirm={handleRejectConfirm}
        onCancel={() => setRejectModalVisible(false)}
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
    paddingBottom: 60,
  },
  timerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.warningTint,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  timerText: {
    ...typography.captionBold,
    color: colors.warning,
  },
  tokenText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  offerCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.spaceMd,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
    gap: spacing.spaceSm,
  },
  buyerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceSm,
    paddingBottom: spacing.spaceSm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  buyerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyerInfo: {
    flex: 1,
  },
  buyerName: {
    ...typography.titleCard,
    color: colors.textPrimary,
  },
  buyerSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.successTint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  verifiedTagText: {
    ...typography.badgeLabel,
    color: colors.success,
    fontSize: 9,
  },
  commodityStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.spaceXs,
  },
  cropTitle: {
    ...typography.headlineMd,
    color: colors.textPrimary,
  },
  cropGrade: {
    ...typography.captionBold,
    color: colors.success,
    marginTop: 2,
  },
  rateCol: {
    alignItems: 'flex-end',
  },
  rateAmount: {
    ...typography.headlineMd,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  rateUnit: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  payoutHighlight: {
    backgroundColor: colors.successTint,
    borderRadius: radius.lg,
    padding: spacing.spaceMd,
    alignItems: 'center',
    marginVertical: spacing.spaceXs,
  },
  payoutLabel: {
    ...typography.badgeLabel,
    color: colors.primaryDark,
    letterSpacing: 0.5,
  },
  payoutAmount: {
    ...typography.currencyDisplay,
    color: colors.primaryDark,
    fontSize: 32,
    marginVertical: 4,
  },
  payoutMode: {
    ...typography.captionBold,
    color: colors.success,
  },
  breakdownTable: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
    padding: spacing.spaceSm,
    gap: 8,
  },
  tableTitle: {
    ...typography.captionBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  rowLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    flex: 1,
    marginRight: 8,
  },
  rowValue: {
    ...typography.bodyBaseMedium,
    color: colors.textPrimary,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingTop: 8,
    marginTop: 4,
  },
  totalLabel: {
    ...typography.bodyBaseMedium,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  totalValue: {
    ...typography.titleCard,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  bankStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceSm,
    padding: spacing.spaceSm,
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.md,
  },
  bankInfo: {
    flex: 1,
  },
  bankName: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  bankAcc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  actionButtonsCol: {
    gap: spacing.spaceSm,
  },
});
