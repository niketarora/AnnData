import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { useAppStore } from '../../store';
import { AppHeader } from '../../components/common/AppHeader';
import { StatusChip } from '../../components/common/StatusChip';
import { FarmerStackParamList } from '../../types';

export const SalesHistoryScreen: React.FC = () => {
  const [state] = useAppStore();
  const navigation = useNavigation<NativeStackNavigationProp<FarmerStackParamList>>();
  const [filter, setFilter] = useState<'ALL' | 'PAID' | 'PENDING'>('ALL');

  const filteredTxns = state.transactions.filter((t) => {
    if (filter === 'PAID') return t.paymentStatus === 'PAID';
    if (filter === 'PENDING') return t.paymentStatus !== 'PAID';
    return true;
  });

  return (
    <View style={styles.container}>
      <AppHeader
        title="Sales & Payments Ledger"
        subtitle="Audited APMC Transactions"
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
        {/* Settlement Total Card */}
        <View style={styles.heroLedgerCard}>
          <Text style={styles.heroLabel}>TOTAL SETTLED THIS SEASON</Text>
          <Text style={styles.heroAmount}>₹1,60,754.50</Text>
          <View style={styles.heroSubRow}>
            <Text style={styles.heroSubText}>3 Transactions • 59.7 Quintals</Text>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark-done" size={13} color={colors.success} />
              <Text style={styles.verifiedText}>All Bank Credited</Text>
            </View>
          </View>
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterRow}>
          {(['ALL', 'PAID', 'PENDING'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.filterChip, filter === tab && styles.filterChipActive]}
              onPress={() => setFilter(tab)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === tab && styles.filterChipTextActive,
                ]}
              >
                {tab === 'ALL' ? 'All Transactions' : tab === 'PAID' ? 'Settled (Paid)' : 'Pending Clearance'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Transactions Stream */}
        <View style={styles.txnsList}>
          {filteredTxns.map((txn) => (
            <TouchableOpacity
              key={txn.id}
              style={styles.txnCard}
              onPress={() => navigation.navigate('DigitalReceipt', { transactionId: txn.id })}
              activeOpacity={0.88}
            >
              <View style={styles.txnHeader}>
                <View>
                  <Text style={styles.cropTitle}>{txn.crop}</Text>
                  <Text style={styles.txnDate}>{txn.createdAt}</Text>
                </View>
                <StatusChip
                  label={txn.paymentStatus === 'PAID' ? 'PAID & SETTLED' : 'PROCESSING'}
                  variant={txn.paymentStatus === 'PAID' ? 'success' : 'warning'}
                />
              </View>

              <View style={styles.divider} />

              <View style={styles.txnBodyRow}>
                <View>
                  <Text style={styles.colLabel}>Buyer & Market</Text>
                  <Text style={styles.colValue}>{txn.buyerName}</Text>
                  <Text style={styles.colSub}>Taraori APMC Mandi</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.colLabel}>Net Payout Amount</Text>
                  <Text style={styles.netAmountText}>
                    ₹{txn.netAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </Text>
                  <Text style={styles.colSub}>{txn.quantityQuintals} Quintals</Text>
                </View>
              </View>

              <View style={styles.cardFooter}>
                <View style={styles.refRow}>
                  <Ionicons name="card-outline" size={14} color={colors.textSecondary} />
                  <Text style={styles.refText}>{txn.bankReference}</Text>
                </View>
                <View style={styles.viewReceiptRow}>
                  <Text style={styles.viewReceiptText}>View J-Form</Text>
                  <Ionicons name="chevron-forward" size={15} color={colors.primaryLight} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
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
  heroLedgerCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.spaceMd,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  heroLabel: {
    ...typography.badgeLabel,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  heroAmount: {
    ...typography.currencyDisplay,
    color: colors.primaryDark,
    fontSize: 32,
    marginVertical: 4,
  },
  heroSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  heroSubText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.successTint,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  verifiedText: {
    ...typography.badgeLabel,
    color: colors.success,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.spaceXs,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
  },
  filterChipActive: {
    backgroundColor: colors.primaryLight,
  },
  filterChipText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.onPrimary,
  },
  txnsList: {
    gap: spacing.spaceSm,
  },
  txnCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.spaceMd,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  txnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cropTitle: {
    ...typography.headlineMd,
    color: colors.textPrimary,
  },
  txnDate: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.spaceSm,
  },
  txnBodyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  colLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  colValue: {
    ...typography.bodyBaseMedium,
    color: colors.textPrimary,
    marginTop: 2,
  },
  colSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  netAmountText: {
    ...typography.titleCard,
    color: colors.primaryDark,
    fontWeight: '700',
    marginTop: 2,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.spaceSm,
    marginTop: spacing.spaceSm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  refRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  refText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  viewReceiptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewReceiptText: {
    ...typography.captionBold,
    color: colors.primaryLight,
  },
});
