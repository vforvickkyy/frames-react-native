import React from 'react'
import { ScrollView, View, StyleSheet, ViewStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../../context/ThemeContext'

interface ScreenWrapperProps {
  children: React.ReactNode
  scrollable?: boolean
  style?: ViewStyle
  contentStyle?: ViewStyle
  padded?: boolean
}

export function ScreenWrapper({
  children,
  scrollable = true,
  style,
  contentStyle,
  padded = false,
}: ScreenWrapperProps) {
  const { colors } = useTheme()

  if (scrollable) {
    return (
      <SafeAreaView
        style={[styles.safe, { backgroundColor: colors.background.default }, style]}
        edges={['top']}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            padded && styles.padded,
            contentStyle,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: colors.background.default }, style]}
      edges={['top']}
    >
      <View style={[styles.fill, padded && styles.padded, contentStyle]}>{children}</View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  fill: {
    flex: 1,
  },
  padded: {
    padding: 16,
  },
})
