import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  User,
  Building2,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Scale,
  Sparkles,
} from 'lucide-react-native';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'RoleSelection'>;

export const RoleSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [selectedRole, setSelectedRole] = useState<'FARMER' | 'BUYER'>('FARMER');

  const handleContinue = () => {
    navigation.navigate('LoginOTP', { role: selectedRole });
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Select Your Portal"
        subtitle="Choose your operational role in AgriMandi"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.leadText}>
          Experience how AgriMandi streamlines the agricultural supply chain from farm gate to mandi settlement.
        </Text>

        {/* Farmer Card */}
        <TouchableOpacity
          style={[
            styles.roleOptionCard,
            selectedRole === 'FARMER' && styles.roleOptionCardSelected,
          ]}
          onPress={() => setSelectedRole('FARMER')}
          activeOpacity={0.8}
        >
          <View style={styles.cardTopRow}>
            <View style={[styles.iconWrapper, { backgroundColor: colors.primaryBg }]}>
              <User size={24} color={colors.primary} />
            </View>
            <View style={styles.radioOuter}>
              {selectedRole === 'FARMER' && <View style={styles.radioInner} />}
            </View>
          </View>

          <Text style={styles.roleTitle}>Kisan (Farmer)</Text>
          <Text style={styles.roleDesc}>
            Grade your harvest using computer vision, discover top net realization mandis, book arrival slots, and receive instant direct benefit transfers.
          </Text>

          <View style={styles.features}>
            <View style={styles.featureItem}>
              <CheckCircle2 size={16} color={colors.primary} />
              <Text style={styles.featureItemText}>AI Quality Assessment (Moisture & AGMARK)</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckCircle2 size={16} color={colors.primary} />
              <Text style={styles.featureItemText}>True Net Realization (Freight & Mandi fee computed)</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckCircle2 size={16} color={colors.primary} />
              <Text style={styles.featureItemText}>Dynamic Departure ETA ('WAIT' / 'LEAVE NOW')</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Buyer / Operator Card */}
        <TouchableOpacity
          style={[
            styles.roleOptionCard,
            selectedRole === 'BUYER' && styles.roleOptionCardSelected,
          ]}
          onPress={() => setSelectedRole('BUYER')}
          activeOpacity={0.8}
        >
          <View style={styles.cardTopRow}>
            <View style={[styles.iconWrapper, { backgroundColor: '#E0F2FE' }]}>
              <Building2 size={24} color="#0284C7" />
            </View>
            <View style={styles.radioOuter}>
              {selectedRole === 'BUYER' && <View style={styles.radioInner} />}
            </View>
          </View>

          <Text style={styles.roleTitle}>Buyer / Mandi Operator</Text>
          <Text style={styles.roleDesc}>
            Broadcast procurement demands, throttle gate queues to eliminate road choke points, verify physical grades & scale weights, and release escrow DBT.
          </Text>

          <View style={styles.features}>
            <View style={styles.featureItem}>
              <CheckCircle2 size={16} color="#0284C7" />
              <Text style={styles.featureItemText}>Live Gate Traffic Throttling & Delay Broadcasts</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckCircle2 size={16} color="#0284C7" />
              <Text style={styles.featureItemText}>Electronic Weighbridge & Physical Grade Recording</Text>
            </View>
            <View style={styles.featureItem}>
              <CheckCircle2 size={16} color="#0284C7" />
              <Text style={styles.featureItemText}>Binding Offers & Instant Mandi Escrow Payouts</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Submit */}
        <View style={styles.actionBox}>
          <PrimaryButton
            title={`Continue as ${selectedRole === 'FARMER' ? 'Farmer' : 'Buyer'}`}
            icon="chevron"
            onPress={handleContinue}
          />
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
  leadText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.xs,
  },
  roleOptionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 2,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  roleOptionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.surface,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  roleTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fontFamilies.bold,
    color: colors.textPrimary,
  },
  roleDesc: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: spacing.md,
  },
  features: {
    gap: spacing.xs,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  featureItemText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.medium,
    color: colors.textPrimary,
  },
  actionBox: {
    marginTop: spacing.md,
  },
});
