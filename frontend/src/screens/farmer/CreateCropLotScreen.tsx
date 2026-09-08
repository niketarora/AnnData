import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
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

interface CreateCropLotScreenProps {
  showBack?: boolean;
}

export const CreateCropLotScreen: React.FC<CreateCropLotScreenProps> = ({ showBack = true }) => {
  const [state] = useAppStore();
  const navigation = useNavigation<NativeStackNavigationProp<FarmerStackParamList>>();

  const [crop, setCrop] = useState<CropType>('Wheat');
  const [variety, setVariety] = useState('Sharbati');
  const [quantity, setQuantity] = useState(20);
  const [harvestDate, setHarvestDate] = useState('08 Sep 2026');
  const [farmLocation, setFarmLocation] = useState(state.farmer.location);
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
        harvestDate,
        farmLocation,
        images: samplePhotos,
      });

      setLoading(false);
      navigation.navigate('CropQualityResult', { lotId: newLot.id });
    } catch (err) {
      setLoading(false);
      Alert.alert('Could not save crop', 'Please check your connection and try again.');
    }
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Sell your crop"
        subtitle="Step 1 of 3 • Crop details"
        showBack={showBack}
        onBack={showBack ? () => navigation.goBack() : undefined}
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
          <Text style={styles.sectionLabel}>Choose your crop</Text>
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
          <Text style={styles.sectionLabel}>Crop details</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Variety</Text>
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
            <Text style={styles.fieldLabel}>Quantity in quintals</Text>
            <View style={styles.stepperContainer}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 5))}
              >
                <Ionicons name="remove" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
              <View style={styles.stepperValueContainer}>
                <TextInput
                  style={styles.quantityInput}
                  value={String(quantity)}
                  onChangeText={(value) => {
                    const nextQuantity = Number(value.replace(/[^0-9]/g, ''));
                    setQuantity(Number.isFinite(nextQuantity) ? nextQuantity : 0);
                  }}
                  keyboardType="number-pad"
                  selectTextOnFocus
                  accessibilityLabel="Quantity in quintals"
                />
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

          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Harvest date</Text>
            <TextInput
              style={styles.textInput}
              value={harvestDate}
              onChangeText={setHarvestDate}
              placeholder="e.g. 08 Sep 2026"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Farm or village</Text>
            <TextInput
              style={styles.textInput}
              value={farmLocation}
              onChangeText={setFarmLocation}
              placeholder="Enter your village"
              placeholderTextColor={colors.textSecondary}
            />
          </View>
        </View>

        {/* Photo Upload & AI Quality Camera Scanner UI */}
        <View style={styles.sectionCard}>
          <View style={styles.photoHeaderRow}>
            <Text style={styles.sectionLabel}>Take 4 clear crop photos</Text>
            <View style={styles.aiBadge}>
              <Ionicons name="camera-reverse" size={13} color={colors.success} />
              <Text style={styles.aiBadgeText}>Photos ready</Text>
            </View>
          </View>
          <Text style={styles.photoInstructions}>
            Spread the crop on a clean tray and take photos in daylight. Avoid shadows and blur.
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
          title={loading ? 'Checking crop photos...' : 'Check crop quality'}
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
  quantityInput: {
    minWidth: 80,
    paddingHorizontal: spacing.spaceXs,
    paddingVertical: 2,
    ...typography.headlineLg,
    color: colors.textPrimary,
    fontWeight: '700',
    textAlign: 'center',
  },
  stepperUnitText: {
    ...typography.caption,
    color: colors.textSecondary,
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
