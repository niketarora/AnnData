import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { useAppStore } from '../../store';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { FarmerStackParamList } from '../../types';

export const PhysicalInspectionResultScreen: React.FC = () => {
  const [state] = useAppStore();
  const navigation = useNavigation<NativeStackNavigationProp<FarmerStackParamList>>();
  const route = useRoute<RouteProp<FarmerStackParamList, 'PhysicalInspectionResult'>>();

  const bookingId = route.params?.bookingId || state.activeBookingId;
  const inspection = state.inspections[bookingId] || Object.values(state.inspections)[0];

  return (
    <View style={styles.container}>
      <AppHeader
        title="Physical Quality Verification"
        subtitle="Mandi Gate Lab Results"
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
        {/* Verification Verified Header */}
        <View style={styles.verifiedCard}>
          <View style={styles.verifiedRow}>
            <View style={styles.verifiedIcon}>
              <Ionicons name="checkmark-circle" size={28} color={colors.success} />
            </View>
            <View>
              <Text style={styles.verifiedTitle}>PHYSICAL QUALITY VERIFIED</Text>
              <Text style={styles.verifiedSub}>
                Assayed by Mandi Lab Inspector at Bay #03
              </Text>
            </View>
          </View>
        </View>

        {/* Dual Grade Comparison Card (AI vs Physical) */}
        <View style={styles.comparisonCard}>
          <Text style={styles.cardHeaderLabel}>GRADE INTEGRITY AUDIT</Text>

          <View style={styles.dualGradeRow}>
            <View style={styles.gradeBox}>
              <Text style={styles.gradeBoxLabel}>AI Pre-Grade (App)</Text>
              <Text style={styles.gradeBoxVal}>Grade A</Text>
              <Text style={styles.gradeBoxSub}>88/100 (91% conf.)</Text>
            </View>

            <View style={styles.arrowBetween}>
              <Ionicons name="arrow-forward" size={20} color={colors.primaryLight} />
            </View>

            <View style={[styles.gradeBox, styles.gradeBoxPhysical]}>
              <Text style={[styles.gradeBoxLabel, { color: colors.success }]}>
                Physical Grade (Mandi)
              </Text>
              <Text style={[styles.gradeBoxVal, { color: colors.success }]}>
                {inspection?.physicalGrade || 'Grade A'}
              </Text>
              <Text style={[styles.gradeBoxSub, { color: colors.primaryDark }]}>
                Verified Premium
              </Text>
            </View>
          </View>
        </View>

        {/* Laboratory Parameters Strip */}
        <View style={styles.paramsCard}>
          <Text style={styles.cardHeaderLabel}>ASSAYED LAB METRICS</Text>

          <View style={styles.metricsGrid}>
            <View style={styles.metricItem}>
              <Text style={styles.metricItemLabel}>Moisture Meter</Text>
              <Text style={styles.metricItemVal}>{inspection?.moisturePercent || 11.8}%</Text>
              <Text style={styles.metricItemStatus}>Optimal (Below 12%)</Text>
            </View>

            <View style={styles.metricItem}>
              <Text style={styles.metricItemLabel}>Foreign Matter</Text>
              <Text style={styles.metricItemVal}>{inspection?.admixturePercent || 0.8}%</Text>
              <Text style={styles.metricItemStatus}>Clean (Below 1%)</Text>
            </View>

            <View style={styles.metricItem}>
              <Text style={styles.metricItemLabel}>Visible Damage</Text>
              <Text style={styles.metricItemVal}>{inspection?.damagedGrainPercent || 1.2}%</Text>
              <Text style={styles.metricItemStatus}>Sound Grain</Text>
            </View>

            <View style={styles.metricItem}>
              <Text style={styles.metricItemLabel}>Lustre / Sheen</Text>
              <Text style={styles.metricItemVal}>Amber High</Text>
              <Text style={styles.metricItemStatus}>Premium Look</Text>
            </View>
          </View>

          {/* Checklist Passed */}
          <View style={styles.checklistList}>
            <Text style={styles.checkTitle}>Quality Parameter Verifications:</Text>
            {[
              'Insect infestation free (zero live weevils)',
              'Standard golden color & aroma intact',
              'Odor & fungal test cleared',
              'Uniform grain size compliant with APMC Grade A',
            ].map((text, i) => (
              <View key={i} style={styles.checkRow}>
                <Ionicons name="checkmark-circle" size={16} color={colors.success} />
                <Text style={styles.checkText}>{text}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Inspector Remarks Box */}
        <View style={styles.remarksBox}>
          <Text style={styles.remarksLabel}>Inspector Remarks:</Text>
          <Text style={styles.remarksText}>
            "{inspection?.inspectorNotes || 'Clean, mature golden Sharbati grains. Meets Premium Grade A APMC standard without deductions.'}"
          </Text>
          <Text style={styles.inspectorSignature}>
            — Ramesh Verma (Mandi Quality Assayer #14)
          </Text>
        </View>

        {/* Action Button */}
        <PrimaryButton
          title="Proceed to Weighbridge Results"
          iconName="speedometer-outline"
          onPress={() => navigation.navigate('WeighmentResult', { bookingId })}
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
  verifiedCard: {
    backgroundColor: colors.successTint,
    borderRadius: radius.xl,
    padding: spacing.spaceMd,
    borderWidth: 1,
    borderColor: colors.success,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceSm,
  },
  verifiedIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedTitle: {
    ...typography.badgeLabel,
    color: colors.success,
    letterSpacing: 0.5,
  },
  verifiedSub: {
    ...typography.caption,
    color: colors.primaryDark,
    marginTop: 2,
  },
  comparisonCard: {
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
  dualGradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 4,
  },
  gradeBox: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
    padding: spacing.spaceSm,
    alignItems: 'center',
  },
  gradeBoxPhysical: {
    backgroundColor: colors.successTint,
    borderWidth: 1.5,
    borderColor: colors.success,
  },
  gradeBoxLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
    fontSize: 10,
  },
  gradeBoxVal: {
    ...typography.headlineLg,
    color: colors.textPrimary,
    fontWeight: '700',
    marginVertical: 2,
  },
  gradeBoxSub: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  arrowBetween: {
    paddingHorizontal: 2,
  },
  paramsCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.spaceMd,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
    gap: spacing.spaceSm,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.spaceXs,
  },
  metricItem: {
    width: '48%',
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.md,
    padding: 10,
  },
  metricItemLabel: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  metricItemVal: {
    ...typography.titleCard,
    color: colors.textPrimary,
    fontWeight: '700',
    marginTop: 2,
  },
  metricItemStatus: {
    ...typography.captionBold,
    color: colors.success,
    fontSize: 10,
    marginTop: 2,
  },
  checklistList: {
    gap: 6,
    marginTop: spacing.spaceXs,
    paddingTop: spacing.spaceXs,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  checkTitle: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  checkText: {
    ...typography.caption,
    color: colors.textPrimary,
  },
  remarksBox: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
    padding: spacing.spaceMd,
    gap: 4,
  },
  remarksLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  remarksText: {
    ...typography.bodyBase,
    fontStyle: 'italic',
    color: colors.textPrimary,
    lineHeight: 18,
  },
  inspectorSignature: {
    ...typography.captionBold,
    color: colors.primaryDark,
    textAlign: 'right',
    marginTop: 4,
  },
});
