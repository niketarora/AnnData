import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { useAppStore } from '../../store';
import { AppHeader } from '../../components/common/AppHeader';
import { StatusChip } from '../../components/common/StatusChip';
import { BuyerStackParamList } from '../../types';

export const IncomingLotsScreen: React.FC = () => {
  const [state] = useAppStore();
  const navigation = useNavigation<NativeStackNavigationProp<BuyerStackParamList>>();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'ARRIVED' | 'INSPECTION' | 'COMPLETED'>('ALL');

  const lots = state.lots.filter((l) => {
    const matchesSearch =
      l.farmerName.toLowerCase().includes(search.toLowerCase()) ||
      l.crop.toLowerCase().includes(search.toLowerCase()) ||
      l.id.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;
    if (filter === 'ARRIVED') return l.status === 'GATE_CHECKED_IN' || l.status === 'IN_TRANSIT';
    if (filter === 'INSPECTION') return l.status === 'PHYSICALLY_INSPECTED' || l.status === 'WEIGHED';
    if (filter === 'COMPLETED') return l.status === 'PAID' || l.status === 'COMPLETED';
    return true;
  });

  return (
    <View style={styles.container}>
      <AppHeader
        title="Incoming Farmer Lots"
        subtitle="Mandi Gate Log & Intake Queue"
        onNotificationPress={() => navigation.navigate('BuyerNotifications')}
        onProfilePress={() => navigation.navigate('BuyerProfile')}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search by farmer, crop, or lot ID..."
            placeholderTextColor={colors.textSecondary}
          />
        </View>

        {/* Filter Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          {(['ALL', 'ARRIVED', 'INSPECTION', 'COMPLETED'] as const).map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filterChip, filter === f && styles.filterChipActive]}
              onPress={() => setFilter(f)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filter === f && styles.filterChipTextActive,
                ]}
              >
                {f === 'ALL'
                  ? 'All Incoming'
                  : f === 'ARRIVED'
                  ? 'Gate In / Arrived'
                  : f === 'INSPECTION'
                  ? 'Inspection & Weighing'
                  : 'Settled'}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Lots List */}
        <View style={styles.lotsList}>
          {lots.map((lot) => (
            <TouchableOpacity
              key={lot.id}
              style={styles.lotCard}
              onPress={() => navigation.navigate('BuyerLotDetails', { lotId: lot.id })}
              activeOpacity={0.88}
            >
              <View style={styles.lotHeader}>
                <Image source={{ uri: lot.images[0] }} style={styles.thumbnail} />
                <View style={styles.lotMainInfo}>
                  <View style={styles.farmerRow}>
                    <Text style={styles.farmerName}>{lot.farmerName}</Text>
                    <StatusChip
                      label={lot.status.replace('_', ' ')}
                      variant={
                        lot.status === 'GATE_CHECKED_IN'
                          ? 'info'
                          : lot.status === 'PAID'
                          ? 'success'
                          : 'warning'
                      }
                    />
                  </View>
                  <Text style={styles.commodityText}>
                    {lot.crop} ({lot.variety}) • {lot.quantityQuintals} Quintals
                  </Text>
                  <Text style={styles.lotMeta}>
                    Token #MKT-B-142 • Assigned Gate 2 Express
                  </Text>
                </View>
              </View>

              <View style={styles.lotFooter}>
                <View style={styles.preGradeRow}>
                  <Text style={styles.preGradeLabel}>AI Grade:</Text>
                  <Text style={styles.preGradeValue}>Grade A (88/100, 11.8% moisture)</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={colors.primaryLight} />
              </View>
            </TouchableOpacity>
          ))}
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.spaceSm,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.spaceMd,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.bodyBaseMedium,
    color: colors.textPrimary,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.spaceXs,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
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
    gap: spacing.spaceSm,
  },
  lotCard: {
    backgroundColor: colors.card,
    borderRadius: radius.xl,
    padding: spacing.spaceMd,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
    gap: spacing.spaceSm,
  },
  lotHeader: {
    flexDirection: 'row',
    gap: spacing.spaceSm,
  },
  thumbnail: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainer,
  },
  lotMainInfo: {
    flex: 1,
    gap: 2,
  },
  farmerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  farmerName: {
    ...typography.titleCard,
    color: colors.textPrimary,
  },
  commodityText: {
    ...typography.bodyBaseMedium,
    color: colors.textPrimary,
  },
  lotMeta: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  lotFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: spacing.spaceXs,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  preGradeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  preGradeLabel: {
    ...typography.captionBold,
    color: colors.textSecondary,
  },
  preGradeValue: {
    ...typography.caption,
    color: colors.success,
  },
});
