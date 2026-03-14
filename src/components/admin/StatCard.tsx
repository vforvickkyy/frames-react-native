import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { MotiView } from 'moti'
import { useTheme } from '../../context/ThemeContext'
import { formatNumber } from '../../lib/utils'
import { Radius, Spacing, Shadows } from '../../constants/theme'

interface StatCardProps {
  label: string
  value: number
  accentColor: string
  onPress?: () => void
  index?: number
}

export function StatCard({ label, value, accentColor, onPress, index = 0 }: StatCardProps) {
  const { colors } = useTheme()

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'timing', duration: 300, delay: index * 80 }}
      style={[styles.card, { backgroundColor: colors.background.paper }, Shadows.md]}
    >
      <TouchableOpacity
        onPress={onPress}
        disabled={!onPress}
        style={styles.inner}
        accessibilityRole={onPress ? 'button' : 'text'}
        accessibilityLabel={`${label}: ${formatNumber(value)}`}
      >
        <View style={[styles.accent, { backgroundColor: accentColor + '22' }]}>
          <View style={[styles.dot, { backgroundColor: accentColor }]} />
        </View>
        <Text style={[styles.value, { color: colors.primary }]}>{formatNumber(value)}</Text>
        <Text style={[styles.label, { color: colors.secondary }]}>{label}</Text>
      </TouchableOpacity>
    </MotiView>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: Radius.lg,
    minWidth: 140,
    margin: Spacing.xs,
  },
  inner: {
    padding: Spacing.lg,
  },
  accent: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
    marginBottom: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
  },
})
