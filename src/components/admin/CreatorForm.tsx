import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import type { Creator } from '../../types'
import { useTheme } from '../../context/ThemeContext'
import { supabase } from '../../lib/supabase'
import { Avatar } from '../ui/Avatar'
import { Spacing, Radius } from '../../constants/theme'

interface CreatorFormProps {
  creators: Creator[]
  frameCounts: Record<string, number>
  onRefresh: () => void
}

interface CreatorFields {
  username: string
  display_name: string
  bio: string
  website: string
  instagram: string
}

const empty: CreatorFields = {
  username: '',
  display_name: '',
  bio: '',
  website: '',
  instagram: '',
}

export function CreatorForm({ creators, frameCounts, onRefresh }: CreatorFormProps) {
  const { colors } = useTheme()
  const [fields, setFields] = useState<CreatorFields>(empty)
  const [saving, setSaving] = useState(false)
  const [editCreator, setEditCreator] = useState<Creator | null>(null)
  const [editFields, setEditFields] = useState<CreatorFields>(empty)
  const [editModalVisible, setEditModalVisible] = useState(false)

  const update = (key: keyof CreatorFields) => (val: string) =>
    setFields((prev) => ({ ...prev, [key]: val }))

  const handleAdd = async () => {
    if (!fields.username.trim() || !fields.display_name.trim()) {
      Alert.alert('Required', 'Username and display name are required.')
      return
    }
    setSaving(true)
    try {
      const { error } = await supabase.from('creators').insert({
        username: fields.username.trim().toLowerCase(),
        display_name: fields.display_name.trim(),
        bio: fields.bio.trim() || null,
        website: fields.website.trim() || null,
        instagram: fields.instagram.trim() || null,
      })
      if (error) throw error
      setFields(empty)
      onRefresh()
    } catch (e: unknown) {
      Alert.alert('Error', (e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const openEdit = (creator: Creator) => {
    setEditCreator(creator)
    setEditFields({
      username: creator.username,
      display_name: creator.display_name,
      bio: creator.bio ?? '',
      website: creator.website ?? '',
      instagram: creator.instagram ?? '',
    })
    setEditModalVisible(true)
  }

  const handleSaveEdit = async () => {
    if (!editCreator) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('creators')
        .update({
          username: editFields.username.trim().toLowerCase(),
          display_name: editFields.display_name.trim(),
          bio: editFields.bio.trim() || null,
          website: editFields.website.trim() || null,
          instagram: editFields.instagram.trim() || null,
        })
        .eq('id', editCreator.id)
      if (error) throw error
      setEditModalVisible(false)
      onRefresh()
    } catch (e: unknown) {
      Alert.alert('Error', (e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = (creator: Creator) => {
    Alert.alert('Delete Creator', `Delete "${creator.display_name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const { error } = await supabase.from('creators').delete().eq('id', creator.id)
          if (error) Alert.alert('Error', error.message)
          else onRefresh()
        },
      },
    ])
  }

  const inputStyle = [styles.input, { color: colors.primary, borderColor: colors.border, backgroundColor: colors.background.paper }]

  const renderFields = (f: CreatorFields, onChange: (key: keyof CreatorFields) => (v: string) => void) => (
    <>
      <TextInput style={inputStyle} placeholder="Username *" placeholderTextColor={colors.tertiary} value={f.username} onChangeText={onChange('username')} autoCapitalize="none" />
      <TextInput style={[inputStyle, { marginTop: Spacing.sm }]} placeholder="Display Name *" placeholderTextColor={colors.tertiary} value={f.display_name} onChangeText={onChange('display_name')} />
      <TextInput style={[inputStyle, { marginTop: Spacing.sm }]} placeholder="Bio" placeholderTextColor={colors.tertiary} value={f.bio} onChangeText={onChange('bio')} multiline />
      <TextInput style={[inputStyle, { marginTop: Spacing.sm }]} placeholder="Website URL" placeholderTextColor={colors.tertiary} value={f.website} onChangeText={onChange('website')} autoCapitalize="none" keyboardType="url" />
      <TextInput style={[inputStyle, { marginTop: Spacing.sm }]} placeholder="Instagram handle (without @)" placeholderTextColor={colors.tertiary} value={f.instagram} onChangeText={onChange('instagram')} autoCapitalize="none" />
    </>
  )

  return (
    <View style={styles.container}>
      <Text style={[styles.sectionTitle, { color: colors.primary }]}>Add Creator</Text>
      {renderFields(fields, update)}

      <TouchableOpacity
        style={[styles.addBtn, { backgroundColor: '#3b82f6', opacity: saving ? 0.6 : 1 }]}
        onPress={handleAdd}
        disabled={saving}
        accessibilityRole="button"
        accessibilityLabel="Add creator"
      >
        <Text style={styles.addBtnText}>{saving ? 'Adding...' : '+ Add Creator'}</Text>
      </TouchableOpacity>

      <Text style={[styles.listTitle, { color: colors.secondary }]}>
        Creators ({creators.length})
      </Text>

      {creators.map((creator) => (
        <View
          key={creator.id}
          style={[styles.item, { backgroundColor: colors.background.paper, borderColor: colors.divider }]}
        >
          <Avatar uri={creator.avatar_url} name={creator.display_name} size={40} />
          <View style={styles.info}>
            <Text style={[styles.name, { color: colors.primary }]}>{creator.display_name}</Text>
            <Text style={[styles.username, { color: colors.secondary }]}>
              @{creator.username} · {frameCounts[creator.id] ?? 0} frames
            </Text>
          </View>
          <TouchableOpacity onPress={() => openEdit(creator)} style={styles.actionBtn} accessibilityRole="button" accessibilityLabel="Edit creator">
            <Text>✏️</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(creator)} style={styles.actionBtn} accessibilityRole="button" accessibilityLabel="Delete creator">
            <Text>🗑️</Text>
          </TouchableOpacity>
        </View>
      ))}

      {/* Edit Modal */}
      <Modal visible={editModalVisible} animationType="slide" presentationStyle="pageSheet">
        <KeyboardAvoidingView
          style={[styles.modal, { backgroundColor: colors.background.default }]}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={[styles.modalHeader, { borderBottomColor: colors.divider }]}>
            <TouchableOpacity onPress={() => setEditModalVisible(false)} accessibilityRole="button" accessibilityLabel="Cancel">
              <Text style={[styles.cancel, { color: colors.secondary }]}>Cancel</Text>
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: colors.primary }]}>Edit Creator</Text>
            <TouchableOpacity onPress={handleSaveEdit} disabled={saving} accessibilityRole="button" accessibilityLabel="Save">
              <Text style={[styles.save, { opacity: saving ? 0.5 : 1 }]}>{saving ? 'Saving...' : 'Save'}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView style={{ padding: Spacing.lg }} keyboardShouldPersistTaps="handled">
            {renderFields(editFields, (key) => (val) => setEditFields((prev) => ({ ...prev, [key]: val })))}
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
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
    gap: Spacing.md,
  },
  info: { flex: 1 },
  name: { fontSize: 15, fontWeight: '500' },
  username: { fontSize: 12 },
  actionBtn: { padding: Spacing.sm },
  modal: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  modalTitle: { fontSize: 17, fontWeight: '600' },
  cancel: { fontSize: 16 },
  save: { fontSize: 16, fontWeight: '600', color: '#3b82f6' },
})
