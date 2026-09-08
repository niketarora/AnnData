import React from 'react';
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { MapPin, Phone, Sprout, TicketCheck, Wallet } from 'lucide-react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { getFarmerCopy, type FarmerLanguage } from '../../i18n/farmerCopy';
import { useAppStore } from '../../store';
import { colors, radius, shadows, spacing, typography } from '../../theme';
import type { RootStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<RootStackParamList, 'Welcome'>;

const languages: Array<{ id: FarmerLanguage; label: string; nativeLabel: string }> = [
  { id: 'en', label: 'English', nativeLabel: 'English' },
  { id: 'hi', label: 'Hindi', nativeLabel: 'हिन्दी' },
  { id: 'pa', label: 'Punjabi', nativeLabel: 'ਪੰਜਾਬੀ' },
];

export const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [state, store] = useAppStore();
  const copy = getFarmerCopy(state.language);

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + spacing.lg, paddingBottom: insets.bottom + spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.brandRow}>
          <View style={styles.brandIcon}>
            <Sprout size={28} color={colors.primary} />
          </View>
          <Text style={styles.brandName}>{copy.brand}</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>{copy.welcomeTitle}</Text>
          <Text style={styles.heroBody}>{copy.welcomeBody}</Text>
        </View>

        <View style={styles.languageCard}>
          <Text style={styles.sectionTitle}>{copy.chooseLanguage}</Text>
          <Text style={styles.sectionHelp}>{copy.chooseLanguageHelp}</Text>
          <View style={styles.languageList}>
            {languages.map((language) => {
              const selected = state.language === language.id;
              return (
                <TouchableOpacity
                  key={language.id}
                  style={[styles.languageButton, selected && styles.languageButtonSelected]}
                  onPress={() => store.setLanguage(language.id)}
                  accessibilityRole="radio"
                  accessibilityState={{ selected }}
                  accessibilityLabel={`${language.label}, ${language.nativeLabel}`}
                >
                  <Text style={[styles.languageText, selected && styles.languageTextSelected]}>
                    {language.nativeLabel}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.benefitsCard}>
          <View style={styles.benefitRow}>
            <MapPin size={22} color={colors.primary} />
            <Text style={styles.benefitText}>{copy.findMandi}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.benefitRow}>
            <TicketCheck size={22} color={colors.primary} />
            <Text style={styles.benefitText}>{copy.myToken}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.benefitRow}>
            <Wallet size={22} color={colors.primary} />
            <Text style={styles.benefitText}>{copy.payments}</Text>
          </View>
        </View>

        <PrimaryButton
          title={copy.continueAsFarmer}
          rightIconName="arrow-forward"
          onPress={() => navigation.navigate('LoginOTP', { role: 'FARMER' })}
          style={styles.continueButton}
        />

        <TouchableOpacity
          style={styles.supportButton}
          onPress={() => Linking.openURL('tel:18001239876')}
          accessibilityRole="button"
          accessibilityLabel={copy.support}
        >
          <Phone size={20} color={colors.primary} />
          <Text style={styles.supportText}>{copy.support}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.buyerLoginButton}
          onPress={() => navigation.navigate('LoginOTP', { role: 'BUYER' })}
          accessibilityRole="button"
          accessibilityLabel="Mandi buyer or operator login"
        >
          <Text style={styles.buyerLoginText}>Mandi buyer / operator login</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.textSecondary} />
        </TouchableOpacity>
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
    width: '100%',
    maxWidth: 520,
    alignSelf: 'center',
    paddingHorizontal: spacing.gutterMobile,
    gap: spacing.lg,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  brandIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryTint,
  },
  brandName: {
    ...typography.headlineLg,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  hero: {
    gap: spacing.sm,
  },
  heroTitle: {
    ...typography.headlineXl,
    color: colors.textPrimary,
    fontSize: 32,
    lineHeight: 40,
  },
  heroBody: {
    ...typography.bodyLg,
    color: colors.textSecondary,
    fontSize: 17,
    lineHeight: 26,
  },
  languageCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  sectionTitle: {
    ...typography.headlineMd,
    color: colors.textPrimary,
  },
  sectionHelp: {
    ...typography.bodyBase,
    color: colors.textSecondary,
    fontSize: 15,
    marginTop: 4,
  },
  languageList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  languageButton: {
    minWidth: 92,
    minHeight: 52,
    flexGrow: 1,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceContainer,
    borderWidth: 2,
    borderColor: 'transparent',
    paddingHorizontal: spacing.sm,
  },
  languageButtonSelected: {
    backgroundColor: colors.primaryTint,
    borderColor: colors.primary,
  },
  languageText: {
    ...typography.bodyLg,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  languageTextSelected: {
    color: colors.primaryDark,
  },
  benefitsCard: {
    backgroundColor: colors.primaryTint,
    borderRadius: radius.xl,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  benefitRow: {
    minHeight: 56,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  benefitText: {
    ...typography.bodyLg,
    color: colors.textPrimary,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  continueButton: {
    height: 56,
  },
  supportButton: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  supportText: {
    ...typography.bodyLg,
    color: colors.primary,
    fontWeight: '600',
  },
  buyerLoginButton: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  buyerLoginText: {
    ...typography.bodyBase,
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
  },
});
