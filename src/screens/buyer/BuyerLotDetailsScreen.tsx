import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { useAppStore } from '../../store';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SecondaryButton } from '../../components/common/SecondaryButton';
import { BuyerStackParamList } from '../../types';

export const BuyerLotDetailsScreen: React.FC = () => {
  const [state] = useAppStore();
  const navigation = useNavigation<NativeStackNavigationProp<BuyerStackParamList>>();
  const route = useRoute<RouteProp<BuyerStackParamList, 'BuyerLotDetails'>>();

  const lotId = route.params?.lotId || state.activeLotId;
  const lot = state.lots.find((l) => l.id === lotId) || state.lots[0];

  return (
    <View style={styles.container}>
      <AppHeader
        title="Lot Verification"
        subtitle={`Lot #${lot.id.toUpperCase()}`}
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
        {/* Farmer Info Card */}
        <View style={styles.farmerCard}>
          <View style={styles.farmerHeader}>
            <View>
              <Text style={styles.farmerName}>{lot.farmerName}</Text>
              <Text style={styles.farmerLoc}>
                <Ionicons name="location-sharp" size={13} color={colors.textSecondary} />{' '}
                {lot.farmLocation} • Carrier: Tractor Trolley
              </Text>
            </View>
            <View style={styles.tokenBadge}>
              <Text style={styles.tokenText}>#MKT-B-142</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.lotSpecsRow}>
            <View>
              <Text style={styles.specLabel}>Crop & Variety</Text>
              <Text style={styles.specVal}>{lot.crop} ({lot.variety})</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.specLabel}>Harvest Quantity</Text>
              <Text style={[styles.specVal, { color: colors.primaryDark }]}>
                {lot.quantityQuintals} Quintals
              </Text>
            </View>
          </View>
        </View>

        {/* AI Pre-Grade Assaying Review */}
        <View style={styles.aiReviewCard}>
          <View style={styles.aiHeader}>
            <View style={styles.aiTag}>
              <Ionicons name="shield-checkmark" size={14} color={colors.success} />
              <Text style={styles.aiTagText}>AI COMPUTER VISION v3.4</Text>
            </View>
            <Text style={styles.confidenceText}>91% Confidence</Text>
          </View>

          <View style={styles.gradeDisplayRow}>
            <View style={styles.gradeBox}>
              <Text style={styles.gradeBig}>Grade A</Text>
              <Text style={styles.gradeSub}>Top Quality Tier</Text>
            </View>
            <View style={styles.scoreBox}>
              <Text style={styles.scoreNum}>88</Text>
              <Text style={styles.scoreSub}>/ 100 Quality</Text>
            </View>
          </View>

          {/* Key Parameters */}
          <View style={styles.paramsStrip}>
            <View style={styles.paramCol}>
              <Text style={styles.paramLabel}>Moisture</Text>
              <Text style={styles.paramVal}>11.8%</Text>
            </View>
            <View style={styles.paramCol}>
              <Text style={styles.paramLabel}>Admixture</Text>
              <Text style={styles.paramVal}>0.8%</Text>
            </View>
            <View style={styles.paramCol}>
              <Text style={styles.paramLabel}>Uniformity</Text>
              <Text style={styles.paramVal}>94%</Text>
            </View>
          </View>
        </View>

        {/* Uploaded Photos Carousel */}
        <View style={styles.photosSection}>
          <Text style={styles.sectionLabel}>UPLOADED GRAIN IMAGERY (4 SAMPLES)</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photosRow}>
            {lot.images.map((img, i) => (
              <View key={i} style={styles.photoContainer}>
                <Image source={{ uri: img }} style={styles.photo} />
                <View style={styles.photoOverlayTag}>
                  <Text style={styles.photoTagText}>Sample #{i + 1}</Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Operational Actions */}
        <View style={styles.actionsCol}>
          <PrimaryButton
            title="Start Physical Inspection (Bay #03)"
            iconName="flask-outline"
            onPress={() =>
              navigation.navigate('PhysicalInspectionStation', { bookingId: state.activeBookingId })
            }
          />

          <SecondaryButton
            title="Decline / Reject Intake"
            iconName="close-circle-outline"
            variant="outline"
            onPress={() => navigation.goBack()}
          />
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
  farmerCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.spaceMd,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  farmerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  farmerName: {
    ...typography.headlineMd,
    color: colors.textPrimary,
  },
  farmerLoc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tokenBadge: {
    backgroundColor: colors.surfaceContainer,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  tokenText: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginVertical: spacing.spaceSm,
  },
  lotSpecsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  specLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  specVal: {
    ...typography.bodyBaseMedium,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  aiReviewCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.spaceMd,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
    gap: spacing.spaceSm,
  },
  aiHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  aiTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.successTint,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.full,
  },
  aiTagText: {
    ...typography.badgeLabel,
    color: colors.success,
  },
  confidenceText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  gradeDisplayRow: {
    flexDirection: 'row',
    gap: spacing.spaceSm,
    marginVertical: spacing.spaceXs,
  },
  gradeBox: {
    flex: 1.4,
    backgroundColor: colors.successTint,
    padding: spacing.spaceSm,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  gradeBig: {
    ...typography.headlineLg,
    color: colors.success,
    fontWeight: '700',
  },
  gradeSub: {
    ...typography.captionBold,
    color: colors.primaryDark,
    marginTop: 2,
  },
  scoreBox: {
    flex: 1,
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.spaceSm,
    borderRadius: radius.lg,
    alignItems: 'center',
  },
  scoreNum: {
    ...typography.headlineLg,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  scoreSub: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  paramsStrip: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.md,
    padding: spacing.spaceSm,
  },
  paramCol: {
    flex: 1,
    alignItems: 'center',
  },
  paramLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  paramVal: {
    ...typography.bodyBaseMedium,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 2,
  },
  photosSection: {
    gap: spacing.spaceXs,
  },
  sectionLabel: {
    ...typography.badgeLabel,
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  photosRow: {
    gap: spacing.spaceSm,
  },
  photoContainer: {
    width: 140,
    height: 100,
    borderRadius: radius.lg,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: colors.surfaceContainer,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  photoOverlayTag: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  photoTagText: {
    ...typography.badgeLabel,
    color: colors.onPrimary,
    fontSize: 9,
  },
  actionsCol: {
    gap: spacing.spaceSm,
    marginTop: spacing.spaceXs,
  },
});
