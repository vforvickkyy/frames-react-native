import React, { useEffect, useState, useCallback } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useNavigation } from 'expo-router'
import type { Frame } from '../../types'
import { useTheme } from '../../context/ThemeContext'
import { getAllFrames } from '../../lib/queries'
import { supabase } from '../../lib/supabase'
import { FrameListItem } from '../../components/admin/FrameListItem'
import { EditFrameModal } from '../../components/admin/EditFrameModal'
import { LoadingSpinner } from '../../components/ui/LoadingSpinner'
import { EmptyState } from '../../components/ui/EmptyState'
import { Spacing } from '../../constants/theme'

export default function ContentScreen() {
  const { colors } = useTheme()
  const navigation = useNavigation()
  const [frames, setFrames] = useState<Frame[]>([])
  const [filtered, setFiltered] = useState<Frame[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [editFrame, setEditFrame] = useState<Frame | null>(null)
  const [editModalVisible, setEditModalVisible] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAllFrames()
      setFrames(data)
      setFiltered(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [])

  useEffect(() => {
    if (!search.trim()) {
      setFiltered(frames)
    } else {
      const q = search.toLowerCase()
      setFiltered(frames.filter((f) => f.title.toLowerCase().includes(q) || f.slug.toLowerCase().includes(q)))
    }
  }, [search, frames])

  const handleEdit = (frame: Frame) => {
    setEditFrame(frame)
    setEditModalVisible(true)
  }

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('frames').delete().eq('id', id)
    if (error) {
      Alert.alert('Error', error.message)
    } else {
      setFrames((prev) => prev.filter((f) => f.id !== id))
    }
  }

  const handleToggleVisibility = async (frame: Frame) => {
    const { error } = await supabase
      .from('frames')
      .update({ is_hidden: !frame.is_hidden })
      .eq('id', frame.id)
    if (!error) {
      setFrames((prev) =>
        prev.map((f) => (f.id === frame.id ? { ...f, is_hidden: !f.is_hidden } : f))
      )
    }
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
        <Text style={[styles.title, { color: colors.primary }]}>Content ({frames.length})</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search */}
      <View style={[styles.searchBar, { borderBottomColor: colors.divider }]}>
        <TextInput
          style={[styles.searchInput, { color: colors.primary, backgroundColor: colors.background.paper, borderColor: colors.border }]}
          placeholder="Search by title or slug..."
          placeholderTextColor={colors.tertiary}
          value={search}
          onChangeText={setSearch}
          accessibilityLabel="Search frames"
        />
      </View>

      {filtered.length === 0 ? (
        <EmptyState title="No frames" message="No frames match your search." />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <FrameListItem
              frame={item}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggleVisibility={handleToggleVisibility}
            />
          )}
          showsVerticalScrollIndicator={false}
        />
      )}

      <EditFrameModal
        visible={editModalVisible}
        frame={editFrame}
        onClose={() => setEditModalVisible(false)}
        onSaved={load}
      />
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
  searchBar: {
    padding: Spacing.md,
    borderBottomWidth: 1,
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 15,
  },
})
