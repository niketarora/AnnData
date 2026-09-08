import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, typography, radius } from '../../theme';

export type StatusChipVariant =
  | 'success' // Accepted / Cleared / Live
  | 'warning' // Wait / Delay / Pending
  | 'danger'  // Risk / Rejected / Congested
  | 'info'    // In-Transit / Weighbridge / Inspecting
  | 'neutral';

interface StatusChipProps {
  label: string;
  variant?: StatusChipVariant;
  status?: string;
  showDot?: boolean;
  style?: ViewStyle;
}

export const StatusChip: React.FC<StatusChipProps> = ({
  label,
  variant,
  status,
  showDot = true,
  style,
}) => {
  const resolvedVariant: StatusChipVariant = (
    status === 'brand' ? 'success' :
    status === 'danger' || status === 'error' ? 'danger' :
    status === 'warning' ? 'warning' :
    status === 'info' ? 'info' :
    status === 'neutral' ? 'neutral' :
    (variant || 'success')
  );

  const getTheme = () => {
    switch (resolvedVariant) {
      case 'warning':
        return {
          bg: colors.warningTint,
          text: colors.warning,
          dot: colors.warning,
        };
      case 'danger':
        return {
          bg: colors.dangerTint,
          text: colors.danger,
          dot: colors.danger,
        };
      case 'info':
        return {
          bg: colors.infoTint,
          text: colors.info,
          dot: colors.info,
        };
      case 'neutral':
        return {
          bg: colors.surfaceContainer,
          text: colors.textSecondary,
          dot: colors.textSecondary,
        };
      case 'success':
      default:
        return {
          bg: colors.successTint,
          text: colors.success,
          dot: colors.success,
        };
    }
  };

  const theme = getTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }, style]}>
      {showDot && <View style={[styles.dot, { backgroundColor: theme.dot }]} />}
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
    alignSelf: 'flex-start',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    ...typography.badgeLabel,
    textTransform: 'uppercase',
  },
});
