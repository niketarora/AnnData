/**
 * Freshness Badge Component
 * AgriFintech Operating System (KrishiNetra 2.0 Architecture)
 * Section 7 & 35: Data Freshness Visual Indicator
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, radius } from '../../../theme';
import { DataFreshnessStatus } from '../types/intelligence.types';
import { IntelligenceFormatters } from '../formatters/intelligenceFormatters';

interface FreshnessBadgeProps {
  status: DataFreshnessStatus;
  observedAt?: string;
  showRelativeTime?: boolean;
}

export const FreshnessBadge: React.FC<FreshnessBadgeProps> = ({
  status,
  observedAt,
  showRelativeTime = true,
}) => {
  let badgeColor: string = colors.success;
  let bgColor: string = colors.successTint;
  let iconName: keyof typeof Ionicons.glyphMap = 'ellipse';

  if (status === 'RECENT') {
    badgeColor = colors.info;
    bgColor = colors.infoTint;
    iconName = 'time-outline';
  } else if (status === 'STALE') {
    badgeColor = colors.warning;
    bgColor = colors.warningTint;
    iconName = 'alert-circle-outline';
  } else if (status === 'UNAVAILABLE') {
    badgeColor = colors.textSecondary;
    bgColor = colors.surfaceContainer;
    iconName = 'cloud-offline-outline';
  }

  const relativeTime = showRelativeTime && observedAt ? ` • ${IntelligenceFormatters.formatRelativeTime(observedAt)}` : '';

  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <Ionicons name={iconName} size={11} color={badgeColor} />
      <Text style={[styles.text, { color: badgeColor }]}>
        {status} {relativeTime}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  text: {
    ...typography.badgeLabel,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
