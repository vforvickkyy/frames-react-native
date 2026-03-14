import React from 'react'
import { ActivityIndicator, View, StyleSheet, ViewStyle } from 'react-native'
import { useTheme } from '../../context/ThemeContext'

interface LoadingSpinnerProps {
  size?: 'small' | 'large'
  color?: string
  style?: ViewStyle
  fullScreen?: boolean
}

export function LoadingSpinner({ size = 'large', color, style, fullScreen }: LoadingSpinnerProps) {
  const { colors } = useTheme()

  return (
    <View style={[fullScreen ? styles.fullScreen : styles.container, style]}>
      <ActivityIndicator size={size} color={color ?? colors.primary} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
