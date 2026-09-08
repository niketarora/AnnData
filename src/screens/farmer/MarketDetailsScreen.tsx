import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { useAppStore } from '../../store';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { FarmerStackParamList } from '../../types';

export const MarketDetailsScreen: React.FC = () => {
  const [state] = useAppStore();
  const navigation = useNavigation<NativeStackNavigationProp<FarmerStackParamList>>();
  const route = useRoute<RouteProp<FarmerStackParamList, 'MarketDetails'>>();

  const marketId = route.params?.marketId || 'mkt-b-taraori';
  const market = state.markets.find((m) => m.id === marketId) || state.markets[0];

  return (
    <View style={styles.container}>
      <AppHeader
        title={market.name}
        subtitle={`${market.distanceKm} km away • ${market.location}`}
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
        {/* Mandi Overview Card */}
        <View style={styles.overviewCard}>
          <Text style={styles.cardHeaderLabel}>MARKET OPERATING STATUS</Text>
          <View style={styles.statusRow}>
            <View style={styles.openTag}>
              <View style={styles.openDot} />
              <Text style={styles.openText}>INTAKE ACTIVE</Text>
            </View>
            <Text style={styles.hoursText}>Hours: {market.operatingHours}</Text>
          </View>

          <View style={styles.ratesRow}>
            <View>
              <Text style={styles.ratesLabel}>Today's Benchmark Rate</Text>
              <Text style={styles.ratesValue}>₹{market.grossPricePerQuintal} / QTL</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.ratesLabel}>Expected Net Realization</Text>
              <Text style={[styles.ratesValue, { color: colors.success }]}>
                ₹{market.expectedNetPayout.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>
        </View>

        {/* Facilities Grid */}
        <View style={styles.facilitiesCard}>
          <Text style={styles.cardHeaderLabel}>MANDI INFRASTRUCTURE & AMENITIES</Text>
          <View style={styles.facilitiesGrid}>
            {market.facilities.map((fac, i) => (
              <View key={i} style={styles.facItem}>
                <Ionicons
                  name={
                    fac.icon === 'scale'
                      ? 'speedometer-outline'
                      : fac.icon === 'science'
                      ? 'flask-outline'
                      : fac.icon === 'roofing'
                      ? 'business-outline'
                      : 'card-outline'
                  }
                  size={20}
                  color={colors.primaryLight}
                />
                <Text style={styles.facName}>{fac.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Operational Flow Notice */}
        <View style={styles.flowCard}>
          <Text style={styles.cardHeaderLabel}>INFLOW GUIDELINES</Text>
          <View style={styles.flowStep}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.flowText}>Dedicated Gate 2 Express Line for registered digital tokens.</Text>
          </View>
          <View style={styles.flowStep}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.flowText}>On-site moisture testing calibrated with Agmarknet laboratory standard.</Text>
          </View>
          <View style={styles.flowStep}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.flowText}>Direct benefit transfer (Instant UPI/NEFT) upon weighbridge confirmation.</Text>
          </View>
        </View>

        {/* Book Slot CTA */}
        <PrimaryButton
          title="Book Slot at this Mandi"
          iconName="calendar-outline"
          onPress={() => navigation.navigate('BookSlot', { marketId: market.id })}
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
  overviewCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.spaceMd,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
    gap: spacing.spaceSm,
  },
  cardHeaderLabel: {
    ...typography.badgeLabel,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  openTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.successTint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  openDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  openText: {
    ...typography.badgeLabel,
    color: colors.success,
  },
  hoursText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  ratesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
    padding: spacing.spaceSm,
    marginTop: spacing.spaceXs,
  },
  ratesLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  ratesValue: {
    ...typography.titleCard,
    color: colors.textPrimary,
    fontWeight: '700',
    marginTop: 2,
  },
  facilitiesCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.spaceMd,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
    gap: spacing.spaceSm,
  },
  facilitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.spaceSm,
  },
  facItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.surfaceContainer,
    padding: spacing.spaceSm,
    borderRadius: radius.md,
  },
  facName: {
    ...typography.captionBold,
    color: colors.textPrimary,
    flex: 1,
  },
  flowCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.spaceMd,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
    gap: 8,
  },
  flowStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  flowText: {
    ...typography.caption,
    color: colors.textPrimary,
    flex: 1,
    lineHeight: 18,
  },
});
