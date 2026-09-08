import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../../theme';
import { JourneyStep } from '../../types';

interface StepProgressBarProps {
  steps: JourneyStep[];
}

export const StepProgressBar: React.FC<StepProgressBarProps> = ({ steps }) => {
  const getIcon = (step: JourneyStep) => {
    switch (step.stepNumber) {
      case 1:
        return 'checkmark' as keyof typeof Ionicons.glyphMap;
      case 2:
        return 'hourglass-outline' as keyof typeof Ionicons.glyphMap;
      case 3:
        return 'bus-outline' as keyof typeof Ionicons.glyphMap;
      case 4:
        return 'log-in-outline' as keyof typeof Ionicons.glyphMap;
      case 5:
        return 'speedometer-outline' as keyof typeof Ionicons.glyphMap;
      case 6:
      default:
        return 'card-outline' as keyof typeof Ionicons.glyphMap;
    }
  };

  const getStepTheme = (status: JourneyStep['status']) => {
    if (status === 'completed') {
      return {
        pillBg: colors.success,
        iconBg: colors.successTint,
        iconColor: colors.success,
        textColor: colors.success,
      };
    } else if (status === 'current') {
      return {
        pillBg: colors.warning,
        iconBg: colors.warningTint,
        iconColor: colors.warning,
        textColor: colors.warning,
      };
    } else {
      return {
        pillBg: colors.surfaceContainerHigh,
        iconBg: colors.surfaceContainer,
        iconColor: colors.textSecondary,
        textColor: colors.textSecondary,
      };
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Mandi Journey Velocity</Text>
        <Text style={styles.stepCount}>
          Step {steps.findIndex((s) => s.status === 'current') + 1 || 2} of 6
        </Text>
      </View>

      {/* Linear Track Bars */}
      <View style={styles.linearTrack}>
        {steps.map((step) => {
          const theme = getStepTheme(step.status);
          return (
            <View
              key={step.stepNumber}
              style={[styles.trackSegment, { backgroundColor: theme.pillBg }]}
            />
          );
        })}
      </View>

      {/* Horizontal Steps Descriptions */}
      <View style={styles.iconsRow}>
        {steps.map((step) => {
          const theme = getStepTheme(step.status);
          return (
            <View key={step.stepNumber} style={styles.stepItem}>
              <View style={[styles.iconCircle, { backgroundColor: theme.iconBg }]}>
                <Ionicons name={getIcon(step)} size={13} color={theme.iconColor} />
              </View>
              <Text style={[styles.stepLabel, { color: theme.textColor }]}>
                {step.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.spaceXs,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.spaceXs,
  },
  headerTitle: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  stepCount: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  linearTrack: {
    flexDirection: 'row',
    gap: 4,
    height: 5,
    marginVertical: spacing.spaceXs,
  },
  trackSegment: {
    flex: 1,
    height: '100%',
    borderRadius: radius.full,
  },
  iconsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  stepItem: {
    alignItems: 'center',
    width: 50,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  stepLabel: {
    ...typography.badgeLabel,
    fontSize: 9,
    textAlign: 'center',
  },
});
