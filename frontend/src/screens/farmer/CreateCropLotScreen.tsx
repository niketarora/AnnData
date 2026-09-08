import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { useAppStore } from '../../store';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { FarmerStackParamList, CropType } from '../../types';
import { cropService } from '../../services';

export const CreateCropLotScreen: React.FC = () => {
  const [state] = useAppStore();
  const navigation = useNavigation<NativeStackNavigationProp<FarmerStackParamList>>();

  const [crop, setCrop] = useState<CropType>('Wheat');
  const [variety, setVariety] = useState('Sharbati');
  const [quantity, setQuantity] = useState(20);
  const [harvestDate] = useState('Today, 08 Sep 2026');
  const [loading, setLoading] = useState(false);

  const samplePhotos = [
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600',
    'https://images.unsplash.com/photo-1543257580-7269da773bf5?w=600',
    'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600',
    'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=600',
  ];

  const handleCreateLot = async () => {
    setLoading(true);
    try {
      const newLot = await cropService.createCropLot({
        farmerId: state.farmer.id,
        farmerName: state.farmer.name,
        crop,
        variety,
        quantityQuintals: quantity,
        harvestDate: '2026-09-08',
        farmLocation: state.farmer.location,
        images: samplePhotos,
      });

      setLoading(false);
      navigation.navigate('CropQualityResult', { lotId: newLot.id });
    } catch (err) {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Sell / Register Crop"
        subtitle="Step 1 of 3 • Lot Specifications"
        showBack
        onBack={() => navigation.goBack()}
        onNotificationPress={() => navigation.navigate('Notifications')}
        onProfilePress={() => navigation.navigate('FarmerProfile')}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Crop Selection */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>SELECT COMMODITY</Text>
          <View style={styles.cropsRow}>
            {(['Wheat', 'Paddy', 'Tomato', 'Mustard', 'Maize', 'Cotton'] as CropType[]).map((item) => (
              <TouchableOpacity
                key={item}
                style={[styles.cropChip, crop === item && styles.cropChipActive]}
                onPress={() => setCrop(item)}
              >
                <Ionicons
                  name={item === 'Wheat' ? 'leaf' : item === 'Tomato' ? 'nutrition' : 'flower'}
                  size={16}
                  color={crop === item ? colors.onPrimary : colors.textPrimary}
                />
                <Text style={[styles.cropChipText, crop === item && styles.cropChipTextActive]}>
                  {item}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Variety & Harvest Details */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionLabel}>VARIETY & HARVEST SPECS</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Seed Variety</Text>
            <TextInput
              style={styles.textInput}
              value={variety}
              onChangeText={setVariety}
              placeholder="e.g. Sharbati, HD-2967, PBW-343"
              placeholderTextColor={colors.textSecondary}
            />
          </View>

          {/* Stepper for Quantity */}
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Harvest Quantity (Quintals)</Text>
            <View style={styles.stepperContainer}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 5))}
              >
                <Ionicons name="remove" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
              <View style={styles.stepperValueContainer}>
                <Text style={styles.stepperValueText}>{quantity}</Text>
                <Text style={styles.stepperUnitText}>Quintals (~{quantity * 100} kg)</Text>
              </View>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => setQuantity(quantity + 5)}
              >
                <Ionicons name="add" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.metaRow}>
            <View>
              <Text style={styles.fieldLabel}>Harvested</Text>
              <Text style={styles.metaValue}>{harvestDate}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.fieldLabel}>Farm Origin</Text>
              <Text style={styles.metaValue}>Karnal Mandi Region</Text>
            </View>
          </View>
        </View>

        {/* Photo Upload & AI Quality Camera Scanner UI */}
        <View style={styles.sectionCard}>
          <View style={styles.photoHeaderRow}>
            <Text style={styles.sectionLabel}>GRAIN QUALITY IMAGERY (4 SAMPLES)</Text>
            <View style={styles.aiBadge}>
              <Ionicons name="camera-reverse" size={13} color={colors.success} />
              <Text style={styles.aiBadgeText}>AI Ready</Text>
            </View>
          </View>
          <Text style={styles.photoInstructions}>
            Upload or capture 4 well-lit photos under daylight on a clean tray for instant AI grading.
          </Text>

          <View style={styles.photoGrid}>
            {[
              { title: 'Tray View #1', url: samplePhotos[0] },
              { title: 'Macro Core #2', url: samplePhotos[1] },
              { title: 'Spread Sample #3', url: samplePhotos[2] },
              { title: 'Lustre Angle #4', url: samplePhotos[3] },
            ].map((slot, idx) => (
              <View key={idx} style={styles.photoSlot}>
                <Image source={{ uri: slot.url }} style={styles.slotImage} />
                <View style={styles.slotCheckmark}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.success} />
                </View>
                <Text style={styles.slotTitle}>{slot.title}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Action Button */}
        <PrimaryButton
          title={loading ? 'Scanning Grain with AI...' : 'Analyze Quality & Generate Valuation'}
          loading={loading}
          iconName="scan-outline"
          onPress={handleCreateLot}
          style={styles.submitBtn}
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
    flexWrap: 'wrap',
    gap: 8,
  },
  cropChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
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
    gap: 6,
  },
  fieldLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  textInput: {
    minHeight: 50,
    backgroundColor: colors.card,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.spaceMd,
    ...typography.bodyBaseMedium,
    color: colors.textPrimary,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
    padding: spacing.spaceXs,
  },
  stepperBtn: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  stepperValueContainer: {
    alignItems: 'center',
  },
  stepperValueText: {
    ...typography.headlineLg,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  stepperUnitText: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: spacing.spaceXs,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  metaValue: {
    ...typography.bodyBaseMedium,
    color: colors.textPrimary,
    marginTop: 2,
  },
  photoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.successTint,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  aiBadgeText: {
    ...typography.captionBold,
    color: colors.success,
  },
  photoInstructions: {
    ...typography.caption,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  photoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.spaceSm,
    marginTop: 4,
  },
  photoSlot: {
    width: '48%',
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    position: 'relative',
    backgroundColor: colors.card,
  },
  slotImage: {
    width: '100%',
    height: 95,
  },
  slotCheckmark: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: colors.card,
    borderRadius: 9,
  },
  slotTitle: {
    ...typography.captionBold,
    color: colors.textPrimary,
    padding: 6,
    backgroundColor: colors.card,
  },
  submitBtn: {
    marginTop: spacing.spaceXs,
  },
});
