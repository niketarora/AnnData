import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { useAppStore } from '../../store';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { FarmerStackParamList } from '../../types';

export const DigitalReceiptScreen: React.FC = () => {
  const [state] = useAppStore();
  const navigation = useNavigation<NativeStackNavigationProp<FarmerStackParamList>>();
  const route = useRoute<RouteProp<FarmerStackParamList, 'DigitalReceipt'>>();

  const transactionId = route.params?.transactionId || state.activeTransactionId;
  const txn = state.transactions.find((t) => t.id === transactionId) || state.transactions[0];
  const receipt = txn?.receipt;

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Mandi Electronic Sale J-Form Receipt\nReceipt #: ${receipt?.receiptNumber}\nSeller: ${receipt?.farmerName}\nBuyer: ${receipt?.buyerName}\nCrop: ${receipt?.cropName} (${receipt?.variety})\nNet Weight: ${receipt?.finalWeightQuintals} Quintals\nGross: ₹${receipt?.grossAmount}\nNet Paid: ₹${receipt?.netPaidAmount}\nStatus: PAID (Bank Ref: ${receipt?.bankRefNumber})`,
      });
    } catch (err) {}
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Electronic Mandi Receipt"
        subtitle="APMC J-Form Sale Certificate"
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
        {/* Official Voucher Document Container */}
        <View style={styles.receiptSheet}>
          {/* Official Mandi Header */}
          <View style={styles.apmcHeader}>
            <Text style={styles.apmcTitle}>AGRICULTURAL PRODUCE MARKET COMMITTEE</Text>
            <Text style={styles.apmcSub}>TARAORI (KARNAL), HARYANA</Text>
            <Text style={styles.formTitle}>{receipt?.receiptNumber || 'J-FORM #HAR-TAR-2026-4819'}</Text>
            <Text style={styles.formDate}>Date of Issue: {receipt?.date || '08 Sep 2026'}</Text>
          </View>

          <View style={styles.jaggedDivider} />

          {/* Party Credentials */}
          <View style={styles.partiesRow}>
            <View style={styles.partyCol}>
              <Text style={styles.partyLabel}>SELLER (FARMER)</Text>
              <Text style={styles.partyName}>{receipt?.farmerName || 'Rajesh Kumar'}</Text>
              <Text style={styles.partySub}>Karnal Mandi Region</Text>
              <Text style={styles.partySub}>Vehicle: HR-05-AB-4812</Text>
            </View>

            <View style={[styles.partyCol, { alignItems: 'flex-end' }]}>
              <Text style={styles.partyLabel}>BUYER (TRADER)</Text>
              <Text style={styles.partyName}>{receipt?.buyerName || 'Anil Sharma'}</Text>
              <Text style={styles.partySub}>Taraori Mandi Counter 4</Text>
              <Text style={styles.partySub}>Lic: APMC-HAR-2024-8891</Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Commodity Ledger Table */}
          <View style={styles.table}>
            <View style={styles.tableHeaderRow}>
              <Text style={[styles.th, { flex: 2 }]}>COMMODITY</Text>
              <Text style={[styles.th, { flex: 1, textAlign: 'center' }]}>GRADE</Text>
              <Text style={[styles.th, { flex: 1.2, textAlign: 'right' }]}>WEIGHT</Text>
              <Text style={[styles.th, { flex: 1.2, textAlign: 'right' }]}>RATE</Text>
            </View>

            <View style={styles.tableRow}>
              <View style={{ flex: 2 }}>
                <Text style={styles.tdPrimary}>{receipt?.cropName || 'Wheat'}</Text>
                <Text style={styles.tdSecondary}>{receipt?.variety || 'Sharbati Gold'}</Text>
              </View>
              <Text style={[styles.td, { flex: 1, textAlign: 'center' }]}>
                {receipt?.grade || 'Grade A'}
              </Text>
              <Text style={[styles.td, { flex: 1.2, textAlign: 'right' }]}>
                {receipt?.finalWeightQuintals || 19.70} QTL
              </Text>
              <Text style={[styles.td, { flex: 1.2, textAlign: 'right' }]}>
                ₹{receipt?.ratePerQuintal || 2485}/Q
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          {/* Calculations Ledger */}
          <View style={styles.calcList}>
            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Gross Realized Sale Amount</Text>
              <Text style={styles.calcValue}>
                ₹{(receipt?.grossAmount || 48954.5).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </View>

            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Statutory Mandi Cess & Fee</Text>
              <Text style={[styles.calcValue, { color: colors.danger }]}>
                -₹{(receipt?.mandiFee || 300).toFixed(2)}
              </Text>
            </View>

            <View style={styles.calcRow}>
              <Text style={styles.calcLabel}>Weighment & Labor Handling Fee</Text>
              <Text style={[styles.calcValue, { color: colors.success }]}>₹0.00 (Exempt)</Text>
            </View>

            <View style={styles.netTotalRow}>
              <Text style={styles.netTotalLabel}>NET AMOUNT SETTLED</Text>
              <Text style={styles.netTotalValue}>
                ₹{(receipt?.netPaidAmount || 48654.5).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
              </Text>
            </View>
          </View>

          {/* Bank Payment Verification Seal */}
          <View style={styles.sealContainer}>
            <View style={styles.sealBadge}>
              <Ionicons name="shield-checkmark" size={24} color={colors.success} />
              <View>
                <Text style={styles.sealTitle}>ELECTRONICALLY VERIFIED SETTLEMENT</Text>
                <Text style={styles.sealSub}>Bank Ref: {receipt?.bankRefNumber || 'UPI-CR-20260908-98124'}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsRow}>
          <PrimaryButton
            title="Share Digital J-Form"
            iconName="share-social-outline"
            onPress={handleShare}
            style={{ flex: 1 }}
          />
          <PrimaryButton
            title="Return to Dashboard"
            variant="darkGreen"
            onPress={() => navigation.navigate('FarmerHome')}
            style={{ flex: 1 }}
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
    gap: spacing.spaceMd,
    paddingBottom: 60,
  },
  receiptSheet: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.spaceXl,
    borderWidth: 1.5,
    borderColor: colors.border,
    ...shadows.md,
  },
  apmcHeader: {
    alignItems: 'center',
    paddingBottom: spacing.spaceSm,
  },
  apmcTitle: {
    ...typography.badgeLabel,
    color: colors.primaryDark,
    letterSpacing: 0.5,
  },
  apmcSub: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginTop: 2,
  },
  formTitle: {
    ...typography.titleCard,
    color: colors.textPrimary,
    fontWeight: '700',
    marginTop: 6,
  },
  formDate: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  jaggedDivider: {
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: colors.border,
    marginVertical: spacing.spaceSm,
  },
  partiesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.spaceXs,
  },
  partyCol: {
    flex: 1,
  },
  partyLabel: {
    ...typography.badgeLabel,
    color: colors.textSecondary,
    fontSize: 9,
  },
  partyName: {
    ...typography.bodyBaseMedium,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  partySub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.spaceSm,
  },
  table: {
    marginVertical: spacing.spaceXs,
  },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  th: {
    ...typography.badgeLabel,
    color: colors.textSecondary,
    fontSize: 10,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  tdPrimary: {
    ...typography.bodyBaseMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  tdSecondary: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  td: {
    ...typography.bodyBaseMedium,
    color: colors.textPrimary,
  },
  calcList: {
    gap: 6,
  },
  calcRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  calcLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  calcValue: {
    ...typography.bodyBaseMedium,
    color: colors.textPrimary,
  },
  netTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    marginTop: 4,
    borderTopWidth: 1.5,
    borderTopColor: colors.border,
  },
  netTotalLabel: {
    ...typography.bodyBaseMedium,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  netTotalValue: {
    ...typography.titleCard,
    color: colors.primaryDark,
    fontWeight: '700',
    fontSize: 18,
  },
  sealContainer: {
    marginTop: spacing.spaceLg,
    padding: spacing.spaceSm,
    backgroundColor: colors.successTint,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.success,
  },
  sealBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceSm,
  },
  sealTitle: {
    ...typography.badgeLabel,
    color: colors.successDark,
  },
  sealSub: {
    ...typography.caption,
    color: colors.primaryDark,
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.spaceSm,
    marginTop: spacing.spaceXs,
  },
});
