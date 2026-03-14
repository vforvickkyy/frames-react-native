import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useTheme } from '../../context/ThemeContext'
import { Typography, Spacing } from '../../constants/theme'

interface SectionHeaderProps {
  title: string
  actionLabel?: string
  onAction?: () => void
}

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  const { colors } = useTheme()

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.primary }]}>{title}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity onPress={onAction} accessibilityRole="button" accessibilityLabel={actionLabel}>
          <Text style={[styles.action, { color: '#3b82f6' }]}>
            {actionLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
  title: {
    ...Typography.h3,
  },
  action: {
    fontSize: 13,
    fontWeight: '600',
  },
})
