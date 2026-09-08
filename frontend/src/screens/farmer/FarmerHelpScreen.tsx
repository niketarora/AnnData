import React from 'react';
import { Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppHeader } from '../../components/common/AppHeader';
import { getFarmerCopy, type FarmerLanguage } from '../../i18n/farmerCopy';
import { useAppStore } from '../../store';
import { colors, radius, shadows, spacing, typography } from '../../theme';
import type { FarmerStackParamList } from '../../types';

const languages: Array<{ id: FarmerLanguage; label: string }> = [
  { id: 'en', label: 'English' },
  { id: 'hi', label: 'हिन्दी' },
  { id: 'pa', label: 'ਪੰਜਾਬੀ' },
];

export const FarmerHelpScreen: React.FC = () => {
  const [state, store] = useAppStore();
  const navigation = useNavigation<NativeStackNavigationProp<FarmerStackParamList>>();
  const copy = getFarmerCopy(state.language);

  return (
    <View style={styles.container}>
      <AppHeader
        title={copy.help}
        onNotificationPress={() => navigation.navigate('Notifications')}
        onProfilePress={() => navigation.navigate('FarmerProfile')}
      />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.callCard}>
          <View style={styles.callIcon}>
            <Ionicons name="call" size={30} color={colors.onPrimary} />
          </View>
          <View style={styles.callText}>
            <Text style={styles.callTitle}>{copy.support}</Text>
            <Text style={styles.callDescription}>Talk to a person in your language</Text>
          </View>
          <TouchableOpacity
            style={styles.callButton}
            onPress={() => Linking.openURL('tel:18001239876')}
            accessibilityRole="button"
            accessibilityLabel={`${copy.support}: 1800 123 9876`}
          >
            <Text style={styles.callButtonText}>Call</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{copy.chooseLanguage}</Text>
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
                >
                  <Text style={[styles.languageText, selected && styles.languageTextSelected]}>
                    {language.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Quick help</Text>
          <View style={styles.helpList}>
            <View style={styles.helpRow}>
              <Ionicons name="camera-outline" size={24} color={colors.primary} />
              <Text style={styles.helpText}>Keep the grain in daylight before taking photos.</Text>
            </View>
            <View style={styles.helpRow}>
              <Ionicons name="cloud-offline-outline" size={24} color={colors.primary} />
              <Text style={styles.helpText}>Your token remains available when the network is weak.</Text>
            </View>
            <View style={styles.helpRow}>
              <Ionicons name="shield-checkmark-outline" size={24} color={colors.primary} />
              <Text style={styles.helpText}>Never share your OTP or bank PIN with anyone.</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('FarmerProfile')}
          accessibilityRole="button"
        >
          <Ionicons name="person-circle-outline" size={24} color={colors.primary} />
          <Text style={styles.profileButtonText}>Farm and account details</Text>
          <Ionicons name="chevron-forward" size={22} color={colors.textTertiary} />
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.canvas,
  },
  content: {
    width: '100%',
    maxWidth: 620,
    alignSelf: 'center',
    padding: spacing.gutterMobile,
    paddingBottom: 104,
    gap: spacing.md,
  },
  callCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: spacing.md,
    ...shadows.sm,
  },
  callIcon: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.full,
    backgroundColor: colors.primaryLight,
    flexShrink: 0,
  },
  callText: {
    flex: 1,
    minWidth: 0,
  },
  callTitle: {
    ...typography.bodyLg,
    color: colors.onPrimary,
    fontWeight: '700',
  },
  callDescription: {
    ...typography.bodyBase,
    color: colors.onPrimary,
    fontSize: 15,
    lineHeight: 20,
    opacity: 0.9,
  },
  callButton: {
    minWidth: 64,
    minHeight: 48,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.card,
    flexShrink: 0,
  },
  callButtonText: {
    ...typography.bodyLg,
    color: colors.primary,
    fontWeight: '700',
  },
  card: {
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
  languageList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.md,
  },
  languageButton: {
    minWidth: 88,
    minHeight: 52,
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 2,
    borderColor: 'transparent',
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
  helpList: {
    marginTop: spacing.sm,
  },
  helpRow: {
    minHeight: 64,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  helpText: {
    ...typography.bodyLg,
    color: colors.textPrimary,
    flex: 1,
    minWidth: 0,
  },
  profileButton: {
    minHeight: 60,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.xl,
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  profileButtonText: {
    ...typography.bodyLg,
    color: colors.textPrimary,
    fontWeight: '600',
    flex: 1,
  },
});
