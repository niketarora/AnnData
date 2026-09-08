import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppHeader } from '../../components/common/AppHeader';
import { useAppStore } from '../../store';
import { colors, radius, shadows, spacing, typography } from '../../theme';
import type { BuyerStackParamList } from '../../types';

type SummaryCardProps = {
  label: string;
  value: string;
  detail: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

const SummaryCard: React.FC<SummaryCardProps> = ({ label, value, detail, icon, color }) => (
  <View style={styles.summaryCard}>
    <View style={[styles.summaryIcon, { backgroundColor: `${color}14` }]}>
      <Ionicons name={icon} size={24} color={color} />
    </View>
    <Text style={styles.summaryLabel}>{label}</Text>
    <Text style={styles.summaryValue}>{value}</Text>
    <Text style={styles.summaryDetail}>{detail}</Text>
  </View>
);

export const BuyerDashboardScreen: React.FC = () => {
  const [state] = useAppStore();
  const navigation = useNavigation<NativeStackNavigationProp<BuyerStackParamList>>();
  const { width } = useWindowDimensions();
  const isWide = width >= 820;
  const pendingPayments = state.transactions.filter((item) => item.paymentStatus !== 'PAID').length;
  const nextLot = state.lots[0];
  const activeDemand = state.demands.find((item) => item.status === 'ACTIVE') ?? state.demands[0];

  return (
    <View style={styles.container}>
      <AppHeader
        title="Mandi operations"
        subtitle={state.buyer.marketName}
        onNotificationPress={() => navigation.navigate('BuyerNotifications')}
        onProfilePress={() => navigation.navigate('BuyerProfile')}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.shiftHeader}>
          <View style={styles.shiftText}>
            <Text style={styles.shiftGreeting}>Today at {state.buyer.mandiGate}</Text>
            <Text style={styles.shiftLocation}>{state.buyer.counterId} • Live operations</Text>
          </View>
          <View style={styles.activeBadge}>
            <View style={styles.activeDot} />
            <Text style={styles.activeText}>ONLINE</Text>
          </View>
        </View>

        <View style={styles.alertCard}>
          <View style={styles.alertIcon}>
            <Ionicons
              name={state.queue.delayMinutes > 0 ? 'warning' : 'checkmark-circle'}
              size={30}
              color={state.queue.delayMinutes > 0 ? colors.warningDark : colors.successDark}
            />
          </View>
          <View style={styles.alertText}>
            <Text style={styles.alertTitle}>
              {state.queue.delayMinutes > 0
                ? `Gate delayed by ${state.queue.delayMinutes} minutes`
                : 'Gate running on time'}
            </Text>
            <Text style={styles.alertDescription}>
              {state.queue.totalQueueLoad} lots are currently in the mandi queue.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.alertButton}
            onPress={() => navigation.navigate('QueueControlPanel')}
            accessibilityRole="button"
          >
            <Text style={styles.alertButtonText}>Open queue</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.summaryGrid, isWide && styles.summaryGridWide]}>
          <SummaryCard
            label="Waiting for inspection"
            value={`${state.lots.length}`}
            detail="Farmer lots"
            icon="search-circle"
            color={colors.info}
          />
          <SummaryCard
            label="In the queue"
            value={`${state.queue.totalQueueLoad}`}
            detail={`${state.queue.avgLotClearMinutes} min per lot`}
            icon="time"
            color={colors.warning}
          />
          <SummaryCard
            label="Payments to release"
            value={`${pendingPayments}`}
            detail="Requires action"
            icon="wallet"
            color={pendingPayments > 0 ? colors.danger : colors.success}
          />
        </View>

        <View style={[styles.workspace, isWide && styles.workspaceWide]}>
          <View style={styles.primaryColumn}>
            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.eyebrow}>NEXT FARMER</Text>
                  <Text style={styles.sectionTitle}>Ready for inspection</Text>
                </View>
                <View style={styles.tokenBadge}>
                  <Text style={styles.tokenText}>#{state.queue.tokenNumber}</Text>
                </View>
              </View>

              <View style={styles.nextFarmerBody}>
                <View style={styles.farmerAvatar}>
                  <Ionicons name="person" size={28} color={colors.primary} />
                </View>
                <View style={styles.farmerDetails}>
                  <Text style={styles.farmerName}>{nextLot?.farmerName}</Text>
                  <Text style={styles.cropDetails}>
                    {nextLot?.crop} ({nextLot?.variety}) • {nextLot?.quantityQuintals} quintals
                  </Text>
                  <Text style={styles.vehicleDetails}>{state.farmer.vehiclePlate} • Bay 3</Text>
                </View>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.secondaryAction}
                  onPress={() => navigation.navigate('BuyerLotDetails', { lotId: nextLot.id })}
                  accessibilityRole="button"
                >
                  <Text style={styles.secondaryActionText}>View lot</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.primaryAction}
                  onPress={() => navigation.navigate('PhysicalInspectionStation', { bookingId: state.activeBookingId })}
                  accessibilityRole="button"
                >
                  <Ionicons name="clipboard-outline" size={21} color={colors.onPrimary} />
                  <Text style={styles.primaryActionText}>Start inspection</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Incoming lots</Text>
                <TouchableOpacity
                  style={styles.textButton}
                  onPress={() => navigation.navigate('IncomingLots')}
                  accessibilityRole="button"
                >
                  <Text style={styles.textButtonText}>View all</Text>
                  <Ionicons name="arrow-forward" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>

              {state.lots.slice(0, 2).map((lot) => (
                <TouchableOpacity
                  key={lot.id}
                  style={styles.lotRow}
                  onPress={() => navigation.navigate('BuyerLotDetails', { lotId: lot.id })}
                  accessibilityRole="button"
                >
                  <View style={styles.lotIcon}>
                    <Ionicons name="leaf" size={22} color={colors.primary} />
                  </View>
                  <View style={styles.lotText}>
                    <Text style={styles.lotTitle}>{lot.crop} • {lot.quantityQuintals} quintals</Text>
                    <Text style={styles.lotSubtitle}>{lot.farmerName} • {lot.variety}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={22} color={colors.textTertiary} />
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.secondaryColumn}>
            {activeDemand && (
              <View style={styles.sectionCard}>
                <Text style={styles.eyebrow}>ACTIVE BUYING TARGET</Text>
                <Text style={styles.sectionTitle}>{activeDemand.crop} needed today</Text>
                <Text style={styles.demandQuantity}>
                  {activeDemand.requiredQuantityQuintals - activeDemand.fulfilledQuantityQuintals} quintals remaining
                </Text>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.min(
                          100,
                          (activeDemand.fulfilledQuantityQuintals / activeDemand.requiredQuantityQuintals) * 100,
                        )}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.demandPrice}>
                  ₹{activeDemand.minPrice.toLocaleString('en-IN')}–₹{activeDemand.maxPrice.toLocaleString('en-IN')} per quintal
                </Text>
                <TouchableOpacity
                  style={styles.fullWidthButton}
                  onPress={() => navigation.navigate('DemandManagement')}
                  accessibilityRole="button"
                >
                  <Text style={styles.fullWidthButtonText}>Manage buying targets</Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={styles.paymentShortcut}
              onPress={() => navigation.navigate('BuyerTransactions')}
              accessibilityRole="button"
            >
              <View style={styles.paymentShortcutIcon}>
                <Ionicons name="card" size={24} color={colors.primary} />
              </View>
              <View style={styles.paymentShortcutText}>
                <Text style={styles.paymentShortcutTitle}>Payments</Text>
                <Text style={styles.paymentShortcutSub}>{pendingPayments} awaiting release</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color={colors.textTertiary} />
            </TouchableOpacity>
          </View>
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
  content: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    padding: spacing.gutterMobile,
    paddingBottom: 104,
    gap: spacing.md,
  },
  shiftHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  shiftText: {
    flex: 1,
    minWidth: 0,
  },
  shiftGreeting: {
    ...typography.headlineXlMobile,
    color: colors.textPrimary,
    fontSize: 24,
  },
  shiftLocation: {
    ...typography.bodyBase,
    color: colors.textSecondary,
    fontSize: 15,
    marginTop: 2,
  },
  activeBadge: {
    minHeight: 36,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.successTint,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    flexShrink: 0,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.success,
  },
  activeText: {
    ...typography.captionBold,
    color: colors.successDark,
  },
  alertCard: {
    minHeight: 84,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.warningTint,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  alertIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  alertText: {
    flex: 1,
    minWidth: 0,
  },
  alertTitle: {
    ...typography.bodyLg,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  alertDescription: {
    ...typography.bodyBase,
    color: colors.textSecondary,
    fontSize: 15,
    marginTop: 2,
  },
  alertButton: {
    minHeight: 48,
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    flexShrink: 0,
  },
  alertButtonText: {
    ...typography.bodyBaseMedium,
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  summaryGrid: {
    gap: spacing.sm,
  },
  summaryGridWide: {
    flexDirection: 'row',
  },
  summaryCard: {
    flex: 1,
    minWidth: 0,
    minHeight: 138,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadows.sm,
  },
  summaryIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryLabel: {
    ...typography.bodyBase,
    color: colors.textSecondary,
    fontSize: 15,
    marginTop: spacing.sm,
  },
  summaryValue: {
    ...typography.headlineXl,
    color: colors.textPrimary,
    fontSize: 30,
    lineHeight: 36,
  },
  summaryDetail: {
    ...typography.bodyBase,
    color: colors.textSecondary,
    fontSize: 14,
  },
  workspace: {
    gap: spacing.md,
  },
  workspaceWide: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  primaryColumn: {
    flex: 1.45,
    minWidth: 0,
    gap: spacing.md,
  },
  secondaryColumn: {
    flex: 1,
    minWidth: 0,
    gap: spacing.md,
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    ...shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  eyebrow: {
    ...typography.captionBold,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  sectionTitle: {
    ...typography.headlineMd,
    color: colors.textPrimary,
    fontSize: 20,
  },
  tokenBadge: {
    backgroundColor: colors.primaryTint,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    flexShrink: 0,
  },
  tokenText: {
    ...typography.bodyBaseMedium,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  nextFarmerBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  farmerAvatar: {
    width: 54,
    height: 54,
    borderRadius: radius.full,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  farmerDetails: {
    flex: 1,
    minWidth: 0,
  },
  farmerName: {
    ...typography.bodyLg,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  cropDetails: {
    ...typography.bodyBase,
    color: colors.textPrimary,
    fontSize: 15,
    marginTop: 2,
  },
  vehicleDetails: {
    ...typography.bodyBase,
    color: colors.textSecondary,
    fontSize: 14,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  secondaryAction: {
    minWidth: 120,
    minHeight: 52,
    flex: 1,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  secondaryActionText: {
    ...typography.bodyLg,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  primaryAction: {
    minWidth: 180,
    minHeight: 52,
    flex: 1.4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
  },
  primaryActionText: {
    ...typography.bodyLg,
    color: colors.onPrimary,
    fontWeight: '700',
  },
  textButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  textButtonText: {
    ...typography.bodyBaseMedium,
    color: colors.primary,
    fontSize: 15,
    fontWeight: '700',
  },
  lotRow: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  lotIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  lotText: {
    flex: 1,
    minWidth: 0,
  },
  lotTitle: {
    ...typography.bodyLg,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  lotSubtitle: {
    ...typography.bodyBase,
    color: colors.textSecondary,
    fontSize: 15,
    marginTop: 2,
  },
  demandQuantity: {
    ...typography.headlineLg,
    color: colors.primaryDark,
    marginTop: spacing.md,
  },
  progressTrack: {
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  progressFill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
  demandPrice: {
    ...typography.bodyLg,
    color: colors.textPrimary,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
  fullWidthButton: {
    minHeight: 52,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  fullWidthButtonText: {
    ...typography.bodyLg,
    color: colors.primary,
    fontWeight: '700',
  },
  paymentShortcut: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.xl,
    backgroundColor: colors.card,
    padding: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  paymentShortcutIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryTint,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  paymentShortcutText: {
    flex: 1,
    minWidth: 0,
  },
  paymentShortcutTitle: {
    ...typography.bodyLg,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  paymentShortcutSub: {
    ...typography.bodyBase,
    color: colors.textSecondary,
    fontSize: 15,
  },
});
