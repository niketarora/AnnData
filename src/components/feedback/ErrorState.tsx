import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../../theme';
import { SecondaryButton } from '../common/SecondaryButton';

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  style?: ViewStyle;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Something Went Wrong',
  message,
  onRetry,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.iconCircle}>
        <Ionicons name="alert-circle-outline" size={32} color={colors.danger} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry && (
        <SecondaryButton
          title="Try Again"
          onPress={onRetry}
          iconName="refresh-outline"
          style={styles.retryButton}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.space2xl,
    backgroundColor: colors.dangerTint,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.danger,
    marginVertical: spacing.spaceMd,
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.spaceMd,
  },
  title: {
    ...typography.headlineMd,
    color: colors.dangerDark,
    textAlign: 'center',
  },
  message: {
    ...typography.bodyBase,
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 20,
  },
  retryButton: {
    marginTop: spacing.spaceLg,
    minWidth: 150,
  },
});
