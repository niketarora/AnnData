import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  CheckCircle2,
  AlertTriangle,
  ClipboardCheck,
  ChevronRight,
  ArrowLeft,
  Scale,
  Sparkles,
  Droplets,
  ShieldCheck,
} from 'lucide-react-native';
import { useAppStore } from '../../store';
import { mockStore } from '../../store/mockStore';
import { colors, typography, spacing, radius, shadows } from '../../theme';
import { AppHeader } from '../../components/common/AppHeader';
import { StatusChip } from '../../components/common/StatusChip';
import { PrimaryButton } from '../../components/common/PrimaryButton';
import { SecondaryButton } from '../../components/common/SecondaryButton';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BuyerStackParamList } from '../../types/navigation';

type Props = NativeStackScreenProps<BuyerStackParamList, 'PhysicalInspectionStation'>;

export const PhysicalInspectionStationScreen: React.FC<Props> = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const state = useAppStore();
  const bookingId = route.params?.bookingId || state.activeBookingId;
  const booking = state.bookings.find((b) => b.id === bookingId) || state.bookings[0];
  const lot = state.lots.find((l) => l.id === booking?.lotId) || state.lots[0];
  const existingInspection = state.inspections[bookingId];

  // Inspection form state
  const [selectedGrade, setSelectedGrade] = useState<'Grade A' | 'Grade B' | 'Grade C'>(
    (existingInspection?.physicalGrade as 'Grade A' | 'Grade B' | 'Grade C') || 'Grade A'
  );
  const [moisture, setMoisture] = useState<string>(
    existingInspection ? `${existingInspection.moistureReading || existingInspection.moisturePercent || 11.8}` : '11.8'
  );
  const [foreignMatter, setForeignMatter] = useState<string>('0.4');
  const [damagedGrain, setDamagedGrain] = useState<string>('1.2');
  const [odorNormal, setOdorNormal] = useState<boolean>(true);
  const [infestationFree, setInfestationFree] = useState<boolean>(true);
  const [lustreGood, setLustreGood] = useState<boolean>(true);
  const [inspectorNotes, setInspectorNotes] = useState<string>(
    existingInspection?.inspectorNotes || 'Exceptional lot quality. Clean grain, minimal broken seeds.'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(!!existingInspection);

  const handleApproveInspection = () => {
    setIsSubmitting(true);
    const score = selectedGrade === 'Grade A' ? 89 : selectedGrade === 'Grade B' ? 78 : 65;

    mockStore.submitPhysicalInspection({
      bookingId,
      lotId: lot.id,
      inspectorName: state.buyer.name,
      physicalGrade: selectedGrade,
      moistureReading: parseFloat(moisture) || 11.8,
      foreignMatterPercent: parseFloat(foreignMatter) || 0.4,
      verifiedScore: score,
      status: 'VERIFIED',
      inspectorNotes,
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      Alert.alert(
        'Physical Inspection Verified',
        `Lot ${lot.id} successfully graded as ${selectedGrade} (${score}/100). Ready for Weighbridge Station.`,
        [
          {
            text: 'Proceed to Weighbridge',
            onPress: () => navigation.navigate('WeighbridgeStation', { bookingId }),
          },
          {
            text: 'Back to Queue',
            onPress: () => navigation.goBack(),
            style: 'cancel',
          },
        ]
      );
    }, 400);
  };

  return (
    <View style={styles.container}>
      <AppHeader
        title="Physical Inspection Station"
        subtitle={`Bay 3 • Token #${booking?.tokenNumber || 'MKT-B-142'}`}
        showBack
        onBack={() => navigation.goBack()}
      />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Lot Overview Banner */}
        <View style={styles.lotCard}>
          <View style={styles.lotHeader}>
            <View>
              <Text style={styles.lotTitle}>{lot.variety} {lot.crop}</Text>
              <Text style={styles.lotSub}>
                Farmer: {lot.farmerName} • Lot #{lot.id}
              </Text>
            </View>
            <StatusChip label={lot.status.replace(/_/g, ' ')} status="brand" />
          </View>

          <View style={styles.lotMetaGrid}>
            <View style={styles.lotMetaItem}>
              <Text style={styles.metaLabel}>AI Prelim Grade</Text>
              <Text style={styles.metaValueHighlight}>
                {lot.aiGrading?.grade || lot.qualityAssessment?.predictedGrade || 'Grade A'} ({lot.aiGrading?.confidenceScore || lot.qualityAssessment?.confidenceScore || 88}/100)
              </Text>
            </View>
            <View style={styles.lotMetaItem}>
              <Text style={styles.metaLabel}>Declared Qty</Text>
              <Text style={styles.metaValue}>{lot.quantityQuintals} Quintals</Text>
            </View>
            <View style={styles.lotMetaItem}>
              <Text style={styles.metaLabel}>Vehicle Reg</Text>
              <Text style={styles.metaValue}>{booking?.vehicleNumber || 'HR-05-AB-4821'}</Text>
            </View>
            <View style={styles.lotMetaItem}>
              <Text style={styles.metaLabel}>Arrival Bay</Text>
              <Text style={styles.metaValue}>Bay 3 (Express)</Text>
            </View>
          </View>
        </View>

        {/* Physical Grade Selection */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <ClipboardCheck size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Physical Grade Assessment</Text>
          </View>
          <Text style={styles.sectionDesc}>
            Verify manual sample against standard APMC AGMARK grade specifications.
          </Text>

          <View style={styles.gradeButtonRow}>
            {(['Grade A', 'Grade B', 'Grade C'] as const).map((grade) => {
              const isSelected = selectedGrade === grade;
              return (
                <TouchableOpacity
                  key={grade}
                  style={[
                    styles.gradeButton,
                    isSelected && styles.gradeButtonActive,
                  ]}
                  onPress={() => setSelectedGrade(grade)}
                >
                  <Text style={[styles.gradeButtonText, isSelected && styles.gradeButtonTextActive]}>
                    {grade}
                  </Text>
                  <Text style={[styles.gradeSub, isSelected && styles.gradeSubActive]}>
                    {grade === 'Grade A' ? 'Premium 85+' : grade === 'Grade B' ? 'Fair 70-84' : 'Sub 60-69'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Lab / On-Site Instrument Readings */}
        <View style={styles.sectionCard}>
          <View style={styles.sectionHeader}>
            <Droplets size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Digital Moisture & Impurity Readings</Text>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>Moisture Meter (%)</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={moisture}
                  onChangeText={setMoisture}
                  placeholder="12.0"
                />
                <Text style={styles.inputUnit}>%</Text>
              </View>
              <Text style={styles.inputHint}>Target: &lt;12.5% ideal</Text>
            </View>

            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>Foreign Matter (%)</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={foreignMatter}
                  onChangeText={setForeignMatter}
                  placeholder="0.5"
                />
                <Text style={styles.inputUnit}>%</Text>
              </View>
              <Text style={styles.inputHint}>Limit: &lt;1.0% max</Text>
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>Damaged / Chipped (%)</Text>
              <View style={styles.inputBox}>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={damagedGrain}
                  onChangeText={setDamagedGrain}
                  placeholder="1.0"
                />
                <Text style={styles.inputUnit}>%</Text>
              </View>
              <Text style={styles.inputHint}>Limit: &lt;2.0% max</Text>
            </View>

            <View style={styles.inputCol}>
              <Text style={styles.inputLabel}>Weevil / Pest Count</Text>
              <View style={[styles.inputBox, styles.inputBoxDisabled]}>
                <Text style={styles.textInputDisabled}>0 detected</Text>
                <ShieldCheck size={16} color={colors.success} />
              </View>
              <Text style={styles.inputHint}>Digital Trap clean</Text>
            </View>
          </View>
        </View>

        {/* Physical Quality Checklist */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Inspector Verification Checklist</Text>
          <View style={styles.checklist}>
            <TouchableOpacity
              style={styles.checkItem}
              onPress={() => setOdorNormal(!odorNormal)}
            >
              <CheckCircle2
                size={22}
                color={odorNormal ? colors.primary : colors.borderLight}
              />
              <Text style={styles.checkItemText}>No abnormal odor, souring or damp smell</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkItem}
              onPress={() => setInfestationFree(!infestationFree)}
            >
              <CheckCircle2
                size={22}
                color={infestationFree ? colors.primary : colors.borderLight}
              />
              <Text style={styles.checkItemText}>Free from live grain borers or fungus</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.checkItem}
              onPress={() => setLustreGood(!lustreGood)}
            >
              <CheckCircle2
                size={22}
                color={lustreGood ? colors.primary : colors.borderLight}
              />
              <Text style={styles.checkItemText}>Natural golden amber sheen & grain plumpness verified</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Inspector Remarks */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Inspector Remarks</Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={3}
            value={inspectorNotes}
            onChangeText={setInspectorNotes}
            placeholder="Enter physical observations, lot notes, or deduction reasons..."
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <PrimaryButton
            title={submitted ? "Update & Proceed to Weighbridge" : "Approve & Send to Weighbridge"}
            icon="scale"
            loading={isSubmitting}
            onPress={handleApproveInspection}
          />

          <View style={styles.secondaryButtonRow}>
            <SecondaryButton
              title="View Weighbridge Station"
              onPress={() => navigation.navigate('WeighbridgeStation', { bookingId })}
            />
          </View>
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
  lotCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  lotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  lotTitle: {
    fontSize: typography.sizes.lg,
    fontFamily: typography.fontFamilies.bold,
    color: colors.textPrimary,
  },
  lotSub: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
    marginTop: 2,
  },
  lotMetaGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: spacing.sm,
  },
  lotMetaItem: {
    width: '50%',
  },
  metaLabel: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.medium,
    color: colors.textTertiary,
    textTransform: 'uppercase',
  },
  metaValue: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamilies.semiBold,
    color: colors.textPrimary,
    marginTop: 2,
  },
  metaValueHighlight: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamilies.bold,
    color: colors.primary,
    marginTop: 2,
  },
  sectionCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  sectionTitle: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamilies.bold,
    color: colors.textPrimary,
  },
  sectionDesc: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textSecondary,
    marginBottom: spacing.md,
  },
  gradeButtonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  gradeButton: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.borderLight,
    alignItems: 'center',
    backgroundColor: colors.backgroundLight,
  },
  gradeButtonActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryBg,
  },
  gradeButtonText: {
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamilies.bold,
    color: colors.textSecondary,
  },
  gradeButtonTextActive: {
    color: colors.primary,
  },
  gradeSub: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textTertiary,
    marginTop: 2,
  },
  gradeSubActive: {
    color: colors.primaryDark,
  },
  inputRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  inputCol: {
    flex: 1,
  },
  inputLabel: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.semiBold,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.backgroundLight,
    height: 44,
  },
  inputBoxDisabled: {
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceHover,
  },
  textInput: {
    flex: 1,
    fontSize: typography.sizes.md,
    fontFamily: typography.fontFamilies.bold,
    color: colors.textPrimary,
  },
  textInputDisabled: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamilies.semiBold,
    color: colors.textPrimary,
  },
  inputUnit: {
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamilies.semiBold,
    color: colors.textTertiary,
  },
  inputHint: {
    fontSize: typography.sizes.xs,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textTertiary,
    marginTop: 2,
  },
  checklist: {
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: 4,
  },
  checkItemText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamilies.medium,
    color: colors.textPrimary,
  },
  textArea: {
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    padding: spacing.sm,
    fontSize: typography.sizes.sm,
    fontFamily: typography.fontFamilies.regular,
    color: colors.textPrimary,
    minHeight: 70,
    textAlignVertical: 'top',
    backgroundColor: colors.backgroundLight,
    marginTop: spacing.sm,
  },
  actionContainer: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  secondaryButtonRow: {
    marginTop: spacing.xs,
  },
});
