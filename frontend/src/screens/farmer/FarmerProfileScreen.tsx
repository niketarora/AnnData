import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { useAppStore } from '../../store';
import { AppHeader } from '../../components/common/AppHeader';
import type { FarmerLanguage } from '../../i18n/farmerCopy';
import { FarmerStackParamList } from '../../types';

export const FarmerProfileScreen: React.FC = () => {
  const [state, store] = useAppStore();
  const navigation = useNavigation<NativeStackNavigationProp<FarmerStackParamList>>();
  const farmer = state.farmer;

  return (
    <View style={styles.container}>
      <AppHeader
        title="Kisan Profile"
        subtitle="Farm & Banking Settings"
        showBack
        onBack={() => navigation.goBack()}
        onNotificationPress={() => navigation.navigate('Notifications')}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <Image source={{ uri: farmer.avatarUrl }} style={styles.avatar} />
          <View style={styles.profileInfo}>
            <Text style={styles.name}>{farmer.name}</Text>
            <Text style={styles.phone}>{farmer.phone}</Text>
            <View style={styles.mandiTag}>
              <Ionicons name="location-sharp" size={12} color={colors.primaryLight} />
              <Text style={styles.mandiTagText}>{farmer.mandiRegion}</Text>
            </View>
          </View>
        </View>

        {/* Farm & Logistics Card */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>FARM & CARRIER INFORMATION</Text>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Total Land Holding</Text>
            <Text style={styles.itemValue}>{farmer.farmSizeAcres} Acres</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Carrier Type</Text>
            <Text style={styles.itemValue}>{farmer.vehicleType}</Text>
          </View>
          <View style={styles.itemRow}>
            <Text style={styles.itemLabel}>Vehicle Plate</Text>
            <Text style={styles.itemValue}>{farmer.vehiclePlate}</Text>
          </View>
        </View>

        {/* Verified Bank / UPI Details */}
        <View style={styles.sectionCard}>
          <View style={styles.bankHeaderRow}>
            <Text style={styles.sectionLabel}>DIRECT SETTLEMENT ACCOUNT</Text>
            <View style={styles.verifiedBadge}>
              <Ionicons name="shield-checkmark" size={13} color={colors.success} />
              <Text style={styles.verifiedText}>Aadhaar DBT Linked</Text>
            </View>
          </View>

          <View style={styles.bankCardContent}>
            <Ionicons name="card" size={24} color={colors.primaryLight} />
            <View style={styles.bankTextCol}>
              <Text style={styles.bankName}>{farmer.bankAccount.bankName}</Text>
              <Text style={styles.accNumber}>Account: {farmer.bankAccount.accountNumberMasked}</Text>
              <Text style={styles.upiId}>UPI: {farmer.bankAccount.upiId}</Text>
            </View>
          </View>
        </View>

        {/* Language Selection */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>PREFERRED APP LANGUAGE</Text>
          <View style={styles.langRow}>
            {[
              { id: 'en', label: 'English' },
              { id: 'hi', label: 'हिन्दी' },
              { id: 'pa', label: 'ਪੰਜਾਬੀ' },
            ].map((lang) => (
              <TouchableOpacity
                key={lang.id}
                style={[styles.langChip, state.language === lang.id && styles.langChipActive]}
                onPress={() => store.setLanguage(lang.id as FarmerLanguage)}
                accessibilityRole="radio"
                accessibilityState={{ selected: state.language === lang.id }}
              >
                <Text
                  style={[
                    styles.langChipText,
                    state.language === lang.id && styles.langChipTextActive,
                  ]}
                >
                  {lang.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.gutterMobile,
    gap: spacing.spaceMd,
    paddingBottom: 60,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceMd,
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.spaceMd,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceContainer,
  },
  profileInfo: {
    flex: 1,
  },
  name: {
    ...typography.headlineMd,
    color: colors.textPrimary,
  },
  phone: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  mandiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  mandiTagText: {
    ...typography.captionBold,
    color: colors.primaryLight,
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.spaceMd,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
    gap: spacing.spaceSm,
  },
  sectionLabel: {
    ...typography.badgeLabel,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  itemLabel: {
    ...typography.bodyBase,
    color: colors.textSecondary,
  },
  itemValue: {
    ...typography.bodyBaseMedium,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  bankHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.successTint,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  verifiedText: {
    ...typography.badgeLabel,
    color: colors.success,
    fontSize: 9,
  },
  bankCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceSm,
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
    padding: spacing.spaceSm,
    marginTop: 2,
  },
  bankTextCol: {
    flex: 1,
  },
  bankName: {
    ...typography.titleCard,
    color: colors.textPrimary,
  },
  accNumber: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 1,
  },
  upiId: {
    ...typography.captionBold,
    color: colors.primaryDark,
    marginTop: 1,
  },
  langRow: {
    flexDirection: 'row',
    gap: spacing.spaceSm,
    marginTop: 2,
  },
  langChip: {
    flex: 1,
    height: 44,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  langChipActive: {
    backgroundColor: colors.primaryLight,
  },
  langChipText: {
    ...typography.bodyBaseMedium,
    color: colors.textPrimary,
  },
  langChipTextActive: {
    color: colors.onPrimary,
    fontWeight: '600',
  },
});
