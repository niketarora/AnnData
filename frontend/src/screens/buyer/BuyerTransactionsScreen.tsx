import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  BadgeDollarSign,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  FileText,
  Filter,
  CreditCard,
  Send,
} from 'lucide-react-native';
import { useAppStore } from '../../store';
import { mockStore } from '../../store/mockStore';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { CurrencyDisplay } from '../../components/common/CurrencyDisplay';
import { StatusChip } from '../../components/common/StatusChip';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { MetricCard } from '../../components/common/MetricCard';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BuyerStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<BuyerStackParamList, 'BuyerTransactions'>;

export const BuyerTransactionsScreen: React.FC<any> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const state = useAppStore();
  const [selectedFilter, setSelectedFilter] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'PAID'>('ALL');
  const [processingTxnId, setProcessingTxnId] = useState<string | null>(null);

  const activeOffer = state.offers[state.activeBookingId];
  const lot = state.lots.find((l) => l.id === state.activeLotId);
  const activeTxn = state.transactions.find((t) => t.bookingId === state.activeBookingId);
  const totalPaid = state.transactions
    .filter((item) => item.paymentStatus === 'PAID')
    .reduce((sum, item) => sum + item.netAmount, 0);
  const paidCount = state.transactions.filter((item) => item.paymentStatus === 'PAID').length;

  const handleReleasePayment = (txnId: string) => {
    Alert.alert(
      'Release ₹48,654.50?',
      'This will mark the payment as sent to Rajesh Kumar’s bank account ending in 8492.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Release payment',
          onPress: () => {
            setProcessingTxnId(txnId);
            setTimeout(() => {
              mockStore.releasePayment();
              setProcessingTxnId(null);
              Alert.alert('Payment sent', '₹48,654.50 was sent to Rajesh Kumar. The receipt is ready.');
            }, 600);
          },
        },
      ],
    );
  };

  const filteredTransactions = state.transactions.filter((item) => {
    if (selectedFilter === 'ALL') return true;
    if (selectedFilter === 'PAID') return item.paymentStatus === 'PAID';
    if (selectedFilter === 'PENDING') return item.paymentStatus === 'PENDING';
    if (selectedFilter === 'ACCEPTED') return item.paymentStatus === 'PROCESSING';
    return true;
  });

  return (
    <View style={styles.container}>
      <AppHeader
        title="Payments"
        subtitle={state.buyer.firmName || state.buyer.organizationName}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Metric Summary Cards */}
        <View style={styles.summaryGrid}>
          <MetricCard
            title="Payments completed"
            value={`₹${totalPaid.toLocaleString('en-IN')}`}
            subtext={`${paidCount} payments sent`}
            icon="wallet"
          />
          <MetricCard
            title="Available balance"
            value="₹4.50L"
            subtext="HDFC mandi account"
            icon="shield"
          />
        </View>

        {/* Filter Pills */}
        <View style={styles.filterRow}>
          {(['ALL', 'PENDING', 'ACCEPTED', 'PAID'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.filterTab,
                selectedFilter === tab && styles.filterTabActive,
              ]}
              onPress={() => setSelectedFilter(tab)}
            >
              <Text
                style={[
                  styles.filterTabText,
                  selectedFilter === tab && styles.filterTabTextActive,
                ]}
              >
                {tab === 'ALL'
                  ? 'All (3)'
                  : tab === 'PENDING'
                  ? 'Pending Offer'
                  : tab === 'ACCEPTED'
                  ? 'Ready for Payout'
                  : 'Paid'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Live Active Offer / Transaction Banner */}
        {lot && activeOffer && (
          <View style={styles.activeCard}>
            <View style={styles.activeHeader}>
              <View>
                <Text style={styles.activeTag}>CURRENT LOT #WH-098</Text>
                <Text style={styles.lotName}>{lot.variety} {lot.crop}</Text>
                <Text style={styles.farmerName}>Seller: {lot.farmerName} • Token #MKT-B-142</Text>
              </View>
              <StatusChip
                label={
                  lot.status === 'PAID'
                    ? 'SETTLED & PAID'
                    : lot.status === 'OFFER_ACCEPTED'
                    ? 'OFFER ACCEPTED'
                    : 'OFFER PENDING'
                }
                status={lot.status === 'PAID' ? 'success' : 'brand'}
              />
            </View>

            <View style={styles.activeDetails}>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Final quantity</Text>
                <Text style={styles.detailVal}>{activeOffer.netQuintals || activeOffer.quantityQuintals} Quintals</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Your rate</Text>
                <Text style={styles.detailVal}>₹{activeOffer.offeredPricePerQuintal || activeOffer.ratePerQuintal} / QTL</Text>
              </View>
              <View style={styles.detailItem}>
                <Text style={styles.detailLabel}>Farmer receives</Text>
                <CurrencyDisplay
                  amount={activeOffer.netPayout}
                  size="md"
                  bold
                  color={colors.primaryDark}
                />
              </View>
            </View>

            {/* Action based on status */}
            {lot.status === 'OFFER_ACCEPTED' && (
              <View style={styles.releaseActionBox}>
                <View style={styles.releaseNotice}>
                  <ShieldCheck size={16} color={colors.primary} />
                  <Text style={styles.releaseNoticeText}>
                    The farmer accepted. Check the amount before releasing payment.
                  </Text>
                </View>
                <PrimaryButton
                  title="Release ₹48,654.50"
                  icon="wallet"
                  loading={processingTxnId === activeTxn?.id}
                  onPress={() => handleReleasePayment(activeTxn?.id || 'txn-28491')}
                />
              </View>
            )}

            {lot.status === 'OFFER_RECEIVED' && (
              <View style={styles.waitingNotice}>
                <Clock size={16} color={colors.accentOrange} />
                <Text style={styles.waitingText}>
                  Offer sent. Waiting for the farmer to accept or ask for a better price.
                </Text>
              </View>
            )}

            {lot.status === 'PAID' && (
              <View style={styles.paidSuccessBox}>
                <CheckCircle2 size={18} color={colors.success} />
                <Text style={styles.paidSuccessText}>
                  Payment sent to the farmer. Receipt generated.
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Transaction History List */}
        <Text style={styles.sectionHeaderTitle}>Payment history</Text>

        {filteredTransactions.map((item) => (
          <View key={item.id} style={styles.txnCard}>
            <View style={styles.txnTop}>
              <View>
                <Text style={styles.txnCrop}>{item.crop}</Text>
                <Text style={styles.txnFarmer}>
                  {item.farmerName} • Lot #{item.lotId || item.bookingId}
                </Text>
              </View>
              <View style={styles.txnRight}>
                <CurrencyDisplay amount={item.netAmount} size="md" bold />
                <StatusChip
                  label={item.paymentStatus}
                  status={
                    item.paymentStatus === 'PAID'
                      ? 'success'
                      : item.paymentStatus === 'PROCESSING'
                      ? 'brand'
                      : 'neutral'
                  }
                />
              </View>
            </View>

            <View style={styles.txnDivider} />

            <View style={styles.txnFooter}>
              <View style={styles.txnMeta}>
                <Text style={styles.txnMetaText}>Qty: {item.quantityQuintals} Quintals</Text>
                <Text style={styles.txnMetaText}>•</Text>
                <Text style={styles.txnMetaText}>Rate: ₹{item.pricePerQuintal || Math.round(item.netAmount / (item.quantityQuintals || 1))}/QTL</Text>
                <Text style={styles.txnMetaText}>•</Text>
                <Text style={styles.txnMetaText}>UTR: {item.utrNumber || item.bankReference || 'N/A'}</Text>
              </View>

              {item.receipt && (
                <View style={styles.receiptBadge}>
                  <FileText size={12} color={colors.primary} />
                  <Text style={styles.receiptBadgeText}>J-Form</Text>
                </View>
              )}
            </View>
          </View>
        ))}
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
  summaryGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  filterTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterTabText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.medium,
    color: colors.textSecondary,
  },
  filterTabTextActive: {
    color: colors.surface,
    fontFamily: typography.fontFamilies.bold,
  },
  activeCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: colors.primary,
    ...shadows.md,
  },
  activeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  activeTag: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.bold,
    color: colors.primary,
    letterSpacing: 0.5,
  },
  lotName: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamilies.bold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  farmerName: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  activeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.backgroundLight,
    borderRadius: radius.md,
    padding: spacing.sm,
    marginVertical: spacing.xs,
  },
  detailItem: {
    alignItems: 'flex-start',
  },
  detailLabel: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textTertiary,
  },
  detailVal: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamilies.semiBold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  releaseActionBox: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  releaseNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primaryBg,
    padding: spacing.xs,
    borderRadius: radius.sm,
  },
  releaseNoticeText: {
    flex: 1,
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.medium,
    color: colors.primaryDark,
  },
  waitingNotice: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.surfaceHover,
    borderRadius: radius.md,
    gap: spacing.xs,
  },
  waitingText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
  },
  switchRoleHint: {
    marginTop: 4,
  },
  switchRoleText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.bold,
    color: colors.primary,
  },
  paidSuccessBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
    padding: spacing.sm,
    backgroundColor: colors.primaryBg,
    borderRadius: radius.md,
  },
  paidSuccessText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.semiBold,
    color: colors.success,
  },
  sectionHeaderTitle: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamilies.bold,
    color: colors.textPrimary,
    marginTop: spacing.xs,
  },
  txnCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  txnTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  txnCrop: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamilies.bold,
    color: colors.textPrimary,
  },
  txnFarmer: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  txnRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  txnDivider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.sm,
  },
  txnFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txnMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  txnMetaText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textTertiary,
  },
  receiptBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primaryBg,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  receiptBadgeText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.bold,
    color: colors.primary,
  },
});
