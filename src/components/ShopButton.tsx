// src/components/ShopButton.tsx
import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { COLORS, SIZES } from '@constants/theme';
import { triggerHaptic } from '@constants/student';

interface ShopButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export default function ShopButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  isLoading = false,
  disabled = false,
  style,
  textStyle,
}: ShopButtonProps) {
  const isBusy = loading || isLoading;

  const handlePress = () => {
    triggerHaptic(25);
    onPress();
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'primary' && styles.primaryBtn,
        variant === 'secondary' && styles.secondaryBtn,
        variant === 'outline' && styles.outlineBtn,
        disabled && styles.disabledBtn,
        style,
      ]}
      onPress={handlePress}
      disabled={disabled || isBusy}
      activeOpacity={0.65}
    >
      {isBusy ? (
        <ActivityIndicator color="#FFFFFF" size="small" />
      ) : (
        <Text
          style={[
            styles.text,
            variant === 'outline' && styles.outlineText,
            textStyle,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 44,
    borderRadius: SIZES.radius,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
  },
  secondaryBtn: {
    backgroundColor: COLORS.secondary,
  },
  outlineBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: COLORS.primary,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  text: {
    color: '#FFFFFF',
    fontSize: SIZES.body1,
    fontWeight: '700',
  },
  outlineText: {
    color: COLORS.primary,
  },
});
