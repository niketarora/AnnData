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
  Phone,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react-native';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SecondaryButton } from '../../components/common/SecondaryButton';
import { mockStore } from '../../store/mockStore';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'LoginOTP'>;

export const LoginOTPScreen: React.FC<Props> = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const role = route.params?.role || 'FARMER';
  
  const defaultPhone = role === 'FARMER' ? '9812045678' : '9896011223';
  const [phoneNumber, setPhoneNumber] = useState(defaultPhone);
  const [otpCode, setOtpCode] = useState('123456');
  const [isLoading, setIsLoading] = useState(false);

  const handleFillDemoOTP = () => {
    setOtpCode('123456');
  };

  const handleVerify = () => {
    if (otpCode !== '123456' && otpCode.length !== 6) {
      Alert.alert('Invalid OTP', 'Please enter a 6-digit OTP code (Demo OTP: 123456).');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      mockStore.setRole(role);
      if (role === 'FARMER') {
        navigation.navigate('FarmerRoot');
      } else {
        navigation.navigate('BuyerRoot');
      }
    }, 500);
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Mobile Verification"
        subtitle={`Signing in to ${role === 'FARMER' ? 'Kisan Portal' : 'Mandi Buyer Portal'}`}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          <Text style={styles.title}>Enter Phone Number</Text>
          <Text style={styles.subtitle}>
            A 6-digit verification code will be sent to your registered APMC mobile number.
          </Text>

          <View style={styles.phoneInputRow}>
            <View style={styles.countryCodeBox}>
              <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
            </View>
            <TextInput
              style={styles.phoneInput}
              keyboardType="phone-pad"
              maxLength={10}
              value={phoneNumber}
              onChangeText={setPhoneNumber}
              placeholder="9812045678"
            />
          </View>

          {/* OTP Section */}
          <View style={styles.otpSection}>
            <View style={styles.otpHeaderRow}>
              <Text style={styles.otpTitle}>Enter 6-Digit OTP</Text>
              <TouchableOpacity onPress={handleFillDemoOTP}>
                <Text style={styles.demoOtpHint}>Use Demo OTP: 123456</Text>
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.otpInput}
              keyboardType="number-pad"
              maxLength={6}
              value={otpCode}
              onChangeText={setOtpCode}
              placeholder="123456"
            />

            <View style={styles.resendRow}>
              <Text style={styles.resendTimer}>Resend OTP in 24s</Text>
              <TouchableOpacity onPress={() => Alert.alert('OTP Sent', 'New demo OTP code 123456 dispatched.')}>
                <Text style={styles.resendLink}>Resend SMS</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Quick Demo Info Box */}
        <View style={styles.infoBox}>
          <ShieldCheck size={18} color={colors.primary} />
          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>APMC e-NAM Identity Protection</Text>
            <Text style={styles.infoDesc}>
              Test accounts are pre-configured with active mandi licenses and bank accounts for seamless end-to-end evaluation.
            </Text>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.actionBox}>
          <PrimaryButton
            title="Verify & Enter Dashboard"
            icon="chevron"
            loading={isLoading}
            onPress={handleVerify}
          />

          <View style={styles.onboardingRow}>
            <SecondaryButton
              title="First Time? Run Farmer Onboarding"
              onPress={() => navigation.navigate('FarmerOnboarding')}
            />
          </View>
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
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fontFamilies.bold,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
    lineHeight: 18,
    marginTop: 4,
    marginBottom: spacing.md,
  },
  phoneInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    backgroundColor: colors.backgroundLight,
    height: 50,
    marginBottom: spacing.lg,
  },
  countryCodeBox: {
    paddingHorizontal: spacing.sm,
    borderRightWidth: 1,
    borderRightColor: colors.borderLight,
  },
  countryCodeText: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamilies.semiBold,
    color: colors.textPrimary,
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: spacing.md,
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamilies.bold,
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  otpSection: {
    gap: spacing.xs,
  },
  otpHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  otpTitle: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.semiBold,
    color: colors.textSecondary,
  },
  demoOtpHint: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.bold,
    color: colors.primary,
  },
  otpInput: {
    borderWidth: 1.5,
    borderColor: colors.primary,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 52,
    fontSize: 24,
    fontFamily: typography.fontFamilies.bold,
    color: colors.textPrimary,
    letterSpacing: 8,
    textAlign: 'center',
    backgroundColor: colors.primaryBg,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  resendTimer: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textTertiary,
  },
  resendLink: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.bold,
    color: colors.primary,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.primaryBg,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.bold,
    color: colors.primaryDark,
  },
  infoDesc: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  actionBox: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  onboardingRow: {
    marginTop: spacing.xs,
  },
});
