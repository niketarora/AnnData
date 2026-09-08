import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { useAppStore } from '../../store';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { BuyerStackParamList, CropType } from '../../types';
import { marketService } from '../../services';

export const CreateDemandScreen: React.FC = () => {
  const [state] = useAppStore();
  const navigation = useNavigation<NativeStackNavigationProp<BuyerStackParamList>>();

  const [crop, setCrop] = useState<CropType>('Wheat');
  const [variety, setVariety] = useState('Sharbati');
  const [minGrade, setMinGrade] = useState('Grade A');
  const [quantity, setQuantity] = useState('500');
  const [minPrice, setMinPrice] = useState('2450');
  const [maxPrice, setMaxPrice] = useState('2550');
  const [counter, setCounter] = useState('Counter 4');
  const [loading, setLoading] = useState(false);

  const handleSubmitDemand = async () => {
    setLoading(true);
    try {
      await marketService.createBuyerDemand({
        buyerId: state.buyer.id,
        buyerName: state.buyer.name,
        mandiName: state.buyer.marketName,
        crop,
        variety,
        minimumGrade: minGrade,
        requiredQuantityQuintals: parseInt(quantity) || 500,
        minPrice: parseInt(minPrice) || 2450,
        maxPrice: parseInt(maxPrice) || 2550,
        targetDate: 'Today',
        dailyCapacity: 1000,
        assignedCounter: counter,
        paymentTerms: 'Instant UPI on Weighment',
      });
      setLoading(false);
      navigation.goBack();
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Create Procurement Demand"
        subtitle="Mandi Quota Definition"
        showBack
        onBack={() => navigation.goBack()}
        onNotificationPress={() => navigation.navigate('BuyerNotifications')}
        onProfilePress={() => navigation.navigate('BuyerProfile')}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Commodity & Variety */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>COMMODITY & MINIMUM GRADE</Text>
          <View style={styles.cropsRow}>
            {(['Wheat', 'Paddy', 'Tomato', 'Mustard'] as CropType[]).map((c) => (
              <TouchableOpacity
                key={c}
                style={[styles.cropChip, crop === c && styles.cropChipActive]}
                onPress={() => setCrop(c)}
              >
                <Text style={[styles.cropChipText, crop === c && styles.cropChipTextActive]}>
                  {c}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Variety Target</Text>
            <TextInput
              style={styles.textInput}
              value={variety}
              onChangeText={setVariety}
              placeholder="e.g. Sharbati, 1121 Basmati"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Minimum Acceptable Quality Grade</Text>
            <View style={styles.gradesRow}>
              {['Grade A (Premium)', 'Grade B (Standard)', 'Grade C (FAQ)'].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.gradeChip, minGrade === g.split(' ')[0] + ' ' + g.split(' ')[1] && styles.gradeChipActive]}
                  onPress={() => setMinGrade(g.split(' ')[0] + ' ' + g.split(' ')[1])}
                >
                  <Text
                    style={[
                      styles.gradeChipText,
                      minGrade === g.split(' ')[0] + ' ' + g.split(' ')[1] && styles.gradeChipTextActive,
                    ]}
                  >
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        {/* Quota & Price Window */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>QUOTA & PRICE WINDOW</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Required Quantity (Quintals)</Text>
            <TextInput
              style={styles.textInput}
              value={quantity}
              onChangeText={setQuantity}
              keyboardType="numeric"
              placeholder="500"
            />
          </View>

          <View style={styles.priceRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Min Rate (₹/Q)</Text>
              <TextInput
                style={styles.textInput}
                value={minPrice}
                onChangeText={setMinPrice}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Max Rate (₹/Q)</Text>
              <TextInput
                style={styles.textInput}
                value={maxPrice}
                onChangeText={setMaxPrice}
                keyboardType="numeric"
              />
            </View>
          </View>
        </View>

        {/* Action Button */}
        <PrimaryButton
          title={loading ? 'Publishing Demand...' : 'Publish Demand to Mandi Marketplace'}
          loading={loading}
          iconName="checkmark-circle-outline"
          onPress={handleSubmitDemand}
        />
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
  cropsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cropChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainer,
  },
  cropChipActive: {
    backgroundColor: colors.primaryLight,
  },
  cropChipText: {
    ...typography.bodyBaseMedium,
    color: colors.textPrimary,
  },
  cropChipTextActive: {
    color: colors.onPrimary,
    fontWeight: '600',
  },
  inputGroup: {
    gap: 4,
  },
  fieldLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  textInput: {
    minHeight: 48,
    backgroundColor: colors.surfaceContainerLow,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.spaceMd,
    ...typography.bodyBaseMedium,
    color: colors.textPrimary,
  },
  gradesRow: {
    gap: 6,
  },
  gradeChip: {
    padding: 10,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainer,
  },
  gradeChipActive: {
    backgroundColor: colors.primaryTint,
    borderWidth: 1,
    borderColor: colors.primaryLight,
  },
  gradeChipText: {
    ...typography.bodyBaseMedium,
    color: colors.textPrimary,
  },
  gradeChipTextActive: {
    color: colors.primaryDark,
    fontWeight: '600',
  },
  priceRow: {
    flexDirection: 'row',
    gap: spacing.spaceSm,
  },
});
