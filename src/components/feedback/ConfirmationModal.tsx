import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { PrimaryButton } from '../common/PrimaryButton';
import { SecondaryButton } from '../common/SecondaryButton';

interface ConfirmationModalProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'primary' | 'danger' | 'warning';
  iconName?: keyof typeof Ionicons.glyphMap;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  iconName = 'help-circle-outline',
  onConfirm,
  onCancel,
}) => {
  const getIconColor = () => {
    switch (confirmVariant) {
      case 'danger':
        return colors.danger;
      case 'warning':
        return colors.warning;
      case 'primary':
      default:
        return colors.primaryLight;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <TouchableWithoutFeedback onPress={onCancel}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.modalCard}>
              <View style={[styles.iconContainer, { backgroundColor: `${getIconColor()}15` }]}>
                <Ionicons name={iconName} size={30} color={getIconColor()} />
              </View>

              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>

              <View style={styles.buttonsRow}>
                <SecondaryButton
                  title={cancelText}
                  onPress={onCancel}
                  style={styles.cancelButton}
                />
                <PrimaryButton
                  title={confirmText}
                  onPress={onConfirm}
                  variant={confirmVariant}
                  style={styles.confirmButton}
                />
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(23, 32, 26, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.gutterMobile,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.spaceXl,
    alignItems: 'center',
    ...shadows.lg,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.spaceMd,
  },
  title: {
    ...typography.headlineMd,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  message: {
    ...typography.bodyBase,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: spacing.spaceXl,
    lineHeight: 20,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: spacing.spaceSm,
    width: '100%',
  },
  cancelButton: {
    flex: 1,
  },
  confirmButton: {
    flex: 1,
  },
});
