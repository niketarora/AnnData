/**
 * Confidence Indicator Component
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Section 22: Pass-through Confidence Handling
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radius } from '../../../theme';

interface ConfidenceIndicatorProps {
  confidence: number | null | undefined;
  size?: 'sm' | 'md';
}

export const ConfidenceIndicator: React.FC<ConfidenceIndicatorProps> = ({
  confidence,
  size = 'md',
}) => {
  if (confidence === null || confidence === undefined || isNaN(confidence)) {
    return (
      <View style={styles.unavailableContainer}>
        <Ionicons name="help-circle-outline" size={13} color={colors.textSecondary} />
        <Text style={styles.unavailableText}>Confidence unavailable</Text>
      </View>
    );
  }

  const percent = Math.round(confidence * 100);
  const isHigh = percent >= 80;
  const isMedium = percent >= 60 && percent < 80;
  const badgeColor = isHigh ? colors.success : isMedium ? colors.warning : colors.error;

  return (
    <View style={styles.container}>
      <View style={styles.gaugeContainer}>
        <View
          style={[
            styles.gaugeFill,
            {
              width: `${percent}%`,
              backgroundColor: badgeColor,
            },
          ]}
        />
      </View>
      <View style={styles.labelRow}>
        <Ionicons name="shield-checkmark" size={size === 'sm' ? 12 : 14} color={badgeColor} />
        <Text style={[styles.labelText, { color: badgeColor }]}>
          {percent}% Model Confidence
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 4,
  },
  gaugeContainer: {
    height: 4,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  gaugeFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  labelText: {
    ...typography.captionBold,
    fontSize: 11,
  },
  unavailableContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  unavailableText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
    fontStyle: 'italic',
  },
});
