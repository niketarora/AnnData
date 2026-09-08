import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  User,
  Building2,
  ShieldCheck,
  CreditCard,
  Settings,
  Scale,
  LogOut,
  RefreshCw,
  Repeat,
  ChevronRight,
  ExternalLink,
} from 'lucide-react-native';
import { useAppStore } from '../../store';
import { mockStore } from '../../store/mockStore';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SecondaryButton } from '../../components/common/SecondaryButton';
import { StatusChip } from '../../components/common/StatusChip';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BuyerStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<BuyerStackParamList, 'BuyerProfile'>;

export const BuyerProfileScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const state = useAppStore();
  const { buyer } = state;

  const handleSwitchToFarmer = () => {
    mockStore.setRole('FARMER');
  };

  const handleResetDemo = () => {
    Alert.alert(
      'Reset Demo Scenario',
      'This will reset all queue tokens, inspection records, and offers back to the pristine initial state.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset Everything',
          style: 'destructive',
          onPress: () => {
            mockStore.resetScenario();
            Alert.alert('Demo Reset', 'All states have been reset to pristine initial values.');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Buyer & Operator Profile"
        subtitle="APMC Mandi Licensed Procurement Portal"
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarBox}>
              <Text style={styles.avatarInitial}>AA</Text>
            </View>
            <View style={styles.profileMeta}>
              <View style={styles.nameRow}>
                <Text style={styles.userName}>{buyer.name}</Text>
                <ShieldCheck size={18} color={colors.primary} />
              </View>
              <Text style={styles.firmName}>{buyer.firmName || buyer.organizationName}</Text>
              <Text style={styles.userPhone}>{buyer.phoneNumber || buyer.phone}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.badgeRow}>
            <View style={styles.badgeItem}>
              <Text style={styles.badgeLabel}>License No</Text>
              <Text style={styles.badgeVal}>{buyer.licenseNumber}</Text>
            </View>
            <View style={styles.badgeItem}>
              <Text style={styles.badgeLabel}>GSTIN</Text>
              <Text style={styles.badgeVal}>06AABCK1234F1Z8</Text>
            </View>
            <View style={styles.badgeItem}>
              <Text style={styles.badgeLabel}>APMC Status</Text>
              <Text style={[styles.badgeVal, { color: colors.success }]}>Active & Verified</Text>
            </View>
          </View>
        </View>

        {/* Mandi Yard Assignments */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Building2 size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>Station Assignments</Text>
          </View>

          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingKey}>Mandi Complex</Text>
              <Text style={styles.settingVal}>Taraori Grain Mandi (Yard 2)</Text>
            </View>
            <StatusChip label="ASSIGNED" status="brand" />
          </View>

          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingKey}>Physical Quality Bay</Text>
              <Text style={styles.settingVal}>Bay 3 (Express Intake Lane)</Text>
            </View>
          </View>

          <View style={styles.settingItem}>
            <View>
              <Text style={styles.settingKey}>Digital Scale Connection</Text>
              <Text style={styles.settingVal}>Mettler Toledo Scale #2 (Calibrated)</Text>
            </View>
          </View>
        </View>

        {/* Escrow & Banking Account */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <CreditCard size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>Settlement Escrow Account</Text>
          </View>

          <View style={styles.escrowBox}>
            <View style={styles.escrowTop}>
              <Text style={styles.escrowBank}>HDFC Mandi Clearing Account</Text>
              <Text style={styles.escrowStatus}>ACTIVE</Text>
            </View>
            <Text style={styles.escrowAccNo}>A/C: **** **** 9821</Text>
            <View style={styles.balanceRow}>
              <Text style={styles.balanceLabel}>Available Escrow Balance:</Text>
              <Text style={styles.balanceVal}>₹4,50,000.00</Text>
            </View>
          </View>
        </View>

        {/* Persona Switch & Demo Actions */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Repeat size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>Role & Demo Controls</Text>
          </View>

          <TouchableOpacity style={styles.actionRow} onPress={handleSwitchToFarmer}>
            <View style={styles.actionLeft}>
              <User size={18} color={colors.primary} />
              <View>
                <Text style={styles.actionTitle}>Switch to Farmer (Kisan) Mode</Text>
                <Text style={styles.actionSub}>Experience the journey from farmer perspective</Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionRow} onPress={handleResetDemo}>
            <View style={styles.actionLeft}>
              <RefreshCw size={18} color={colors.error} />
              <View>
                <Text style={[styles.actionTitle, { color: colors.error }]}>Reset Demo Scenario</Text>
                <Text style={styles.actionSub}>Restore pristine seed data and queue counters</Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Regulatory footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            AgriMandi OS • APMC Digital Mandi Regulation Compliant
          </Text>
          <Text style={styles.footerSub}>App Version 1.0.0 (Phase 1 Frontend Prototype)</Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  profileCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarBox: {
    width: 60,
    height: 60,
    borderRadius: radius.full,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
  },
  avatarInitial: {
    fontSize: 22,
    fontFamily: typography.fontFamilies.bold,
    color: colors.primary,
  },
  profileMeta: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fontFamilies.bold,
    color: colors.textPrimary,
  },
  firmName: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamilies.semiBold,
    color: colors.primaryDark,
    marginTop: 2,
  },
  userPhone: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.md,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  badgeItem: {
    alignItems: 'flex-start',
  },
  badgeLabel: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textTertiary,
  },
  badgeVal: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.semiBold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamilies.bold,
    color: colors.textPrimary,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  settingKey: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
  },
  settingVal: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamilies.medium,
    color: colors.textPrimary,
    marginTop: 2,
  },
  escrowBox: {
    backgroundColor: colors.primaryBg,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  escrowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  escrowBank: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamilies.bold,
    color: colors.primaryDark,
  },
  escrowStatus: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.bold,
    color: colors.success,
  },
  escrowAccNo: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
    marginVertical: 4,
  },
  balanceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  balanceLabel: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.medium,
    color: colors.primaryDark,
  },
  balanceVal: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamilies.bold,
    color: colors.primaryDark,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  actionTitle: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamilies.semiBold,
    color: colors.textPrimary,
  },
  actionSub: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.md,
    gap: 4,
  },
  footerText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.medium,
    color: colors.textSecondary,
  },
  footerSub: {
    fontSize: 11,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textTertiary,
  },
});
