import React, { useState } from 'react'
import { View, TextInput, TouchableOpacity, StyleSheet, Platform } from 'react-native'
import { useRouter } from 'expo-router'
import { useTheme } from '../../context/ThemeContext'
import { Spacing, Radius } from '../../constants/theme'

export function HeroSearch() {
  const { colors, isDark } = useTheme()
  const router = useRouter()
  const [query, setQuery] = useState('')

  const handleSubmit = () => {
    if (query.trim()) {
      router.push({ pathname: '/search', params: { q: query.trim() } })
    } else {
      router.push('/search')
    }
  }

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.background.paper,
            borderColor: colors.border,
          },
        ]}
      >
        <TextInput
          style={[styles.input, { color: colors.primary }]}
          placeholder="Search frames, techniques, creators..."
          placeholderTextColor={colors.tertiary}
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSubmit}
          returnKeyType="search"
          accessibilityLabel="Search frames"
          accessibilityRole="search"
        />
        <TouchableOpacity
          style={[styles.btn, { backgroundColor: colors.primary }]}
          onPress={handleSubmit}
          accessibilityRole="button"
          accessibilityLabel="Submit search"
        >
          <View style={styles.searchIcon}>
            {/* Search icon using unicode */}
          </View>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.xl,
    borderWidth: 1,
    paddingLeft: Spacing.lg,
    paddingRight: Spacing.xs,
    height: 52,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  btn: {
    width: 38,
    height: 38,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchIcon: {
    width: 16,
    height: 16,
  },
})
