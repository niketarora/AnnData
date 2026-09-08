import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { useAppStore } from '../../store';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { BuyerStackParamList } from '../../types';

export const DemandManagementScreen: React.FC = () => {
  const [state] = useAppStore();
  const navigation = useNavigation<NativeStackNavigationProp<BuyerStackParamList>>();

  return (
    <View style={styles.container}>
      <AppHeader
        title="Buying targets"
        subtitle="What your mandi needs"
        onNotificationPress={() => navigation.navigate('BuyerNotifications')}
        onProfilePress={() => navigation.navigate('BuyerProfile')}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Total Quota Header */}
        <View style={styles.quotaHeaderCard}>
          <Text style={styles.quotaHeaderLabel}>TOTAL NEEDED TODAY</Text>
          <Text style={styles.quotaHeaderValue}>700 Quintals</Text>
          <Text style={styles.quotaHeaderSub}>
            425 quintals received • 61% complete
          </Text>
        </View>

        {/* Demand Cards List */}
        <View style={styles.demandsList}>
          {state.demands.map((dem) => {
            const percent = Math.round(
              (dem.fulfilledQuantityQuintals / dem.requiredQuantityQuintals) * 100
            );

            return (
              <View key={dem.id} style={styles.demandCard}>
                <View style={styles.demandHeader}>
                  <View>
                    <Text style={styles.cropTitle}>
                      {dem.crop} ({dem.variety})
                    </Text>
                    <Text style={styles.minGradeText}>
                      Minimum quality: <Text style={{ color: colors.success }}>{dem.minimumGrade}</Text>
                    </Text>
                  </View>
                  <View style={styles.statusPill}>
                    <Text style={styles.statusPillText}>{dem.status}</Text>
                  </View>
                </View>

                {/* Target & Price Strip */}
                <View style={styles.targetPriceRow}>
                  <View>
                    <Text style={styles.colLabel}>Quantity needed</Text>
                    <Text style={styles.colValue}>{dem.requiredQuantityQuintals} Quintals</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.colLabel}>Buying price</Text>
                    <Text style={[styles.colValue, { color: colors.primaryDark }]}>
                      ₹{dem.minPrice} – ₹{dem.maxPrice} / QTL
                    </Text>
                  </View>
                </View>

                {/* Fulfillment Progress */}
                <View style={styles.progressSection}>
                  <View style={styles.progressLabelRow}>
                    <Text style={styles.progressLabel}>Received: {dem.fulfilledQuantityQuintals} quintals</Text>
                    <Text style={styles.progressPercent}>{percent}%</Text>
                  </View>
                  <View style={styles.progressBarTrack}>
                    <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
                  </View>
                </View>

                <View style={styles.demandFooter}>
                  <Text style={styles.footerNote}>
                    Terminal {dem.assignedCounter} • {dem.paymentTerms}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>

        {/* Action to create new demand */}
        <PrimaryButton
          title="Add buying target"
          iconName="add-circle-outline"
          onPress={() => navigation.navigate('CreateDemand')}
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
  quotaHeaderCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.spaceMd,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  quotaHeaderLabel: {
    ...typography.badgeLabel,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  quotaHeaderValue: {
    ...typography.currencyDisplay,
    color: colors.primaryDark,
    fontSize: 32,
    marginVertical: 4,
  },
  quotaHeaderSub: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  demandsList: {
    gap: spacing.spaceMd,
  },
  demandCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.spaceMd,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
    gap: spacing.spaceSm,
  },
  demandHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  cropTitle: {
    ...typography.headlineMd,
    color: colors.textPrimary,
  },
  minGradeText: {
    ...typography.captionBold,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusPill: {
    backgroundColor: colors.successTint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  statusPillText: {
    ...typography.badgeLabel,
    color: colors.success,
  },
  targetPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.md,
    padding: spacing.spaceSm,
  },
  colLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  colValue: {
    ...typography.bodyBaseMedium,
    color: colors.textPrimary,
    fontWeight: '700',
    marginTop: 2,
  },
  progressSection: {
    gap: 4,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  progressPercent: {
    ...typography.captionBold,
    color: colors.primaryDark,
  },
  progressBarTrack: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: colors.primaryLight,
  },
  demandFooter: {
    paddingTop: spacing.spaceXs,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  footerNote: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
