import React, { useEffect, useState } from 'react'
import {
  Modal,
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Frame, Category, Creator, Tag } from '../../types'
import { useTheme } from '../../context/ThemeContext'
import { supabase } from '../../lib/supabase'
import { getCategories, getTags, getAllCreators } from '../../lib/queries'
import { slugify } from '../../lib/utils'
import { Spacing, Radius } from '../../constants/theme'

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
  category_id: z.string().optional(),
  creator_username: z.string().optional(),
  technique_notes: z.string().optional(),
  rank: z.number().default(0),
})

type FormData = {
  title: string
  slug: string
  description?: string
  category_id?: string
  creator_username?: string
  technique_notes?: string
  rank: number
}

interface EditFrameModalProps {
  visible: boolean
  frame: Frame | null
  onClose: () => void
  onSaved: () => void
}

export function EditFrameModal({ visible, frame, onClose, onSaved }: EditFrameModalProps) {
  const { colors } = useTheme()
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [creators, setCreators] = useState<Creator[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema) as any,
    defaultValues: { rank: 0 },
  })

  const titleVal = watch('title')

  useEffect(() => {
    if (visible) {
      Promise.all([getCategories(), getTags(), getAllCreators()]).then(([cats, tgs, crs]) => {
        setCategories(cats)
        setTags(tgs)
        setCreators(crs)
      })
    }
  }, [visible])

  useEffect(() => {
    if (frame) {
      reset({
        title: frame.title,
        slug: frame.slug,
        description: frame.description ?? '',
        category_id: frame.category_id ?? '',
        creator_username: frame.creator?.username ?? '',
        technique_notes: frame.technique_notes ?? '',
        rank: frame.rank,
      })
      setSelectedTags(frame.tags ?? [])
    }
  }, [frame])

  useEffect(() => {
    if (titleVal && frame && titleVal !== frame.title) {
      setValue('slug', slugify(titleVal))
    }
  }, [titleVal])

  const toggleTag = (slug: string) => {
    setSelectedTags((prev) =>
      prev.includes(slug) ? prev.filter((t) => t !== slug) : [...prev, slug]
    )
  }

  const onSubmit = async (data: FormData) => {
    if (!frame) return
    setSaving(true)
    try {
      // Resolve creator_id
      let creatorId: string | null = frame.creator_id
      if (data.creator_username) {
        const creator = creators.find((c) => c.username === data.creator_username)
        creatorId = creator?.id ?? null
      } else {
        creatorId = null
      }

      const { error } = await supabase
        .from('frames')
        .update({
          title: data.title,
          slug: data.slug,
          description: data.description || null,
          category_id: data.category_id || null,
          creator_id: creatorId,
          technique_notes: data.technique_notes || null,
          rank: data.rank,
          tags: selectedTags,
        })
        .eq('id', frame.id)

      if (error) throw error

      // Sync frame_tags
      await supabase.from('frame_tags').delete().eq('frame_id', frame.id)
      if (selectedTags.length > 0) {
        const tagRows = tags
          .filter((t) => selectedTags.includes(t.slug))
          .map((t) => ({ frame_id: frame.id, tag_id: t.id }))
        if (tagRows.length > 0) {
          await supabase.from('frame_tags').insert(tagRows)
        }
      }

      onSaved()
      onClose()
    } catch (e: unknown) {
      Alert.alert('Error', (e as Error).message ?? 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const inputStyle = [styles.input, { color: colors.primary, borderColor: colors.border, backgroundColor: colors.background.paper }]

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <KeyboardAvoidingView
        style={[styles.modal, { backgroundColor: colors.background.default }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.divider }]}>
          <TouchableOpacity onPress={onClose} accessibilityRole="button" accessibilityLabel="Cancel">
            <Text style={[styles.cancel, { color: colors.secondary }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.primary }]}>Edit Frame</Text>
          <TouchableOpacity onPress={handleSubmit(onSubmit)} disabled={saving} accessibilityRole="button" accessibilityLabel="Save">
            <Text style={[styles.save, { color: '#3b82f6', opacity: saving ? 0.5 : 1 }]}>
              {saving ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Title */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.secondary }]}>Title *</Text>
            <Controller
              control={control}
              name="title"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  style={inputStyle}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholderTextColor={colors.tertiary}
                />
              )}
            />
            {errors.title && <Text style={styles.error}>{errors.title.message}</Text>}
          </View>

          {/* Slug */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.secondary }]}>Slug *</Text>
            <Controller
              control={control}
              name="slug"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  style={inputStyle}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  autoCapitalize="none"
                  placeholderTextColor={colors.tertiary}
                />
              )}
            />
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.secondary }]}>Description</Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  style={[inputStyle, styles.multiline]}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={3}
                  placeholderTextColor={colors.tertiary}
                />
              )}
            />
          </View>

          {/* Category */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.secondary }]}>Category</Text>
            <Controller
              control={control}
              name="category_id"
              render={({ field: { value, onChange } }) => (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pillRow}>
                  <TouchableOpacity
                    style={[styles.pill, { borderColor: !value ? '#3b82f6' : colors.border, backgroundColor: !value ? 'rgba(59,130,246,0.1)' : 'transparent' }]}
                    onPress={() => onChange('')}
                  >
                    <Text style={{ color: !value ? '#3b82f6' : colors.secondary, fontSize: 13 }}>None</Text>
                  </TouchableOpacity>
                  {categories.map((cat) => (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.pill, { borderColor: value === cat.id ? '#3b82f6' : colors.border, backgroundColor: value === cat.id ? 'rgba(59,130,246,0.1)' : 'transparent' }]}
                      onPress={() => onChange(cat.id)}
                    >
                      <Text style={{ color: value === cat.id ? '#3b82f6' : colors.secondary, fontSize: 13 }}>{cat.name}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            />
          </View>

          {/* Tags */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.secondary }]}>Tags</Text>
            <View style={styles.tagsWrap}>
              {tags.map((tag) => (
                <TouchableOpacity
                  key={tag.id}
                  style={[
                    styles.tagChip,
                    {
                      borderColor: selectedTags.includes(tag.slug) ? '#3b82f6' : colors.border,
                      backgroundColor: selectedTags.includes(tag.slug) ? 'rgba(59,130,246,0.1)' : 'transparent',
                    },
                  ]}
                  onPress={() => toggleTag(tag.slug)}
                >
                  <Text style={{ color: selectedTags.includes(tag.slug) ? '#3b82f6' : colors.secondary, fontSize: 12 }}>
                    #{tag.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Technique notes */}
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.secondary }]}>Technique Notes</Text>
            <Controller
              control={control}
              name="technique_notes"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  style={[inputStyle, styles.multiline]}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={4}
                  placeholderTextColor={colors.tertiary}
                />
              )}
            />
          </View>

          {/* Rank */}
          <View style={[styles.field, { marginBottom: Spacing.xxl }]}>
            <Text style={[styles.label, { color: colors.secondary }]}>Rank</Text>
            <Controller
              control={control}
              name="rank"
              render={({ field: { value, onChange } }) => (
                <TextInput
                  style={inputStyle}
                  value={String(value)}
                  onChangeText={(t) => onChange(parseInt(t) || 0)}
                  keyboardType="numeric"
                  placeholderTextColor={colors.tertiary}
                />
              )}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modal: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  headerTitle: { fontSize: 17, fontWeight: '600' },
  cancel: { fontSize: 16 },
  save: { fontSize: 16, fontWeight: '600' },
  scroll: { flex: 1, padding: Spacing.lg },
  field: { marginBottom: Spacing.lg },
  label: { fontSize: 13, fontWeight: '500', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 15,
  },
  multiline: { height: 90, textAlignVertical: 'top', paddingTop: Spacing.sm },
  error: { color: '#ef4444', fontSize: 12, marginTop: 3 },
  pillRow: { flexDirection: 'row' },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    marginRight: Spacing.sm,
  },
  tagsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tagChip: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: Radius.md,
    borderWidth: 1,
  },
})
