import React from 'react'
import { View, Text, StyleSheet, ViewStyle } from 'react-native'
import { Image } from 'expo-image'
import { useTheme } from '../../context/ThemeContext'
import { getInitials } from '../../lib/utils'
import { Radius } from '../../constants/theme'

interface AvatarProps {
  uri?: string | null
  name: string
  size?: number
  style?: ViewStyle
}

export function Avatar({ uri, name, size = 40, style }: AvatarProps) {
  const { colors, isDark } = useTheme()
  const initials = getInitials(name)
  const bgColors = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#ec4899']
  const colorIndex = name.charCodeAt(0) % bgColors.length
  const bg = bgColors[colorIndex]

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 } as any}
        contentFit="cover"
        accessibilityLabel={`Avatar of ${name}`}
      />
    )
  }

  return (
    <View
      style={[
        styles.fallback,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: bg },
        style,
      ]}
    >
      <Text style={[styles.initials, { fontSize: size * 0.36, color: '#fff' }]}>{initials}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontWeight: '700',
  },
})
