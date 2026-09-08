import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { useAppStore } from '../../store';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { FarmerStackParamList } from '../../types';
import { bookingService } from '../../services';

export const BookSlotScreen: React.FC = () => {
  const [state] = useAppStore();
  const navigation = useNavigation<NativeStackNavigationProp<FarmerStackParamList>>();
  const route = useRoute<RouteProp<FarmerStackParamList, 'BookSlot'>>();

  const marketId = route.params?.marketId || 'mkt-b-taraori';
  const market = state.markets.find((m) => m.id === marketId) || state.markets[0];

  const [selectedDate, setSelectedDate] = useState<'Today' | 'Tomorrow'>('Today');
  const [selectedSlotId, setSelectedSlotId] = useState('slot-5'); // 3:30–4:00 PM
  const [vehicleNumber, setVehicleNumber] = useState(state.farmer.vehiclePlate);
  const [driverName, setDriverName] = useState(state.farmer.name);
  const [loading, setLoading] = useState(false);

  const slots = [
    { id: 'slot-1', time: '08:00 – 09:00 AM', quota: 4 },
    { id: 'slot-2', time: '10:30 – 11:30 AM', quota: 5 },
    { id: 'slot-3', time: '01:00 – 02:00 PM', quota: 1 },
    { id: 'slot-5', time: '03:30 – 04:00 PM', quota: 6, recommended: true },
    { id: 'slot-6', time: '04:30 – 05:30 PM', quota: 3 },
  ];

  const handleConfirmBooking = async () => {
    setLoading(true);
    try {
      const booking = await bookingService.createBooking(
        state.activeLotId,
        market.id,
        selectedSlotId,
        vehicleNumber,
        driverName
      );
      setLoading(false);
      navigation.navigate('BookingConfirmation', { bookingId: booking.id });
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Book your mandi time"
        subtitle={market.name}
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
        {/* Mandi Summary Card */}
        <View style={styles.mandiSummary}>
          <View style={styles.mandiHeader}>
            <View>
              <Text style={styles.mandiName}>{market.name}</Text>
              <Text style={styles.mandiLoc}>{market.location} • {market.distanceKm} km away</Text>
            </View>
            <View style={styles.netPill}>
              <Text style={styles.netPillText}>₹{market.expectedNetPayout.toLocaleString('en-IN')}</Text>
            </View>
          </View>
        </View>

        {/* Date Selection */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>Choose a date</Text>
          <View style={styles.dateRow}>
            {(['Today', 'Tomorrow'] as const).map((d) => (
              <TouchableOpacity
                key={d}
                style={[styles.dateChip, selectedDate === d && styles.dateChipActive]}
                onPress={() => setSelectedDate(d)}
              >
                <Ionicons
                  name="calendar-outline"
                  size={16}
                  color={selectedDate === d ? colors.onPrimary : colors.textPrimary}
                />
                <Text style={[styles.dateChipText, selectedDate === d && styles.dateChipTextActive]}>
                  {d === 'Today' ? 'Today, 08 Sep' : 'Tomorrow, 09 Sep'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Time Slot Selection */}
        <View style={styles.sectionCard}>
          <View style={styles.slotHeaderRow}>
            <Text style={styles.sectionLabel}>Choose a time</Text>
            <Text style={styles.quotaText}>6 slots remaining</Text>
          </View>

          <View style={styles.slotsList}>
            {slots.map((s) => (
              <TouchableOpacity
                key={s.id}
                style={[styles.slotItem, selectedSlotId === s.id && styles.slotItemActive]}
                onPress={() => setSelectedSlotId(s.id)}
              >
                <View style={styles.slotLeft}>
                  <View
                    style={[
                      styles.radioCircle,
                      selectedSlotId === s.id && styles.radioCircleActive,
                    ]}
                  >
                    {selectedSlotId === s.id && <View style={styles.radioDot} />}
                  </View>
                  <Text
                    style={[
                      styles.slotTimeText,
                      selectedSlotId === s.id && styles.slotTimeTextActive,
                    ]}
                  >
                    {s.time}
                  </Text>
                </View>

                {s.recommended ? (
                  <View style={styles.recommendedBadge}>
                    <Text style={styles.recommendedBadgeText}>Shortest wait</Text>
                  </View>
                ) : (
                  <Text style={styles.quotaAvailable}>{s.quota} left</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Carrier / Vehicle Details */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>Vehicle and driver</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Vehicle number</Text>
            <TextInput
              style={styles.textInput}
              value={vehicleNumber}
              onChangeText={setVehicleNumber}
              placeholder="e.g. HR-05-AB-4812"
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Driver name</Text>
            <TextInput
              style={styles.textInput}
              value={driverName}
              onChangeText={setDriverName}
              placeholder="e.g. Rajesh Kumar"
            />
          </View>
        </View>

        {/* Booking Summary Strip */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Go to</Text>
            <Text style={styles.summaryValue}>Gate 2 Express Line</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>You may receive</Text>
            <Text style={[styles.summaryValue, { color: colors.success, fontWeight: '700' }]}>
              ₹{market.expectedNetPayout.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        {/* Action Button */}
        <PrimaryButton
          title={loading ? 'Booking your time...' : 'Book time and get token'}
          loading={loading}
          iconName="ticket-outline"
          onPress={handleConfirmBooking}
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
  mandiSummary: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.spaceMd,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  mandiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mandiName: {
    ...typography.headlineMd,
    color: colors.textPrimary,
  },
  mandiLoc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  netPill: {
    backgroundColor: colors.successTint,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  netPillText: {
    ...typography.titleCard,
    color: colors.success,
    fontWeight: '700',
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.spaceMd,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
    gap: spacing.spaceSm,
  },
  sectionLabel: {
    ...typography.badgeLabel,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  dateRow: {
    flexDirection: 'row',
    gap: spacing.spaceSm,
  },
  dateChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainer,
  },
  dateChipActive: {
    backgroundColor: colors.primaryLight,
  },
  dateChipText: {
    ...typography.bodyBaseMedium,
    color: colors.textPrimary,
  },
  dateChipTextActive: {
    color: colors.onPrimary,
    fontWeight: '600',
  },
  slotHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quotaText: {
    ...typography.caption,
    color: colors.success,
  },
  slotsList: {
    gap: 8,
  },
  slotItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.spaceSm,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  slotItemActive: {
    borderColor: colors.primaryLight,
    backgroundColor: colors.successTint,
  },
  slotLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioCircleActive: {
    borderColor: colors.primaryLight,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primaryLight,
  },
  slotTimeText: {
    ...typography.bodyBaseMedium,
    color: colors.textPrimary,
  },
  slotTimeTextActive: {
    fontWeight: '600',
    color: colors.primaryDark,
  },
  recommendedBadge: {
    backgroundColor: colors.success,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  recommendedBadgeText: {
    ...typography.badgeLabel,
    color: colors.onPrimary,
    fontSize: 10,
  },
  quotaAvailable: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  inputGroup: {
    gap: 6,
  },
  fieldLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  textInput: {
    minHeight: 48,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.spaceMd,
    ...typography.bodyBaseMedium,
    color: colors.textPrimary,
  },
  summaryCard: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
    padding: spacing.spaceSm,
    gap: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  summaryValue: {
    ...typography.bodyBaseMedium,
    color: colors.textPrimary,
  },
});
