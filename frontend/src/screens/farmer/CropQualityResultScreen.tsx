import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { useAppStore } from '../../store';
import { AppHeader } from '../../components/common/AppHeader';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { FarmerStackParamList } from '../../types';

export const CropQualityResultScreen: React.FC = () => {
  const [state] = useAppStore();
  const navigation = useNavigation<NativeStackNavigationProp<FarmerStackParamList>>();
  const route = useRoute<RouteProp<FarmerStackParamList, 'CropQualityResult'>>();

  const lotId = route.params?.lotId || state.activeLotId;
  const lot = state.lots.find((l) => l.id === lotId) || state.lots[0];
  const qa = lot?.qualityAssessment;

  return (
    <View style={styles.container}>
      <AppHeader
        title="Crop quality"
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
        {/* Top Context Header */}
        <View style={styles.topContext}>
          <View style={styles.visionVersionRow}>
            <View style={styles.verifiedRow}>
              <Ionicons name="shield-checkmark" size={16} color={colors.success} />
              <Text style={styles.verifiedText}>Photo check complete</Text>
            </View>
            <Text style={styles.scannedTimeText}>Scanned 2 mins ago</Text>
          </View>
          <Text style={styles.pageHeading}>Your crop quality</Text>
          <Text style={styles.pageSubheading}>
            Instant grading for Wheat Lot{' '}
            <Text style={styles.lotIdBold}>#{lot?.id.toUpperCase() || 'WH-24-098'}</Text>
          </Text>
        </View>

        {/* Hero Card: Overall AI Quality Result */}
        <View style={styles.heroCard}>
          {/* Grade & Score Header Bar */}
          <View style={styles.heroHeaderBar}>
            <View style={styles.gradeContainer}>
              <View style={styles.gradePill}>
                <Text style={styles.gradePillText}>{qa?.predictedGrade || 'Grade A'}</Text>
              </View>
              <View>
                <Text style={styles.tierTitle}>{qa?.tierLabel || 'Top Quality Tier'}</Text>
                <Text style={styles.benchmarkSubtitle}>
                  {qa?.varietyBenchmark || 'Sharbati Gold Premium'}
                </Text>
              </View>
            </View>

            <View style={styles.scoreContainer}>
              <View style={styles.scoreNumbersRow}>
                <Text style={styles.scoreBig}>{qa?.overallScore || 88}</Text>
                <Text style={styles.scoreMax}>/100</Text>
              </View>
              <View style={styles.confidenceRow}>
                <View style={styles.confidenceDot} />
                <Text style={styles.confidenceText}>
                  {qa?.confidenceScore || 91}% Confidence
                </Text>
              </View>
            </View>
          </View>

          {/* Pricing Highlight Strip */}
          <View style={styles.heroPricingSection}>
            <View style={styles.marketPriceBox}>
              <View style={styles.marketPriceHeader}>
                <Text style={styles.marketPriceLabel}>LIKELY MANDI PRICE</Text>
                <Ionicons name="trending-up" size={18} color={colors.success} />
              </View>
              <View style={styles.priceValueRow}>
                <Text style={styles.priceRangeText}>₹2,420 – ₹2,520</Text>
                <Text style={styles.pricePerQtl}>/ QTL</Text>
              </View>
              <Text style={styles.faqBenchmarkText}>
                +₹180/QTL above standard Fair Average Quality (FAQ) benchmark
              </Text>
            </View>

            {/* Total Valuation */}
            <View style={styles.totalValuationRow}>
              <View>
                <Text style={styles.totalValuationLabel}>
                  Total Lot Valuation ({lot?.quantityQuintals || 20} Quintals)
                </Text>
                <Text style={styles.totalValuationAmount}>₹48,400 – ₹50,400</Text>
              </View>
              <View style={styles.walletIconCircle}>
                <Ionicons name="wallet-outline" size={20} color={colors.success} />
              </View>
            </View>
          </View>
        </View>

        {/* Quality Factor Parameters Section */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Crop quality details</Text>
          <View style={styles.agmarknetBadge}>
            <Ionicons name="sparkles" size={13} color={colors.success} />
            <Text style={styles.agmarknetText}>Agmarknet Verified</Text>
          </View>
        </View>

        {/* Factor Bars */}
        <View style={styles.factorsList}>
          {qa?.factors.map((factor, idx) => (
            <View key={idx} style={styles.factorCard}>
              <View style={styles.factorTopRow}>
                <View style={styles.factorInfoLeft}>
                  <View style={styles.factorIconContainer}>
                    <Ionicons
                      name={
                        factor.icon === 'water_drop'
                          ? 'water-outline'
                          : factor.icon === 'grain'
                          ? 'leaf-outline'
                          : factor.icon === 'filter_alt'
                          ? 'filter-outline'
                          : factor.icon === 'broken_image'
                          ? 'alert-circle-outline'
                          : 'sunny-outline'
                      }
                      size={18}
                      color={
                        factor.status === 'info'
                          ? colors.info
                          : factor.status === 'warning'
                          ? colors.warning
                          : colors.success
                      }
                    />
                  </View>
                  <View>
                    <Text style={styles.factorName}>{factor.name}</Text>
                    <Text style={styles.factorDesc}>{factor.description}</Text>
                  </View>
                </View>
                <Text
                  style={[
                    styles.factorValue,
                    {
                      color:
                        factor.status === 'info'
                          ? colors.info
                          : factor.status === 'warning'
                          ? colors.warning
                          : colors.success,
                    },
                  ]}
                >
                  {factor.value}
                </Text>
              </View>

              {/* Progress track */}
              <View style={styles.factorProgressTrack}>
                <View
                  style={[
                    styles.factorProgressFill,
                    {
                      width: `${factor.percent}%`,
                      backgroundColor:
                        factor.status === 'info'
                          ? colors.info
                          : factor.status === 'warning'
                          ? colors.warning
                          : colors.success,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>

        {/* Analyzed Grain Imagery Carousel with Bounding Boxes */}
        <View style={styles.sectionHeaderRow}>
          <View style={styles.imageryTitleRow}>
            <Text style={styles.sectionTitle}>Analyzed Grain Imagery</Text>
            <View style={styles.photosCountBadge}>
              <Text style={styles.photosCountText}>4 Photos</Text>
            </View>
          </View>
          <Text style={styles.tapToInspectText}>Tap photo to inspect</Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.carouselContainer}
        >
          {qa?.photos.map((photo, i) => (
            <View key={photo.id} style={styles.carouselCard}>
              <View style={styles.imageWrapper}>
                <Image source={{ uri: photo.url }} style={styles.sampleImage} />
                {/* Visual Bounding Box Overlay Simulation */}
                <View style={styles.overlayBounding}>
                  <View style={styles.boundingTag}>
                    <Text style={styles.boundingTagText}>{photo.highlightTag || '99% Pure'}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.cardFooter}>
                <Text style={styles.photoTitle}>{photo.title}</Text>
                <Text style={styles.detectedFeaturesText}>{photo.detectedFeatures}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Legal / Operational Mandi Disclaimer */}
        <View style={styles.disclaimerBox}>
          <Ionicons name="information-circle-outline" size={20} color={colors.textTertiary} />
          <Text style={styles.disclaimerText}>
            AI grading is a preliminary estimation based on uploaded imagery. Final settlement grade will be verified at Mandi physical inspection & weighbridge prior to final gate dispatch.
          </Text>
        </View>

        {/* Action CTA Panel */}
        <View style={styles.ctaContainer}>
          <PrimaryButton
            title="Compare 3 mandis"
            rightIconName="arrow-forward"
            onPress={() => navigation.navigate('BestPlacesToSell')}
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
    paddingBottom: 100,
  },
  topContext: {
    gap: 4,
  },
  visionVersionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  verifiedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  verifiedText: {
    ...typography.badgeLabel,
    color: colors.success,
    textTransform: 'uppercase',
  },
  scannedTimeText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  pageHeading: {
    ...typography.headlineXlMobile,
    color: colors.textPrimary,
  },
  pageSubheading: {
    ...typography.bodyBase,
    color: colors.textSecondary,
  },
  lotIdBold: {
    ...typography.bodyBaseMedium,
    color: colors.textPrimary,
  },
  heroCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.md,
  },
  heroHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainerLow,
    padding: spacing.spaceMd,
  },
  gradeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceSm,
  },
  gradePill: {
    backgroundColor: colors.success,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: radius.full,
    ...shadows.sm,
  },
  gradePillText: {
    ...typography.headlineMd,
    color: colors.onPrimary,
    fontWeight: '700',
  },
  tierTitle: {
    ...typography.captionBold,
    color: colors.success,
  },
  benchmarkSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    fontSize: 11,
  },
  scoreContainer: {
    alignItems: 'flex-end',
  },
  scoreNumbersRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 1,
  },
  scoreBig: {
    ...typography.headlineXl,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  scoreMax: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  confidenceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  confidenceText: {
    ...typography.caption,
    color: colors.success,
  },
  heroPricingSection: {
    padding: spacing.spaceMd,
    gap: spacing.spaceSm,
  },
  marketPriceBox: {
    backgroundColor: colors.successTint,
    borderRadius: radius.lg,
    padding: spacing.spaceMd,
  },
  marketPriceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  marketPriceLabel: {
    ...typography.badgeLabel,
    color: colors.primaryDark,
    letterSpacing: 0.5,
  },
  priceValueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    marginTop: 4,
  },
  priceRangeText: {
    ...typography.currencyDisplayMobile,
    color: colors.success,
  },
  pricePerQtl: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  faqBenchmarkText: {
    ...typography.caption,
    color: colors.primaryDark,
    marginTop: 4,
  },
  totalValuationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.lg,
    padding: spacing.spaceSm,
  },
  totalValuationLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  totalValuationAmount: {
    ...typography.titleCard,
    color: colors.textPrimary,
    fontWeight: '700',
    marginTop: 2,
  },
  walletIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.spaceXs,
  },
  sectionTitle: {
    ...typography.headlineMd,
    color: colors.textPrimary,
  },
  agmarknetBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  agmarknetText: {
    ...typography.caption,
    color: colors.success,
  },
  factorsList: {
    gap: spacing.spaceXs,
  },
  factorCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.spaceMd,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  factorTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.spaceXs,
  },
  factorInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceSm,
    flex: 1,
  },
  factorIconContainer: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainer,
    alignItems: 'center',
    justifyContent: 'center',
  },
  factorName: {
    ...typography.bodyBaseMedium,
    color: colors.textPrimary,
  },
  factorDesc: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  factorValue: {
    ...typography.titleCard,
    fontWeight: '700',
  },
  factorProgressTrack: {
    width: '100%',
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerHighest,
    overflow: 'hidden',
  },
  factorProgressFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  imageryTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceXs,
  },
  photosCountBadge: {
    backgroundColor: colors.surfaceContainerHighest,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radius.full,
  },
  photosCountText: {
    ...typography.captionBold,
    fontSize: 11,
    color: colors.textSecondary,
  },
  tapToInspectText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  carouselContainer: {
    gap: spacing.spaceSm,
    paddingVertical: 4,
  },
  carouselCard: {
    width: 170,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  imageWrapper: {
    width: '100%',
    height: 110,
    position: 'relative',
    backgroundColor: colors.surfaceContainer,
  },
  sampleImage: {
    width: '100%',
    height: '100%',
  },
  overlayBounding: {
    position: 'absolute',
    inset: 0,
    borderWidth: 1.5,
    borderColor: 'rgba(31, 138, 76, 0.6)',
    padding: 4,
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  boundingTag: {
    backgroundColor: colors.success,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radius.xs,
  },
  boundingTagText: {
    ...typography.badgeLabel,
    color: colors.onPrimary,
    fontSize: 9,
  },
  cardFooter: {
    padding: spacing.spaceXs,
    backgroundColor: colors.card,
  },
  photoTitle: {
    ...typography.captionBold,
    color: colors.textPrimary,
  },
  detectedFeaturesText: {
    ...typography.caption,
    color: colors.success,
    fontSize: 11,
    marginTop: 2,
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.spaceSm,
    backgroundColor: colors.surfaceContainerHigh,
    borderRadius: radius.lg,
    padding: spacing.spaceMd,
  },
  disclaimerText: {
    ...typography.caption,
    color: colors.textTertiary,
    flex: 1,
    lineHeight: 18,
  },
  ctaContainer: {
    marginTop: spacing.spaceXs,
  },
});
