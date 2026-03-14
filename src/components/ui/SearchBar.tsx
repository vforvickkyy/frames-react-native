import React from 'react'
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native'
import { useTheme } from '../../context/ThemeContext'
import { Spacing, Radius } from '../../constants/theme'

interface SearchBarProps {
  value: string
  onChangeText: (text: string) => void
  onSubmit?: () => void
  placeholder?: string
  autoFocus?: boolean
}

export function SearchBar({
  value,
  onChangeText,
  onSubmit,
  placeholder = 'Search...',
  autoFocus,
}: SearchBarProps) {
  const { colors } = useTheme()

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.background.paper, borderColor: colors.border },
      ]}
    >
      <TextInput
        style={[styles.input, { color: colors.primary }]}
        placeholder={placeholder}
        placeholderTextColor={colors.tertiary}
        value={value}
        onChangeText={onChangeText}
        onSubmitEditing={onSubmit}
        returnKeyType="search"
        autoFocus={autoFocus}
        accessibilityLabel="Search"
        accessibilityRole="search"
      />
      {value.length > 0 && (
        <TouchableOpacity
          onPress={() => onChangeText('')}
          style={styles.clear}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
        >
        </TouchableOpacity>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    height: 44,
  },
  input: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  clear: {
    padding: Spacing.xs,
    opacity: 0.6,
  },
})
