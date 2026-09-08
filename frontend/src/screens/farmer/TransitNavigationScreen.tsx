import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { useAppStore } from '../../store';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { FarmerStackParamList } from '../../types';

export const TransitNavigationScreen: React.FC = () => {
  const [state, store] = useAppStore();
  const navigation = useNavigation<NativeStackNavigationProp<FarmerStackParamList>>();

  const handleArrived = () => {
    store.checkInFarmer();
    navigation.navigate('FarmerCheckIn', { bookingId: state.activeBookingId });
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Live Mandi Navigation"
        subtitle="En route to Taraori Mandi"
        showBack
        onBack={() => navigation.goBack()}
        onNotificationPress={() => navigation.navigate('Notifications')}
        onProfilePress={() => navigation.navigate('FarmerProfile')}
      />

      {/* Mapbox / GPS Route Simulation Graphic */}
      <View style={styles.mapContainer}>
        {/* Visual Road & Waypoint Simulation */}
        <View style={styles.routeGraphic}>
          <View style={styles.waypointOrigin}>
            <Ionicons name="home" size={16} color={colors.onPrimary} />
          </View>
          <View style={styles.routeLine} />
          <View style={styles.vehicleMarker}>
            <Ionicons name="bus" size={18} color={colors.onPrimary} />
          </View>
          <View style={styles.routeLineDashed} />
          <View style={styles.waypointDestination}>
            <Ionicons name="business" size={16} color={colors.onPrimary} />
          </View>
        </View>

        {/* Turn by Turn Card */}
        <View style={styles.turnCard}>
          <View style={styles.turnIconBox}>
            <Ionicons name="arrow-forward" size={24} color={colors.onPrimary} />
          </View>
          <View style={styles.turnTextCol}>
            <Text style={styles.turnDistance}>In 3.8 km</Text>
            <Text style={styles.turnInstruction}>
              Take exit onto NH-44 Taraori Bypass towards Gate 2 Express Line
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom Logistics Control Sheet */}
      <View style={styles.sheetContainer}>
        <View style={styles.etaRow}>
          <View>
            <Text style={styles.etaLabel}>ESTIMATED ARRIVAL</Text>
            <Text style={styles.etaTime}>03:45 PM</Text>
          </View>
          <View style={styles.etaDivider} />
          <View>
            <Text style={styles.etaLabel}>DISTANCE</Text>
            <Text style={styles.etaValue}>12.4 km left</Text>
          </View>
          <View style={styles.etaDivider} />
          <View>
            <Text style={styles.etaLabel}>GATE TRAFFIC</Text>
            <Text style={[styles.etaValue, { color: colors.success }]}>Fast Inflow</Text>
          </View>
        </View>

        {/* Gate Pass Quick Reference */}
        <View style={styles.gatePassRef}>
          <View style={styles.passRefLeft}>
            <Ionicons name="qr-code-outline" size={20} color={colors.primaryLight} />
            <Text style={styles.passRefToken}>Pass #MKT-B-142</Text>
          </View>
          <Text style={styles.passRefLane}>Lane: Gate 2 Express</Text>
        </View>

        {/* Action Button */}
        <PrimaryButton
          title="I Have Arrived at Gate 2 • Check In"
          iconName="checkmark-circle-outline"
          onPress={handleArrived}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  mapContainer: {
    flex: 1,
    backgroundColor: colors.surfaceContainer,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  routeGraphic: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  waypointOrigin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.textSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  routeLine: {
    width: 6,
    height: 60,
    backgroundColor: colors.primaryLight,
    borderRadius: 3,
  },
  vehicleMarker: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.card,
    ...shadows.primaryAction,
  },
  routeLineDashed: {
    width: 6,
    height: 60,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: 3,
  },
  waypointDestination: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.successDark,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  turnCard: {
    position: 'absolute',
    top: 20,
    left: spacing.gutterMobile,
    right: spacing.gutterMobile,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.spaceMd,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceSm,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.lg,
  },
  turnIconBox: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  turnTextCol: {
    flex: 1,
  },
  turnDistance: {
    ...typography.captionBold,
    color: colors.primaryLight,
  },
  turnInstruction: {
    ...typography.bodyBaseMedium,
    color: colors.textPrimary,
    marginTop: 2,
  },
  sheetContainer: {
    backgroundColor: colors.card,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    padding: spacing.gutterMobile,
    gap: spacing.spaceMd,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.lg,
    paddingBottom: 40,
  },
  etaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: spacing.spaceXs,
  },
  etaLabel: {
    ...typography.badgeLabel,
    color: colors.textSecondary,
    fontSize: 10,
  },
  etaTime: {
    ...typography.headlineLg,
    color: colors.textPrimary,
    fontWeight: '700',
    marginTop: 2,
  },
  etaDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.borderLight,
  },
  etaValue: {
    ...typography.titleCard,
    color: colors.textPrimary,
    marginTop: 2,
  },
  gatePassRef: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
    padding: spacing.spaceSm,
  },
  passRefLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  passRefToken: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  passRefLane: {
    ...typography.captionBold,
    color: colors.success,
  },
});
