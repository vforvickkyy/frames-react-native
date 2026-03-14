import React, { useEffect, useState } from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from 'expo-router'
import type { Category, Tag } from '../../types'
import { useTheme } from '../../context/ThemeContext'
import { getCategories, getTags } from '../../lib/queries'
import { supabase } from '../../lib/supabase'
import { slugify } from '../../lib/utils'
import { CategoryForm } from '../../components/admin/CategoryForm'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { Spacing } from '../../constants/theme'

// Tags mini form (inline)
import {
  TextInput,
  ScrollView,
  Alert,
  FlatList,
} from 'react-native'
import { Radius } from '../../constants/theme'

export default function CategoriesScreen() {
  const { colors } = useTheme()
  const navigation = useNavigation()
  const [activeTab, setActiveTab] = useState<'categories' | 'tags'>('categories')
  const [categories, setCategories] = useState<Category[]>([])
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)

  // Tag form state
  const [tagName, setTagName] = useState('')
  const [savingTag, setSavingTag] = useState(false)

  const load = async () => {
    const [cats, tgs] = await Promise.all([getCategories(), getTags()])
    setCategories(cats)
    setTags(tgs)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const handleAddTag = async () => {
    if (!tagName.trim()) return
    setSavingTag(true)
    try {
      const { error } = await supabase.from('tags').insert({
        name: tagName.trim(),
        slug: slugify(tagName.trim()),
      })
      if (error) throw error
      setTagName('')
      load()
    } catch (e: unknown) {
      Alert.alert('Error', (e as Error).message)
    } finally {
      setSavingTag(false)
    }
  }

  const handleDeleteTag = (tag: Tag) => {
    Alert.alert('Delete Tag', `Delete "${tag.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('tags').delete().eq('id', tag.id)
          if (error) Alert.alert('Error', error.message)
          else load()
        },
      },
    ])
  }

  if (loading) return <LoadingSpinner fullScreen />

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background.default }]} edges={['top']}>
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.divider }]}>
        <TouchableOpacity
          onPress={() => (navigation as any).openDrawer()}
          accessibilityRole="button"
          accessibilityLabel="Open menu"
        >
          <Text style={[styles.menuIcon, { color: colors.primary }]}>☰</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.primary }]}>Categories & Tags</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Tabs */}
      <View style={[styles.tabs, { borderBottomColor: colors.divider }]}>
        {(['categories', 'tags'] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.tab,
              activeTab === tab && [styles.activeTab, { borderBottomColor: '#3b82f6' }],
            ]}
            onPress={() => setActiveTab(tab)}
            accessibilityRole="tab"
          >
            <Text
              style={[
                styles.tabText,
                { color: activeTab === tab ? '#3b82f6' : colors.secondary },
              ]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {activeTab === 'categories' ? (
        <ScrollView>
          <CategoryForm categories={categories} onRefresh={load} />
        </ScrollView>
      ) : (
        <ScrollView style={{ padding: Spacing.lg }}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Add Tag</Text>
          <TextInput
            style={[styles.input, { color: colors.primary, borderColor: colors.border, backgroundColor: colors.background.paper }]}
            placeholder="Tag name *"
            placeholderTextColor={colors.tertiary}
            value={tagName}
            onChangeText={setTagName}
          />
          <TouchableOpacity
            style={[styles.addBtn, { backgroundColor: '#3b82f6', opacity: savingTag ? 0.6 : 1 }]}
            onPress={handleAddTag}
            disabled={savingTag}
            accessibilityRole="button"
            accessibilityLabel="Add tag"
          >
            <Text style={styles.addBtnText}>{savingTag ? 'Adding...' : '+ Add Tag'}</Text>
          </TouchableOpacity>

          <Text style={[styles.listTitle, { color: colors.secondary }]}>Tags ({tags.length})</Text>
          {tags.map((tag) => (
            <View
              key={tag.id}
              style={[styles.item, { backgroundColor: colors.background.paper, borderColor: colors.divider }]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[{ fontSize: 15, fontWeight: '500', color: colors.primary }]}>{tag.name}</Text>
                <Text style={[{ fontSize: 12, color: colors.secondary }]}>#{tag.slug}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDeleteTag(tag)}
                accessibilityRole="button"
                accessibilityLabel={`Delete ${tag.name}`}
              >
                <Text style={{ fontSize: 18 }}>🗑️</Text>
              </TouchableOpacity>
            </View>
          ))}
          <View style={{ height: Spacing.xxl }} />
        </ScrollView>
      )}
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  menuIcon: { fontSize: 22 },
  title: { fontSize: 18, fontWeight: '700' },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  tabText: { fontSize: 15, fontWeight: '600' },
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
})
