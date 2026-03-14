import React, { useEffect, useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image as RNImage,
} from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import { useRouter } from 'expo-router'
import type { Category, Creator, Tag } from '../../types'
import { useTheme } from '../../context/ThemeContext'
import { supabase } from '../../lib/supabase'
import { getCategories, getTags, getAllCreators } from '../../lib/queries'
import { slugify, fileSizeInMB, sanitizeFilename } from '../../lib/utils'
import { Spacing, Radius } from '../../constants/theme'
import { LoadingSpinner } from '../ui/LoadingSpinner'
import { API_URL, ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from '../../constants/config'

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

interface SelectedFile {
  uri: string
  name: string
  mimeType: string
  size: number
}

export function UploadForm() {
  const { colors } = useTheme()
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [creators, setCreators] = useState<Creator[]>([])
  const [selectedFile, setSelectedFile] = useState<SelectedFile | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) as any, defaultValues: { rank: 0 } })

  const titleVal = watch('title')

  useEffect(() => {
    Promise.all([getCategories(), getTags(), getAllCreators()]).then(([cats, tgs, crs]) => {
      setCategories(cats)
      setTags(tgs)
      setCreators(crs)
    })
  }, [])

  useEffect(() => {
    if (titleVal) setValue('slug', slugify(titleVal))
  }, [titleVal])

  const pickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (status !== 'granted') {
      Alert.alert('Permission required', 'Media library permission is needed to pick files.')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 1,
    })
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0]
      const mime = asset.mimeType ?? 'image/jpeg'
      if (!ALLOWED_MIME_TYPES.includes(mime)) {
        Alert.alert('Invalid file type', 'Please select a valid image or video file.')
        return
      }
      if (asset.fileSize && asset.fileSize > MAX_FILE_SIZE_BYTES) {
        Alert.alert('File too large', 'Max file size is 50 MB.')
        return
      }
      setSelectedFile({
        uri: asset.uri,
        name: asset.fileName ?? `upload_${Date.now()}`,
        mimeType: mime,
        size: asset.fileSize ?? 0,
      })
    }
  }

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['video/mp4', 'video/webm', 'video/quicktime'],
      copyToCacheDirectory: true,
    })
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0]
      if (asset.size && asset.size > MAX_FILE_SIZE_BYTES) {
        Alert.alert('File too large', 'Max file size is 50 MB.')
        return
      }
      setSelectedFile({
        uri: asset.uri,
        name: asset.name ?? `upload_${Date.now()}`,
        mimeType: asset.mimeType ?? 'video/mp4',
        size: asset.size ?? 0,
      })
    }
  }

  const toggleTag = (slug: string) => {
    setSelectedTags((prev) =>
      prev.includes(slug) ? prev.filter((t) => t !== slug) : [...prev, slug]
    )
  }

  const onSubmit = async (data: FormData) => {
    if (!selectedFile) {
      Alert.alert('No file', 'Please select a file to upload.')
      return
    }
    setUploading(true)
    try {
      // Get session token
      const { data: sessionData } = await supabase.auth.getSession()
      const token = sessionData.session?.access_token

      // Upload to backend
      const formData = new FormData()
      formData.append('file', {
        uri: selectedFile.uri,
        name: sanitizeFilename(selectedFile.name),
        type: selectedFile.mimeType,
      } as unknown as Blob)
      formData.append('folder', 'frames')

      const uploadRes = await fetch(`${API_URL}/api/upload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({ message: 'Upload failed' }))
        throw new Error(err.message)
      }

      const { url } = await uploadRes.json()

      // Resolve creator
      let creatorId: string | null = null
      if (data.creator_username) {
        const creator = creators.find((c) => c.username === data.creator_username)
        creatorId = creator?.id ?? null
      }

      // Insert frame
      const { data: newFrame, error } = await supabase
        .from('frames')
        .insert({
          title: data.title,
          slug: data.slug,
          description: data.description || null,
          file_url: url,
          category_id: data.category_id || null,
          creator_id: creatorId,
          technique_notes: data.technique_notes || null,
          rank: data.rank,
          tags: selectedTags,
        })
        .select()
        .single()

      if (error) throw error

      // Insert frame_tags
      if (selectedTags.length > 0 && newFrame) {
        const tagRows = tags
          .filter((t) => selectedTags.includes(t.slug))
          .map((t) => ({ frame_id: newFrame.id, tag_id: t.id }))
        if (tagRows.length > 0) {
          await supabase.from('frame_tags').insert(tagRows)
        }
      }

      Alert.alert('Success', 'Frame uploaded successfully!', [
        { text: 'OK', onPress: () => router.push('/admin/content') },
      ])
    } catch (e: unknown) {
      Alert.alert('Upload Failed', (e as Error).message ?? 'Something went wrong.')
    } finally {
      setUploading(false)
    }
  }

  const inputStyle = [styles.input, { color: colors.primary, borderColor: colors.border, backgroundColor: colors.background.paper }]

  return (
    <ScrollView style={styles.container} keyboardShouldPersistTaps="handled">
      {/* File Picker */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.secondary }]}>File * (JPEG, PNG, GIF, WebP, MP4, WebM, MOV — max 50MB)</Text>
        <View style={styles.pickerRow}>
          <TouchableOpacity
            style={[styles.pickerBtn, { borderColor: colors.border, backgroundColor: colors.background.paper }]}
            onPress={pickMedia}
            accessibilityRole="button"
            accessibilityLabel="Pick image or GIF"
          >
            <Text style={[styles.pickerBtnText, { color: colors.primary }]}>🖼 Image / GIF</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.pickerBtn, { borderColor: colors.border, backgroundColor: colors.background.paper }]}
            onPress={pickDocument}
            accessibilityRole="button"
            accessibilityLabel="Pick video"
          >
            <Text style={[styles.pickerBtnText, { color: colors.primary }]}>🎥 Video</Text>
          </TouchableOpacity>
        </View>

        {selectedFile && (
          <View style={[styles.filePreview, { borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.05)' }]}>
            <Text style={[styles.fileName, { color: '#10b981' }]}>✓ {selectedFile.name}</Text>
            <Text style={[styles.fileSize, { color: colors.secondary }]}>
              {fileSizeInMB(selectedFile.size).toFixed(1)} MB
            </Text>
            {selectedFile.mimeType.startsWith('image') && (
              <RNImage
                source={{ uri: selectedFile.uri }}
                style={styles.previewImg}
                resizeMode="cover"
              />
            )}
          </View>
        )}
      </View>

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
              placeholder="Enter frame title"
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
              placeholder="Optional description..."
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
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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

      {/* Creator */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.secondary }]}>Creator Username</Text>
        <Controller
          control={control}
          name="creator_username"
          render={({ field: { value, onChange, onBlur } }) => (
            <TextInput
              style={inputStyle}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              placeholder="e.g. johndoe"
              placeholderTextColor={colors.tertiary}
              autoCapitalize="none"
            />
          )}
        />
      </View>

      {/* Technique Notes */}
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
              placeholder="Optional technique notes..."
              placeholderTextColor={colors.tertiary}
            />
          )}
        />
      </View>

      {/* Rank */}
      <View style={styles.field}>
        <Text style={[styles.label, { color: colors.secondary }]}>Rank (higher = appears first)</Text>
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

      {/* Submit */}
      <TouchableOpacity
        style={[
          styles.submitBtn,
          { backgroundColor: uploading ? colors.secondary : '#3b82f6', opacity: uploading ? 0.7 : 1 },
        ]}
        onPress={handleSubmit(onSubmit)}
        disabled={uploading}
        accessibilityRole="button"
        accessibilityLabel="Upload frame"
      >
        {uploading ? (
          <LoadingSpinner size="small" color="#fff" />
        ) : (
          <Text style={styles.submitText}>Upload Frame</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.lg },
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
  pickerRow: { flexDirection: 'row', gap: Spacing.md },
  pickerBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.md,
    borderStyle: 'dashed',
    padding: Spacing.lg,
    alignItems: 'center',
  },
  pickerBtnText: { fontSize: 14, fontWeight: '500' },
  filePreview: {
    marginTop: Spacing.sm,
    borderWidth: 1,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  fileName: { fontSize: 13, fontWeight: '600' },
  fileSize: { fontSize: 12 },
  previewImg: { width: '100%', height: 160, borderRadius: Radius.sm, marginTop: Spacing.sm },
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
  submitBtn: {
    height: 52,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xxl,
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})
