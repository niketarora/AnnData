import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  TrendingUp,
  BarChart3,
  Clock,
  ShieldCheck,
  Download,
  Calendar,
  Layers,
  MapPin,
  CheckCircle2,
} from 'lucide-react-native';
import { useAppStore } from '../../store';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { MetricCard } from '../../components/common/MetricCard';
import { SecondaryButton } from '../../components/common/SecondaryButton';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BuyerStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<BuyerStackParamList, 'BuyerAnalytics'>;

export const BuyerAnalyticsScreen: React.FC<Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const state = useAppStore();
  const [selectedPeriod, setSelectedPeriod] = useState<'WEEK' | 'MONTH' | 'SEASON'>('MONTH');

  const handleExportAuditReport = () => {
    Alert.alert(
      'Export APMC Audit Report',
      'APMC Form 7B & GSTR-1 compliant procurement ledger generated for September 2026.',
      [{ text: 'Download PDF / CSV', onPress: () => {} }, { text: 'Close', style: 'cancel' }]
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Procurement Intelligence"
        subtitle={`${state.buyer.firmName} • Analytics`}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Period Selector */}
        <View style={styles.periodRow}>
          {(['WEEK', 'MONTH', 'SEASON'] as const).map((p) => (
            <TouchableOpacity
              key={p}
              style={[
                styles.periodTab,
                selectedPeriod === p && styles.periodTabActive,
              ]}
              onPress={() => setSelectedPeriod(p)}
            >
              <Text
                style={[
                  styles.periodText,
                  selectedPeriod === p && styles.periodTextActive,
                ]}
              >
                {p === 'WEEK' ? 'Last 7 Days' : p === 'MONTH' ? 'September 2026' : 'Kharif-Rabi 2026'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* High Level KPI Cards */}
        <View style={styles.kpiGrid}>
          <MetricCard
            title="Procurement Volume"
            value="1,420 QTL"
            subtext="+18% vs last month"
            trend="+18%"
            trendDirection="up"
            icon="crop"
          />
          <MetricCard
            title="Avg Purchase Price"
            value="₹2,440"
            subtext="Per Quintal (Grade A)"
            icon="wallet"
          />
        </View>

        <View style={styles.kpiGrid}>
          <MetricCard
            title="Avg Queue Turnaround"
            value="18.5 min"
            subtext="Gate arrival to weighout"
            trend="-32%"
            trendDirection="up"
            icon="clock"
          />
          <MetricCard
            title="Escrow Settlement"
            value="100%"
            subtext="Zero payment disputes"
            icon="shield"
          />
        </View>

        {/* Commodity Distribution Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Layers size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>Commodity Procurement Share</Text>
          </View>

          <View style={styles.cropBarSection}>
            {/* Sharbati Wheat */}
            <View style={styles.cropBarItem}>
              <View style={styles.cropBarLabelRow}>
                <Text style={styles.cropName}>Sharbati Wheat (Grade A)</Text>
                <Text style={styles.cropPercentage}>824 QTL (58%)</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '58%', backgroundColor: colors.primary }]} />
              </View>
            </View>

            {/* Basmati 1121 */}
            <View style={styles.cropBarItem}>
              <View style={styles.cropBarLabelRow}>
                <Text style={styles.cropName}>Basmati 1121 Paddy</Text>
                <Text style={styles.cropPercentage}>398 QTL (28%)</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '28%', backgroundColor: colors.accentYellow }]} />
              </View>
            </View>

            {/* Mustard */}
            <View style={styles.cropBarItem}>
              <View style={styles.cropBarLabelRow}>
                <Text style={styles.cropName}>Mustard (Pusa Bold)</Text>
                <Text style={styles.cropPercentage}>198 QTL (14%)</Text>
              </View>
              <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: '14%', backgroundColor: colors.accentOrange }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Mandi Velocity Benchmarks */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Clock size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>Stage-wise Processing Speed</Text>
          </View>
          <Text style={styles.cardSub}>
            Digital slot coordination eliminated yard congestion bottlenecks.
          </Text>

          <View style={styles.velocitySteps}>
            <View style={styles.velocityRow}>
              <Text style={styles.velocityStage}>1. Digital Gate Pass Scan</Text>
              <Text style={styles.velocityTime}>1.5 min</Text>
            </View>
            <View style={styles.velocityRow}>
              <Text style={styles.velocityStage}>2. AI Pre-grading & Inspection</Text>
              <Text style={styles.velocityTime}>5.8 min</Text>
            </View>
            <View style={styles.velocityRow}>
              <Text style={styles.velocityStage}>3. Electronic Weighbridge Scale</Text>
              <Text style={styles.velocityTime}>4.2 min</Text>
            </View>
            <View style={styles.velocityRow}>
              <Text style={styles.velocityStage}>4. Offer & Acceptance</Text>
              <Text style={styles.velocityTime}>4.0 min</Text>
            </View>
            <View style={styles.velocityRow}>
              <Text style={styles.velocityStage}>5. Direct DBT Escrow Release</Text>
              <Text style={styles.velocityTime}>3.0 min</Text>
            </View>
          </View>
        </View>

        {/* Catchment Area Origin */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MapPin size={18} color={colors.primary} />
            <Text style={styles.cardTitle}>Top Origin Clusters</Text>
          </View>

          <View style={styles.originList}>
            {[
              { cluster: 'Taraori & Sambhli', count: '48 Farmers', vol: '620 QTL' },
              { cluster: 'Nilokheri Mandi Zone', count: '32 Farmers', vol: '410 QTL' },
              { cluster: 'Assandh Belt', count: '19 Farmers', vol: '240 QTL' },
              { cluster: 'Karnal Rural', count: '12 Farmers', vol: '150 QTL' },
            ].map((origin, idx) => (
              <View key={origin.cluster} style={styles.originItem}>
                <View style={styles.originLeft}>
                  <Text style={styles.originIndex}>#{idx + 1}</Text>
                  <View>
                    <Text style={styles.originName}>{origin.cluster}</Text>
                    <Text style={styles.originCount}>{origin.count}</Text>
                  </View>
                </View>
                <Text style={styles.originVol}>{origin.vol}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Report Export Button */}
        <View style={styles.exportSection}>
          <SecondaryButton
            title="Download APMC Regulatory Audit Slip"
            icon="receipt"
            onPress={handleExportAuditReport}
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
  periodRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  periodTab: {
    flex: 1,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  periodTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  periodText: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.medium,
    color: colors.textSecondary,
  },
  periodTextActive: {
    color: colors.surface,
    fontFamily: typography.fontFamilies.bold,
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
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
    marginBottom: spacing.xs,
  },
  cardTitle: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamilies.bold,
    color: colors.textPrimary,
  },
  cardSub: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  cropBarSection: {
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  cropBarItem: {
    gap: 4,
  },
  cropBarLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cropName: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.semiBold,
    color: colors.textPrimary,
  },
  cropPercentage: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.bold,
    color: colors.textSecondary,
  },
  progressBarBg: {
    height: 8,
    borderRadius: radius.full,
    backgroundColor: colors.backgroundLight,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: radius.full,
  },
  velocitySteps: {
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  velocityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  velocityStage: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.medium,
    color: colors.textPrimary,
  },
  velocityTime: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.bold,
    color: colors.primary,
  },
  originList: {
    marginTop: spacing.xs,
    gap: spacing.sm,
  },
  originItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  originLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  originIndex: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.bold,
    color: colors.textTertiary,
    width: 20,
  },
  originName: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamilies.semiBold,
    color: colors.textPrimary,
  },
  originCount: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
  },
  originVol: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamilies.bold,
    color: colors.primaryDark,
  },
  exportSection: {
    marginTop: spacing.xs,
  },
});
