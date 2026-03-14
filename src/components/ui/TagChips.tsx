import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { useRouter } from 'expo-router'
import { useTheme } from '../../context/ThemeContext'
import { Spacing, Radius } from '../../constants/theme'

interface TagChipsProps {
  tags: string[]
  onTagPress?: (tag: string) => void
  selected?: string | null
}

export function TagChips({ tags, onTagPress, selected }: TagChipsProps) {
  const { colors } = useTheme()
  const router = useRouter()

  const handlePress = (tag: string) => {
    if (onTagPress) {
      onTagPress(tag)
    } else {
      router.push({ pathname: '/search', params: { tag } })
    }
  }

  if (!tags || tags.length === 0) return null

  return (
    <View style={styles.container}>
      {tags.map((tag) => {
        const isSelected = selected === tag
        return (
          <TouchableOpacity
            key={tag}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected
                  ? 'rgba(59,130,246,0.2)'
                  : colors.background.paper,
                borderColor: isSelected ? '#3b82f6' : colors.border,
              },
            ]}
            onPress={() => handlePress(tag)}
            accessibilityRole="button"
            accessibilityLabel={`Tag ${tag}`}
          >
            <Text
              style={[
                styles.chipText,
                { color: isSelected ? '#3b82f6' : colors.secondary },
              ]}
            >
              #{tag}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '500',
  },
})
