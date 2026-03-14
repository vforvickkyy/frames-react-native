import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import * as Linking from 'expo-linking'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTheme } from '../../context/ThemeContext'
import { useRouter } from 'expo-router'
import { Spacing, Radius, Typography } from '../../constants/theme'
import { APP_VERSION } from '../../constants/config'

export default function AboutScreen() {
  const { colors, isDark, toggle } = useTheme()
  const router = useRouter()

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background.default }]} edges={['top']}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🎞️</Text>
          <Text style={[styles.appName, { color: colors.primary }]}>Frames</Text>
          <Text style={[styles.version, { color: colors.secondary }]}>v{APP_VERSION}</Text>
        </View>

        {/* About section */}
        <View style={[styles.card, { backgroundColor: colors.background.paper, borderColor: colors.divider }]}>
          <Text style={[styles.cardTitle, { color: colors.primary }]}>What is Frames?</Text>
          <Text style={[styles.cardBody, { color: colors.secondary }]}>
            Frames is a curated visual reference library for filmmakers, cinematographers,
            and designers. Browse GIFs, images, and video clips organised by category,
            creator, and technique.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.background.paper, borderColor: colors.divider }]}>
          <Text style={[styles.cardTitle, { color: colors.primary }]}>How It Works</Text>
          <Text style={[styles.cardBody, { color: colors.secondary }]}>
            Every frame in our library is carefully selected by our editorial team.
            Browse by category, search for specific techniques, or explore work from
            individual creators. No login required — everything is freely accessible.
          </Text>
        </View>

        <View style={[styles.card, { backgroundColor: colors.background.paper, borderColor: colors.divider }]}>
          <Text style={[styles.cardTitle, { color: colors.primary }]}>Submit Your Work</Text>
          <Text style={[styles.cardBody, { color: colors.secondary }]}>
            Are you a filmmaker or designer with exceptional work to share?
            We're always looking for outstanding visual references.
          </Text>
          <TouchableOpacity
            style={[styles.linkBtn, { borderColor: colors.border }]}
            onPress={() => Linking.openURL('mailto:hello@frames.app')}
            accessibilityRole="link"
            accessibilityLabel="Submit your work via email"
          >
            <Text style={[styles.linkText, { color: colors.primary }]}>📧 Submit your work</Text>
          </TouchableOpacity>
        </View>

        {/* Theme toggle */}
        <View style={[styles.card, { backgroundColor: colors.background.paper, borderColor: colors.divider }]}>
          <Text style={[styles.cardTitle, { color: colors.primary }]}>Appearance</Text>
          <TouchableOpacity
            style={[styles.themeToggle, { borderColor: colors.border }]}
            onPress={toggle}
            accessibilityRole="switch"
            accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <Text style={{ fontSize: 20 }}>{isDark ? '☀️' : '🌙'}</Text>
            <Text style={[styles.themeLabel, { color: colors.primary }]}>
              {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Admin link */}
        <TouchableOpacity
          style={[styles.adminLink, { borderColor: colors.divider }]}
          onPress={() => router.push('/admin/login')}
          accessibilityRole="link"
          accessibilityLabel="Admin login"
        >
          <Text style={[styles.adminLinkText, { color: colors.tertiary }]}>Admin Login</Text>
        </TouchableOpacity>

        <View style={{ height: Spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { flex: 1 },
  header: {
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  logo: { fontSize: 56, marginBottom: Spacing.md },
  appName: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  version: { fontSize: 13, marginTop: 4 },
  card: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: Spacing.sm,
  },
  cardBody: {
    fontSize: 14,
    lineHeight: 22,
  },
  linkBtn: {
    marginTop: Spacing.md,
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    alignSelf: 'flex-start',
  },
  linkText: { fontSize: 14, fontWeight: '500' },
  themeToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: Radius.full,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    alignSelf: 'flex-start',
    gap: Spacing.sm,
  },
  themeLabel: { fontSize: 14, fontWeight: '500' },
  adminLink: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    marginTop: Spacing.md,
    borderTopWidth: 1,
  },
  adminLinkText: { fontSize: 13 },
})
