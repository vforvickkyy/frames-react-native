import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
} from 'react-native'
import type { Category } from '../../types'
import { useTheme } from '../../context/ThemeContext'
import { supabase } from '../../lib/supabase'
import { slugify } from '../../lib/utils'
import { Spacing, Radius } from '../../constants/theme'

interface CategoryFormProps {
  categories: Category[]
  onRefresh: () => void
}

export function CategoryForm({ categories, onRefresh }: CategoryFormProps) {
  const { colors } = useTheme()
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)

  const handleAdd = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      const { error } = await supabase.from('categories').insert({
        name: name.trim(),
        slug: slugify(name.trim()),
        description: description.trim() || null,
      })
      if (error) throw error
      setName('')
      setDescription('')
      onRefresh()
    } catch (e: unknown) {
      Alert.alert('Error', (e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, catName: string) => {
    Alert.alert('Delete Category', `Delete "${catName}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('categories').delete().eq('id', id)
          if (error) {
            Alert.alert('Error', error.message)
          } else {
            onRefresh()
          }
        },
      },
    ])
  }

  const inputStyle = [styles.input, { color: colors.primary, borderColor: colors.border, backgroundColor: colors.background.paper }]

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.primary }]}>Add Category</Text>

      <TextInput
        style={inputStyle}
        placeholder="Category name *"
        placeholderTextColor={colors.tertiary}
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={[inputStyle, { marginTop: Spacing.sm }]}
        placeholder="Description (optional)"
        placeholderTextColor={colors.tertiary}
        value={description}
        onChangeText={setDescription}
      />

      <TouchableOpacity
        style={[styles.addBtn, { backgroundColor: '#3b82f6', opacity: saving ? 0.6 : 1 }]}
        onPress={handleAdd}
        disabled={saving}
        accessibilityRole="button"
        accessibilityLabel="Add category"
      >
        <Text style={styles.addBtnText}>{saving ? 'Adding...' : '+ Add Category'}</Text>
      </TouchableOpacity>

      <Text style={[styles.listTitle, { color: colors.secondary }]}>
        Existing Categories ({categories.length})
      </Text>

      {categories.map((cat) => (
        <View
          key={cat.id}
          style={[styles.item, { backgroundColor: colors.background.paper, borderColor: colors.divider }]}
        >
          <View style={styles.itemInfo}>
            <Text style={[styles.itemName, { color: colors.primary }]}>{cat.name}</Text>
            <Text style={[styles.itemSlug, { color: colors.secondary }]}>/{cat.slug}</Text>
          </View>
          <TouchableOpacity
            onPress={() => handleDelete(cat.id, cat.name)}
            style={styles.deleteBtn}
            accessibilityRole="button"
            accessibilityLabel={`Delete ${cat.name}`}
          >
            <Text style={styles.deleteBtnText}>🗑️</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: Spacing.lg },
  sectionTitle: { fontSize: 17, fontWeight: '600', marginBottom: Spacing.md },
  input: {
    borderWidth: 1,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 15,
  },
  addBtn: {
    marginTop: Spacing.md,
    height: 44,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xl,
  },
  addBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  listTitle: { fontSize: 13, fontWeight: '500', marginBottom: Spacing.sm },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: Radius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 15, fontWeight: '500' },
  itemSlug: { fontSize: 12 },
  deleteBtn: { padding: Spacing.sm },
  deleteBtnText: { fontSize: 18 },
})
