import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadows } from '../../theme';

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  rightIconName?: keyof typeof Ionicons.glyphMap;
  variant?: 'primary' | 'danger' | 'warning' | 'darkGreen';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  icon,
  iconName,
  rightIconName,
  variant = 'primary',
  style,
  textStyle,
}) => {
  const getBackgroundColor = () => {
    if (disabled) return colors.border;
    switch (variant) {
      case 'danger':
        return colors.danger;
      case 'warning':
        return colors.warning;
      case 'darkGreen':
        return colors.primaryDark;
      case 'primary':
      default:
        return colors.primaryLight;
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: getBackgroundColor() },
        !disabled && styles.shadow,
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
    >
      {loading ? (
        <ActivityIndicator color={colors.onPrimary} size="small" />
      ) : (
        <View style={styles.contentRow}>
          {iconName && (
            <Ionicons
              name={iconName}
              size={19}
              color={disabled ? colors.textSecondary : colors.onPrimary}
              style={styles.leftIcon}
            />
          )}
          <Text
            style={[
              styles.text,
              disabled && styles.disabledText,
              textStyle,
            ]}
          >
            {title}
          </Text>
          {rightIconName && (
            <Ionicons
              name={rightIconName}
              size={18}
              color={disabled ? colors.textSecondary : colors.onPrimary}
              style={styles.rightIcon}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: spacing.touchMin,
    height: 50,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.spaceLg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadow: shadows.primaryAction,
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftIcon: {
    marginRight: spacing.spaceXs,
  },
  rightIcon: {
    marginLeft: spacing.spaceXs,
  },
  text: {
    ...typography.bodyBaseMedium,
    color: colors.onPrimary,
    fontWeight: '600',
    fontSize: 15,
  },
  disabledText: {
    color: colors.textSecondary,
  },
});
