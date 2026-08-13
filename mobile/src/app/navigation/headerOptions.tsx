import React from 'react';
import { Platform, StyleSheet, TouchableOpacity } from 'react-native';
import type { NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { colors, spacing } from '../../shared/theme';
import { Icon } from '../../shared/components/Icon';

export const stackScreenOptions = (navigation: any): NativeStackNavigationOptions => ({
  headerStyle: { backgroundColor: colors.surface },
  headerTitleStyle: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 17,
    color: colors.text,
  },
  headerTintColor: colors.primary,
  headerShadowVisible: false,
  headerBackVisible: false,
  contentStyle: { backgroundColor: colors.background },
  headerLeft: ({ canGoBack }) =>
    canGoBack ? (
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backBtn}
        activeOpacity={0.7}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Icon name="arrow-left" size={20} color={colors.primary} />
      </TouchableOpacity>
    ) : null,
});

const styles = StyleSheet.create({
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Platform.OS === 'ios' ? 0 : spacing.xs,
  },
});
