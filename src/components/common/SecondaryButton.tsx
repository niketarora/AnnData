import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../../theme';

interface SecondaryButtonProps {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: string;
  iconName?: keyof typeof Ionicons.glyphMap;
  rightIconName?: keyof typeof Ionicons.glyphMap;
  variant?: 'outline' | 'filled';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  title,
  onPress,
  disabled = false,
  icon,
  iconName,
  rightIconName,
  variant = 'filled',
  style,
  textStyle,
}) => {
  const isOutline = variant === 'outline';

  return (
    <TouchableOpacity
      style={[
        styles.button,
        isOutline ? styles.outlineButton : styles.filledButton,
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <View style={styles.contentRow}>
        {iconName && (
          <Ionicons
            name={iconName}
            size={18}
            color={
              disabled
                ? colors.textSecondary
                : isOutline
                ? colors.primaryLight
                : colors.textPrimary
            }
            style={styles.leftIcon}
          />
        )}
        <Text
          style={[
            styles.text,
            isOutline && styles.outlineText,
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
            color={
              disabled
                ? colors.textSecondary
                : isOutline
                ? colors.primaryLight
                : colors.textSecondary
            }
            style={styles.rightIcon}
          />
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    minHeight: spacing.touchMin,
    height: 48,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.spaceMd,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filledButton: {
    backgroundColor: colors.surfaceContainer,
  },
  outlineButton: {
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.primaryLight,
  },
  disabledButton: {
    backgroundColor: colors.surfaceContainerLow,
    borderColor: colors.border,
  },
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
    color: colors.textPrimary,
    fontSize: 14,
  },
  outlineText: {
    color: colors.primaryLight,
    fontWeight: '600',
  },
  disabledText: {
    color: colors.textSecondary,
  },
});
