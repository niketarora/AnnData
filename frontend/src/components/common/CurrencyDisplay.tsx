import React from 'react';
import { View, Text, StyleSheet, TextStyle, ViewStyle } from 'react-native';
import { colors, typography } from '../../theme';
import { formatRupee } from '../../utils';

interface CurrencyDisplayProps {
  amount: number;
  unit?: string;
  size?: '2xl' | 'xl' | 'lg' | 'md' | 'sm';
  bold?: boolean;
  color?: string;
  deltaText?: string;
  deltaType?: 'positive' | 'negative' | 'neutral';
  style?: ViewStyle;
  amountStyle?: TextStyle;
}

export const CurrencyDisplay: React.FC<CurrencyDisplayProps> = ({
  amount,
  unit,
  size = 'lg',
  bold,
  color,
  deltaText,
  deltaType = 'positive',
  style,
  amountStyle,
}) => {
  const getTypography = () => {
    switch (size) {
      case '2xl':
        return { ...typography.currencyDisplay, fontSize: 36, lineHeight: 44 };
      case 'xl':
        return typography.currencyDisplay;
      case 'lg':
        return typography.currencyDisplayMobile;
      case 'md':
        return typography.headlineLg;
      case 'sm':
      default:
        return typography.headlineMd;
    }
  };

  const getDeltaColor = () => {
    switch (deltaType) {
      case 'negative':
        return colors.danger;
      case 'neutral':
        return colors.textSecondary;
      case 'positive':
      default:
        return colors.success;
    }
  };

  const formatted = formatRupee(amount);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.numberRow}>
        <Text
          style={[
            getTypography(),
            { color: color || colors.primaryDark },
            amountStyle,
          ]}
        >
          {formatted}
        </Text>
        {unit && (
          <Text style={[styles.unitText, { color: color || colors.textSecondary }]}>
            {unit}
          </Text>
        )}
      </View>
      {deltaText && (
        <Text style={[styles.deltaText, { color: getDeltaColor() }]}>
          {deltaText}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
  },
  numberRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  unitText: {
    ...typography.bodyBaseMedium,
    marginLeft: 4,
    color: colors.textSecondary,
  },
  deltaText: {
    ...typography.captionBold,
    marginTop: 2,
  },
});
