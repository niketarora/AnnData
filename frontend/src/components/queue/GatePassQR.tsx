import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';
import { colors, typography, spacing, radius, shadows } from '../../theme';

interface GatePassQRProps {
  tokenNumber: string;
  gateName?: string;
  windowTime?: string;
}

export const GatePassQR: React.FC<GatePassQRProps> = ({
  tokenNumber,
  gateName = 'Gate 2 Express Line',
  windowTime = '3:30 – 4:00 PM',
}) => {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.titleInfo}>
          <Text style={styles.cardTitle}>Digital Gate Pass</Text>
          <Text style={styles.cardSubtitle}>Fast-track entry {gateName}</Text>
        </View>
        <View style={styles.tokenPill}>
          <Text style={styles.tokenPillText}>TOKEN {tokenNumber}</Text>
        </View>
      </View>

      {/* Scannable Vector QR Centerpiece */}
      <View style={styles.qrContainer}>
        <View style={styles.qrBox}>
          <Svg width={160} height={160} viewBox="0 0 100 100">
            {/* Outer Positioning Markers */}
            <Rect x="5" y="5" width="28" height="28" rx="4" stroke={colors.qrDark} strokeWidth="4" fill="none" />
            <Rect x="12" y="12" width="14" height="14" rx="2" fill={colors.qrAccent} />

            <Rect x="67" y="5" width="28" height="28" rx="4" stroke={colors.qrDark} strokeWidth="4" fill="none" />
            <Rect x="74" y="12" width="14" height="14" rx="2" fill={colors.qrAccent} />

            <Rect x="5" y="67" width="28" height="28" rx="4" stroke={colors.qrDark} strokeWidth="4" fill="none" />
            <Rect x="12" y="74" width="14" height="14" rx="2" fill={colors.qrAccent} />

            {/* Internal Data Pixels */}
            <Rect x="38" y="8" width="8" height="8" rx="1.5" fill={colors.qrDark} />
            <Rect x="50" y="8" width="8" height="8" rx="1.5" fill={colors.qrDark} />
            <Rect x="38" y="24" width="8" height="8" rx="1.5" fill={colors.qrAccent} />
            <Rect x="50" y="20" width="8" height="8" rx="1.5" fill={colors.qrDark} />
            <Rect x="8" y="38" width="8" height="8" rx="1.5" fill={colors.qrDark} />
            <Rect x="22" y="44" width="12" height="8" rx="1.5" fill={colors.qrAccent} />
            <Rect x="38" y="38" width="10" height="10" rx="2" fill={colors.qrDark} />
            <Rect x="54" y="38" width="14" height="6" rx="1.5" fill={colors.qrDark} />
            <Rect x="74" y="38" width="18" height="8" rx="1.5" fill={colors.qrAccent} />
            <Rect x="8" y="52" width="10" height="8" rx="1.5" fill={colors.qrDark} />
            <Rect x="24" y="56" width="8" height="8" rx="1.5" fill={colors.qrDark} />
            <Rect x="38" y="54" width="10" height="10" rx="2" fill={colors.qrAccent} />
            <Rect x="54" y="50" width="8" height="14" rx="1.5" fill={colors.qrDark} />
            <Rect x="70" y="52" width="10" height="8" rx="1.5" fill={colors.qrDark} />
            <Rect x="84" y="52" width="8" height="14" rx="1.5" fill={colors.qrDark} />
            <Rect x="38" y="72" width="8" height="20" rx="1.5" fill={colors.qrDark} />
            <Rect x="52" y="70" width="14" height="8" rx="1.5" fill={colors.qrAccent} />
            <Rect x="72" y="72" width="20" height="8" rx="1.5" fill={colors.qrDark} />
            <Rect x="52" y="84" width="8" height="8" rx="1.5" fill={colors.qrDark} />
            <Rect x="66" y="86" width="14" height="6" rx="1.5" fill={colors.qrAccent} />
            <Rect x="86" y="84" width="6" height="8" rx="1.5" fill={colors.qrDark} />
          </Svg>
        </View>
        <Text style={styles.scanNotice}>Tap or scan QR code at Gate 2 Sensor</Text>
      </View>

      {/* Pass Details */}
      <View style={styles.detailsList}>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Assigned Window</Text>
          <Text style={styles.detailValue}>{windowTime}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>Designated Inflow</Text>
          <Text style={[styles.detailValue, { color: colors.success }]}>✓ {gateName}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.spaceMd,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.spaceSm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  titleInfo: {
    flex: 1,
  },
  cardTitle: {
    ...typography.titleCard,
    color: colors.textPrimary,
  },
  cardSubtitle: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  tokenPill: {
    backgroundColor: colors.surfaceContainerHigh,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  tokenPillText: {
    ...typography.badgeLabel,
    color: colors.textPrimary,
  },
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.spaceMd,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    marginVertical: spacing.spaceSm,
  },
  qrBox: {
    padding: 12,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    ...shadows.sm,
  },
  scanNotice: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: spacing.spaceXs,
  },
  detailsList: {
    gap: 8,
    marginTop: spacing.spaceXs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailLabel: {
    ...typography.bodyBase,
    color: colors.textSecondary,
  },
  detailValue: {
    ...typography.bodyBaseMedium,
    color: colors.textPrimary,
  },
});
