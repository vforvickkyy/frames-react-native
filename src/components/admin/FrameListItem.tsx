import React from 'react'
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import type { Frame } from '../../types'
import { useTheme } from '../../context/ThemeContext'
import { Badge } from '../ui/Badge'
import { formatNumber } from '../../lib/utils'
import { Spacing, Radius } from '../../constants/theme'
import { supabase } from '../../lib/supabase'

interface FrameListItemProps {
  frame: Frame
  onEdit: (frame: Frame) => void
  onDelete: (id: string) => void
  onToggleVisibility: (frame: Frame) => void
}

export function FrameListItem({ frame, onEdit, onDelete, onToggleVisibility }: FrameListItemProps) {
  const { colors } = useTheme()
  const router = useRouter()

  const handleDelete = () => {
    Alert.alert(
      'Delete Frame',
      `Are you sure you want to delete "${frame.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(frame.id),
        },
      ]
    )
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.background.paper,
          borderColor: colors.divider,
          opacity: frame.is_hidden ? 0.5 : 1,
        },
      ]}
    >
      {/* Thumbnail */}
      <Image
        source={{ uri: frame.thumbnail_url || frame.file_url }}
        style={styles.thumb}
        contentFit="cover"
        accessibilityLabel={frame.title}
      />

      {/* Info */}
      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.primary }]} numberOfLines={1}>
          {frame.title}
        </Text>
        <Text style={[styles.meta, { color: colors.secondary }]} numberOfLines={1}>
          {frame.category?.name ?? 'No category'} · {formatNumber(frame.view_count)} views · rank {frame.rank}
        </Text>
        <Badge
          label={frame.is_hidden ? 'Hidden' : 'Published'}
          variant={frame.is_hidden ? 'hidden' : 'published'}
          onPress={() => onToggleVisibility(frame)}
        />
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, { borderColor: colors.border }]}
          onPress={() => onEdit(frame)}
          accessibilityRole="button"
          accessibilityLabel="Edit frame"
        >
          <Text style={[styles.actionIcon, { color: colors.primary }]}>✏️</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { borderColor: colors.border }]}
          onPress={() => router.push({ pathname: '/frame/[slug]', params: { slug: frame.slug } })}
          accessibilityRole="button"
          accessibilityLabel="View frame"
        >
          <Text style={styles.actionIcon}>👁</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { borderColor: 'rgba(239,68,68,0.3)' }]}
          onPress={handleDelete}
          accessibilityRole="button"
          accessibilityLabel="Delete frame"
        >
          <Text style={styles.actionIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    gap: Spacing.md,
  },
  thumb: {
    width: 52,
    height: 52,
    borderRadius: Radius.sm,
  },
  info: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
  },
  meta: {
    fontSize: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.xs,
  },
  actionBtn: {
    width: 34,
    height: 34,
    borderRadius: Radius.sm,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: 14,
  },
})
