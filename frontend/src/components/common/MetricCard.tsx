import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadows } from '../../theme';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  subtext?: string;
  trend?: string;
  trendDirection?: 'up' | 'down';
  icon?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  iconColor?: string;
  badgeText?: string;
  badgeVariant?: 'success' | 'warning' | 'info';
  style?: ViewStyle;
  highlightBandColor?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  subtext,
  trend,
  trendDirection,
  icon,
  iconName,
  iconColor = colors.primaryLight,
  badgeText,
  badgeVariant = 'success',
  style,
  highlightBandColor,
}) => {
  const effectiveSubtitle = subtitle || subtext;
  const getBadgeStyle = () => {
    switch (badgeVariant) {
      case 'warning':
        return { bg: colors.warningTint, text: colors.warning };
      case 'info':
        return { bg: colors.infoTint, text: colors.info };
      case 'success':
      default:
        return { bg: colors.successTint, text: colors.success };
    }
  };

  const badgeTheme = getBadgeStyle();

  return (
    <View style={[styles.card, style]}>
      {highlightBandColor && (
        <View style={[styles.highlightBand, { backgroundColor: highlightBandColor }]} />
      )}
      <View style={styles.headerRow}>
        <View style={styles.titleRow}>
          {iconName && (
            <View style={styles.iconContainer}>
              <Ionicons name={iconName} size={18} color={iconColor} />
            </View>
          )}
          <Text style={styles.titleText}>{title}</Text>
        </View>
        {badgeText && (
          <View style={[styles.badgeContainer, { backgroundColor: badgeTheme.bg }]}>
            <Text style={[styles.badgeText, { color: badgeTheme.text }]}>{badgeText}</Text>
          </View>
        )}
      </View>
      <Text style={styles.valueText}>{value}</Text>
      {effectiveSubtitle && <Text style={styles.subtitleText}>{effectiveSubtitle}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.spaceMd,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
    position: 'relative',
    overflow: 'hidden',
  },
  highlightBand: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.spaceXs,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  iconContainer: {
    width: 28,
    height: 28,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleText: {
    ...typography.captionBold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  badgeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  badgeText: {
    ...typography.badgeLabel,
  },
  valueText: {
    ...typography.headlineLg,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  subtitleText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 3,
  },
});
