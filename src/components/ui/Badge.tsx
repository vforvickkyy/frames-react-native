import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle } from 'react-native'
import { Colors, Radius, Spacing } from '../../constants/theme'

type BadgeVariant = 'published' | 'hidden' | 'blue' | 'purple' | 'green' | 'amber' | 'red'

interface BadgeProps {
  label: string
  variant?: BadgeVariant
  onPress?: () => void
  style?: ViewStyle
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  published: { bg: 'rgba(16,185,129,0.15)', text: '#10b981' },
  hidden: { bg: 'rgba(120,120,120,0.15)', text: '#888' },
  blue: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6' },
  purple: { bg: 'rgba(139,92,246,0.15)', text: '#8b5cf6' },
  green: { bg: 'rgba(16,185,129,0.15)', text: '#10b981' },
  amber: { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' },
  red: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444' },
}

export function Badge({ label, variant = 'published', onPress, style }: BadgeProps) {
  const { bg, text } = variantStyles[variant]

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={[styles.badge, { backgroundColor: bg }, style]}
        accessibilityRole="button"
        accessibilityLabel={label}
      >
        <Text style={[styles.text, { color: text }]}>{label}</Text>
      </TouchableOpacity>
    )
  }

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <Text style={[styles.text, { color: text }]}>{label}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: Radius.full,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
})
