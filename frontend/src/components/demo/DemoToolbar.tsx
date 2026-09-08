import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { useAppStore } from '../../store';
import { navigationRef } from '../../navigation/RootNavigator';

export const DemoToolbar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(true);
  const [state, store] = useAppStore();

  const toggleRole = () => {
    const nextRole = state.currentRole === 'FARMER' ? 'BUYER' : 'FARMER';
    store.setRole(nextRole);
    if (navigationRef.isReady()) {
      navigationRef.navigate(nextRole === 'BUYER' ? 'BuyerRoot' : 'FarmerRoot');
    }
  };

  return (
    <View style={styles.floatingContainer}>
      {/* Pill Toggle Bar */}
      <View style={styles.pillBar}>
        <TouchableOpacity
          style={styles.toggleExpandButton}
          onPress={() => setCollapsed(!collapsed)}
          activeOpacity={0.8}
        >
          <View style={styles.dotIndicator} />
          <Text style={styles.pillBarTitle}>
            DEMO MODE: <Text style={{ color: colors.primaryLight }}>{state.currentRole}</Text>
          </Text>
          <Ionicons
            name={collapsed ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={colors.textSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.switchRoleButton,
            { backgroundColor: state.currentRole === 'FARMER' ? colors.info : colors.primaryLight },
          ]}
          onPress={toggleRole}
          activeOpacity={0.8}
        >
          <Ionicons
            name={state.currentRole === 'FARMER' ? 'business' : 'person'}
            size={13}
            color={colors.onPrimary}
          />
          <Text style={styles.switchRoleText}>
            Switch to {state.currentRole === 'FARMER' ? 'Buyer' : 'Kisan'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Expanded Quick State Triggers */}
      {!collapsed && (
        <View style={styles.expandedPanel}>
          <Text style={styles.panelHeader}>Simulate Cross-User Workflow Actions:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.actionsRow}>
            <TouchableOpacity
              style={[styles.actionChip, { borderColor: colors.warning }]}
              onPress={() => store.addQueueDelay(20)}
            >
              <Ionicons name="time-outline" size={14} color={colors.warning} />
              <Text style={[styles.actionChipText, { color: colors.warningDark }]}>+20m Delay (Wait)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionChip, { borderColor: colors.primaryLight }]}
              onPress={() => store.clearQueueDelay()}
            >
              <Ionicons name="flash-outline" size={14} color={colors.primaryLight} />
              <Text style={[styles.actionChipText, { color: colors.primaryLight }]}>Clear Delay (Leave Now)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionChip, { borderColor: colors.info }]}
              onPress={() => store.checkInFarmer()}
            >
              <Ionicons name="qr-code-outline" size={14} color={colors.info} />
              <Text style={[styles.actionChipText, { color: colors.info }]}>Check-In at Gate</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionChip, { borderColor: colors.primaryDark }]}
              onPress={() => store.submitOffer({ ratePerQuintal: 2485, netPayout: 48654.5 })}
            >
              <Ionicons name="pricetag-outline" size={14} color={colors.primaryDark} />
              <Text style={[styles.actionChipText, { color: colors.primaryDark }]}>Send Buyer Offer</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionChip, { borderColor: colors.success }]}
              onPress={() => store.acceptOffer()}
            >
              <Ionicons name="checkmark-circle-outline" size={14} color={colors.success} />
              <Text style={[styles.actionChipText, { color: colors.success }]}>Farmer Accepts</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionChip, { borderColor: colors.successDark }]}
              onPress={() => store.releasePayment()}
            >
              <Ionicons name="card-outline" size={14} color={colors.successDark} />
              <Text style={[styles.actionChipText, { color: colors.successDark }]}>Release UPI Payment</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionChip, { borderColor: colors.danger }]}
              onPress={() => store.resetScenario()}
            >
              <Ionicons name="refresh-outline" size={14} color={colors.danger} />
              <Text style={[styles.actionChipText, { color: colors.danger }]}>Reset Demo Data</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  floatingContainer: {
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    ...shadows.lg,
  },
  pillBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.spaceMd,
    paddingVertical: 8,
  },
  toggleExpandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  pillBarTitle: {
    ...typography.badgeLabel,
    color: colors.textPrimary,
  },
  switchRoleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.full,
  },
  switchRoleText: {
    ...typography.captionBold,
    color: colors.onPrimary,
    fontSize: 11,
  },
  expandedPanel: {
    paddingHorizontal: spacing.spaceMd,
    paddingBottom: spacing.spaceSm,
    backgroundColor: colors.surfaceContainerLow,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  panelHeader: {
    ...typography.caption,
    color: colors.textSecondary,
    marginVertical: 4,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    borderWidth: 1,
  },
  actionChipText: {
    ...typography.captionBold,
    fontSize: 11,
  },
});
