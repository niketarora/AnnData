import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Sprout,
  MapPin,
  Truck,
  CreditCard,
  CheckCircle2,
  Building2,
  ShieldCheck,
} from 'lucide-react-native';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { mockStore } from '../../store/mockStore';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'FarmerOnboarding'>;

export const FarmerOnboardingScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [fullName, setFullName] = useState('Rajesh Kumar');
  const [village, setVillage] = useState('Taraori Rural, Karnal');
  const [landHolding, setLandHolding] = useState('8.5');
  const [vehicleNo, setVehicleNo] = useState('HR-05-AB-4821');
  const [bankAcc, setBankAcc] = useState('State Bank of India (A/C ****4892)');
  const [submitting, setSubmitting] = useState(false);

  const handleFinishOnboarding = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      mockStore.setRole('FARMER');
      Alert.alert(
        'Onboarding Complete!',
        'Your farmer digital identity is verified with Taraori and Karnal APMC mandis. Welcome to AgriMandi!',
        [
          {
            text: 'Enter Kisan Dashboard',
            onPress: () => navigation.navigate('FarmerRoot'),
          },
        ]
      );
    }, 500);
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Kisan Profile Setup"
        subtitle="Step 2 of 2 • Register Farm & Logistics"
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Personal Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Farmer Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name (as per Aadhaar)</Text>
            <TextInput
              style={styles.textInput}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Village & District</Text>
            <TextInput
              style={styles.textInput}
              value={village}
              onChangeText={setVillage}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Farm Landholding (Acres)</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={landHolding}
              onChangeText={setLandHolding}
            />
          </View>
        </View>

        {/* Transport & Vehicle Details */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Truck size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>Haulage Logistics & Gate Pass</Text>
          </View>
          <Text style={styles.cardDesc}>
            Registered vehicle registration allows automatic camera recognition at Mandi Express Gates.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Vehicle Number (Tractor / Small Commercial)</Text>
            <TextInput
              style={styles.textInput}
              value={vehicleNo}
              onChangeText={setVehicleNo}
              autoCapitalize="characters"
            />
          </View>
        </View>

        {/* Settlement Account */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <CreditCard size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>Direct DBT Bank Account</Text>
          </View>
          <Text style={styles.cardDesc}>
            Mandi sale payouts will be credited directly to this verified account via Mandi Escrow clearing.
          </Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Bank & Account</Text>
            <TextInput
              style={styles.textInput}
              value={bankAcc}
              onChangeText={setBankAcc}
            />
          </View>

          <View style={styles.verifiedRow}>
            <ShieldCheck size={16} color={colors.success} />
            <Text style={styles.verifiedText}>Aadhaar & NPCI Direct DBT Link Active</Text>
          </View>
        </View>

        {/* Submit */}
        <View style={styles.actionBox}>
          <PrimaryButton
            title="Complete Registration & Enter AgriMandi"
            icon="sprout"
            loading={submitting}
            onPress={handleFinishOnboarding}
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
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamilies.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  cardDesc: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 16,
  },
  inputGroup: {
    marginBottom: spacing.sm,
  },
  inputLabel: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.semiBold,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 48,
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamilies.medium,
    color: colors.textPrimary,
    backgroundColor: colors.backgroundLight,
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primaryBg,
    padding: spacing.xs,
    borderRadius: radius.sm,
    marginTop: 4,
  },
  verifiedText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.semiBold,
    color: colors.success,
  },
  actionBox: {
    marginTop: spacing.xs,
  },
});
