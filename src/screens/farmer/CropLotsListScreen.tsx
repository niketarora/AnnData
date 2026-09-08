import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { useAppStore } from '../../store';
import { AppHeader } from '../../components/common/AppHeader';
import { StatusChip } from '../../components/common/StatusChip';
import { FarmerStackParamList, CropLot } from '../../types';

export const CropLotsListScreen: React.FC = () => {
  const [state] = useAppStore();
  const navigation = useNavigation<NativeStackNavigationProp<FarmerStackParamList>>();
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'SOLD'>('ALL');

  const filteredLots = state.lots.filter((lot) => {
    if (filter === 'ACTIVE') return lot.status !== 'PAID' && lot.status !== 'COMPLETED';
    if (filter === 'SOLD') return lot.status === 'PAID' || lot.status === 'COMPLETED';
    return true;
  });

  return (
    <View style={styles.container}>
      <AppHeader
        title="My Crop Lots"
        subtitle="Harvest inventory & grading"
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
        {/* Filter Chips */}
        <View style={styles.filterRow}>
          {(['ALL', 'ACTIVE', 'SOLD'] as const).map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.filterChip, filter === tab && styles.filterChipActive]}
              onPress={() => setFilter(tab)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === tab && styles.filterChipTextActive,
                ]}
              >
                {tab === 'ALL' ? 'All Lots' : tab === 'ACTIVE' ? 'Active / In-Queue' : 'Sold / Settled'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Lots List */}
        <View style={styles.lotsList}>
          {filteredLots.map((lot) => (
            <TouchableOpacity
              key={lot.id}
              style={styles.lotCard}
              onPress={() => navigation.navigate('CropQualityResult', { lotId: lot.id })}
              activeOpacity={0.88}
            >
              <View style={styles.lotCardTop}>
                <Image source={{ uri: lot.images[0] }} style={styles.lotImage} />
                <View style={styles.lotInfoCol}>
                  <View style={styles.titleStatusRow}>
                    <Text style={styles.cropTitle}>
                      {lot.crop} ({lot.variety})
                    </Text>
                    <StatusChip
                      label={lot.status.replace('_', ' ')}
                      variant={
                        lot.status === 'PAID' || lot.status === 'BOOKING_CONFIRMED'
                          ? 'success'
                          : lot.status === 'GATE_CHECKED_IN'
                          ? 'info'
                          : 'warning'
                      }
                    />
                  </View>
                  <Text style={styles.lotLocation}>
                    <Ionicons name="location-sharp" size={12} color={colors.textSecondary} />{' '}
                    {lot.farmLocation} • Harvested {lot.harvestDate}
                  </Text>
                  <View style={styles.lotMetricsRow}>
                    <Text style={styles.lotQuantity}>{lot.quantityQuintals} Quintals</Text>
                    {lot.qualityAssessment && (
                      <View style={styles.gradeBadge}>
                        <Text style={styles.gradeBadgeText}>
                          {lot.qualityAssessment.predictedGrade} ({lot.qualityAssessment.overallScore}/100)
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              <View style={styles.lotCardFooter}>
                <View style={styles.estPriceCol}>
                  <Text style={styles.estPriceLabel}>Est. Market Value</Text>
                  <Text style={styles.estPriceValue}>₹48,400 – ₹50,400</Text>
                </View>
                <View style={styles.viewQualityRow}>
                  <Text style={styles.viewQualityText}>View AI Grading</Text>
                  <Ionicons name="chevron-forward" size={16} color={colors.primaryLight} />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Floating Add Lot Button */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => navigation.navigate('CreateCropLot')}
        activeOpacity={0.88}
      >
        <Ionicons name="add" size={24} color={colors.onPrimary} />
        <Text style={styles.floatingButtonText}>Add New Crop Lot</Text>
      </TouchableOpacity>
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
    paddingBottom: 110,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.spaceXs,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
  },
  filterChipActive: {
    backgroundColor: colors.primaryLight,
  },
  filterChipText: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.onPrimary,
  },
  lotsList: {
    gap: spacing.spaceMd,
  },
  lotCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.spaceMd,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  lotCardTop: {
    flexDirection: 'row',
    gap: spacing.spaceSm,
  },
  lotImage: {
    width: 72,
    height: 72,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceContainer,
  },
  lotInfoCol: {
    flex: 1,
    gap: 4,
  },
  titleStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cropTitle: {
    ...typography.headlineMd,
    color: colors.textPrimary,
  },
  lotLocation: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  lotMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceSm,
    marginTop: 2,
  },
  lotQuantity: {
    ...typography.titleCard,
    color: colors.textPrimary,
  },
  gradeBadge: {
    backgroundColor: colors.successTint,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  gradeBadgeText: {
    ...typography.badgeLabel,
    color: colors.success,
  },
  lotCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.spaceSm,
    marginTop: spacing.spaceSm,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  estPriceCol: {},
  estPriceLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  estPriceValue: {
    ...typography.bodyBaseMedium,
    color: colors.primaryDark,
    fontWeight: '700',
  },
  viewQualityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  viewQualityText: {
    ...typography.captionBold,
    color: colors.primaryLight,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    backgroundColor: colors.primaryLight,
    borderRadius: radius.full,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 8,
    ...shadows.primaryAction,
  },
  floatingButtonText: {
    ...typography.bodyBaseMedium,
    color: colors.onPrimary,
    fontWeight: '600',
  },
});
