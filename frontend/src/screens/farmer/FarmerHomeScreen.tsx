import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppHeader } from '../../components/common/AppHeader';
import { getFarmerCopy } from '../../i18n/farmerCopy';
import { useAppStore } from '../../store';
import { colors, radius, shadows, spacing, typography } from '../../theme';
import type { FarmerStackParamList } from '../../types';

type HomeAction = {
  title: string;
  description: string;
  icon: keyof typeof Ionicons.glyphMap;
  backgroundColor: string;
  iconColor: string;
  onPress: () => void;
};

export const FarmerHomeScreen: React.FC = () => {
  const [state] = useAppStore();
  const navigation = useNavigation<NativeStackNavigationProp<FarmerStackParamList>>();
  const copy = getFarmerCopy(state.language);
  const booking = state.bookings[0];
  const transaction = state.transactions.find((item) => item.id === state.activeTransactionId)
    ?? state.transactions[0];

  const isLeaveNow = state.queue.departureState === 'LEAVE_NOW';
  const isArrived = state.queue.departureState === 'ARRIVED';
  const statusTitle = isArrived ? copy.goToGate : isLeaveNow ? copy.leaveNow : copy.waitAtHome;
  const statusMessage = isArrived
    ? copy.arrivedMessage
    : isLeaveNow
      ? copy.leaveMessage
      : copy.waitMessage(state.queue.delayMinutes, state.queue.revisedDepartureTime);
  const statusColor = isLeaveNow || isArrived ? colors.successDark : colors.warningDark;
  const statusBackground = isLeaveNow || isArrived ? colors.successTint : colors.warningTint;
  const statusIcon: keyof typeof Ionicons.glyphMap = isArrived
    ? 'location'
    : isLeaveNow
      ? 'navigate'
      : 'home';

  const actions: HomeAction[] = [
    {
      title: copy.sellCrop,
      description: copy.sellCropHelp,
      icon: 'basket',
      backgroundColor: colors.successTint,
      iconColor: colors.successDark,
      onPress: () => navigation.navigate('CreateCropLot'),
    },
    {
      title: copy.findMandi,
      description: copy.findMandiHelp,
      icon: 'storefront',
      backgroundColor: colors.infoTint,
      iconColor: colors.infoDark,
      onPress: () => navigation.navigate('BestPlacesToSell'),
    },
    {
      title: copy.myToken,
      description: copy.tokenHelp,
      icon: 'ticket',
      backgroundColor: colors.warningTint,
      iconColor: colors.warningDark,
      onPress: () => navigation.navigate('LiveMandiQueue', { bookingId: booking?.id }),
    },
  ];

  const paymentReceived = transaction?.paymentStatus === 'PAID';

  return (
    <View style={styles.container}>
      <AppHeader
        onNotificationPress={() => navigation.navigate('Notifications')}
        onProfilePress={() => navigation.navigate('FarmerProfile')}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.greetingBlock}>
          <Text style={styles.greeting}>
            {copy.hello}, {state.farmer.name.split(' ')[0]}
          </Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={18} color={colors.primary} />
            <Text style={styles.location}>{state.farmer.mandiRegion}</Text>
          </View>
        </View>

        {booking && (
          <View style={[styles.statusCard, { backgroundColor: statusBackground }]}>
            <View style={styles.statusTopRow}>
              <View style={[styles.statusIcon, { backgroundColor: colors.card }]}>
                <Ionicons name={statusIcon} size={28} color={statusColor} />
              </View>
              <View style={styles.statusMeta}>
                <Text style={styles.updatedText}>{copy.updatedNow}</Text>
                <Text style={styles.tokenNumber}>#{booking.tokenNumber}</Text>
              </View>
            </View>

            <Text style={[styles.statusTitle, { color: statusColor }]}>{statusTitle}</Text>
            <Text style={styles.statusMessage}>{statusMessage}</Text>

            <TouchableOpacity
              style={styles.statusButton}
              onPress={() => navigation.navigate('LiveMandiQueue', { bookingId: booking.id })}
              accessibilityRole="button"
              accessibilityLabel={copy.viewToken}
            >
              <Ionicons name="ticket-outline" size={22} color={colors.onPrimary} />
              <Text style={styles.statusButtonText}>{copy.viewToken}</Text>
              <Ionicons name="chevron-forward" size={22} color={colors.onPrimary} />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.actionsSection}>
          <Text style={styles.sectionTitle}>{copy.mainActions}</Text>
          <View style={styles.actionList}>
            {actions.map((action) => (
              <TouchableOpacity
                key={action.title}
                style={styles.actionCard}
                onPress={action.onPress}
                accessibilityRole="button"
                accessibilityLabel={`${action.title}. ${action.description}`}
              >
                <View style={[styles.actionIcon, { backgroundColor: action.backgroundColor }]}>
                  <Ionicons name={action.icon} size={26} color={action.iconColor} />
                </View>
                <View style={styles.actionText}>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionDescription}>{action.description}</Text>
                </View>
                <Ionicons name="chevron-forward" size={24} color={colors.textTertiary} />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {transaction && (
          <View style={styles.paymentCard}>
            <View style={styles.paymentIcon}>
              <Ionicons
                name={paymentReceived ? 'checkmark-circle' : 'time'}
                size={28}
                color={paymentReceived ? colors.success : colors.warning}
              />
            </View>
            <View style={styles.paymentContent}>
              <Text style={styles.paymentLabel}>
                {paymentReceived ? copy.moneyReceived : copy.paymentPending}
              </Text>
              <Text style={styles.paymentAmount}>
                ₹{transaction.netAmount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
              </Text>
              <Text style={styles.bankText}>{copy.bankMessage}</Text>
              <TouchableOpacity
                style={styles.paymentLink}
                onPress={() => navigation.navigate('PaymentStatus', { transactionId: transaction.id })}
                accessibilityRole="button"
              >
                <Text style={styles.paymentLinkText}>{copy.viewPayments}</Text>
                <Ionicons name="arrow-forward" size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        )}
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
    maxWidth: 620,
    alignSelf: 'center',
    padding: spacing.gutterMobile,
    paddingBottom: 104,
    gap: spacing.lg,
  },
  greetingBlock: {
    minWidth: 0,
    gap: 4,
  },
  greeting: {
    ...typography.headlineXlMobile,
    color: colors.textPrimary,
    fontSize: 24,
    lineHeight: 32,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    ...typography.bodyLg,
    color: colors.textSecondary,
    flexShrink: 1,
  },
  statusCard: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  statusTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusMeta: {
    minWidth: 0,
    alignItems: 'flex-end',
    flexShrink: 1,
  },
  updatedText: {
    ...typography.bodyBase,
    color: colors.textSecondary,
    fontSize: 15,
  },
  tokenNumber: {
    ...typography.bodyBaseMedium,
    color: colors.textPrimary,
    marginTop: 2,
    flexShrink: 1,
  },
  statusTitle: {
    ...typography.headlineXl,
    fontSize: 30,
    lineHeight: 38,
    marginTop: spacing.md,
  },
  statusMessage: {
    ...typography.bodyLg,
    color: colors.textPrimary,
    fontSize: 17,
    lineHeight: 26,
    marginTop: spacing.xs,
  },
  statusButton: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.md,
  },
  statusButtonText: {
    ...typography.bodyLg,
    color: colors.onPrimary,
    fontWeight: '700',
    flexShrink: 1,
  },
  actionsSection: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.headlineMd,
    color: colors.textPrimary,
    fontSize: 20,
  },
  actionList: {
    gap: spacing.sm,
  },
  actionCard: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.sm,
    ...shadows.sm,
  },
  actionIcon: {
    width: 52,
    height: 52,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  actionText: {
    flex: 1,
    minWidth: 0,
  },
  actionTitle: {
    ...typography.bodyLg,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  actionDescription: {
    ...typography.bodyBase,
    color: colors.textSecondary,
    fontSize: 15,
    lineHeight: 21,
    marginTop: 2,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: radius.xl,
    padding: spacing.md,
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  paymentIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainerLow,
    flexShrink: 0,
  },
  paymentContent: {
    flex: 1,
    minWidth: 0,
  },
  paymentLabel: {
    ...typography.bodyLg,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  paymentAmount: {
    ...typography.currencyDisplayMobile,
    color: colors.primaryDark,
    marginTop: 2,
  },
  bankText: {
    ...typography.bodyBase,
    color: colors.textSecondary,
    fontSize: 15,
  },
  paymentLink: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    marginTop: spacing.xs,
  },
  paymentLinkText: {
    ...typography.bodyLg,
    color: colors.primary,
    fontWeight: '700',
  },
});
