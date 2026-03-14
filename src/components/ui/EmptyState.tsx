import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useTheme } from '../../context/ThemeContext'
import { Spacing, Typography, Radius } from '../../constants/theme'

interface EmptyStateProps {
  title?: string
  message?: string
  actionLabel?: string
  onAction?: () => void
  showHomeButton?: boolean
}

export function EmptyState({
  title = 'Nothing here yet',
  message = 'No results found.',
  actionLabel,
  onAction,
  showHomeButton,
}: EmptyStateProps) {
  const { colors } = useTheme()
  const router = useRouter()

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🎞️</Text>
      <Text style={[styles.title, { color: colors.primary }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.secondary }]}>{message}</Text>
      {actionLabel && onAction && (
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.primary }]}
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <Text style={[styles.btnText, { color: colors.background.default }]}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
      {showHomeButton && (
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.primary }]}
          onPress={() => router.push('/')}
          accessibilityRole="button"
          accessibilityLabel="Go Home"
        >
          <Text style={[styles.btnText, { color: colors.background.default }]}>Go Home</Text>
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xxl,
  },
  emoji: {
    fontSize: 48,
    marginBottom: Spacing.lg,
  },
  title: {
    ...Typography.h2,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  message: {
    ...Typography.body1,
    textAlign: 'center',
    marginBottom: Spacing.xl,
  },
  btn: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: Radius.full,
  },
  btnText: {
    fontSize: 15,
    fontWeight: '600',
  },
})
