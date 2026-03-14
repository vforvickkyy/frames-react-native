import { supabase } from './supabase'
import type {
  Frame,
  Category,
  Creator,
  Tag,
  PaginatedFrames,
  FrameFilters,
  AdminStats,
} from '../types'

export const PAGE_SIZE = 24

// ─── Frame Queries ─────────────────────────────────────────────────────────────

export async function getFrames(
  page: number = 1,
  filters?: FrameFilters
): Promise<PaginatedFrames> {
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('frames')
    .select(
      `*, category:categories(*), creator:creators(*), frame_tags(tags(*))`,
      { count: 'exact' }
    )
    .eq('is_hidden', false)
    .order('rank', { ascending: false })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (filters?.q) {
    query = query.textSearch('fts', filters.q, { type: 'websearch' })
  }
  if (filters?.category) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', filters.category)
      .single()
    if (cat) query = query.eq('category_id', cat.id)
  }
  if (filters?.tag) {
    query = query.contains('tags', [filters.tag])
  }
  if (filters?.creator_id) {
    query = query.eq('creator_id', filters.creator_id)
  }

  const { data, error, count } = await query

  if (error) throw error

  const total = count ?? 0
  return {
    frames: (data as Frame[]) ?? [],
    total,
    page,
    pageSize: PAGE_SIZE,
    hasMore: from + PAGE_SIZE < total,
  }
}

export async function getFrameBySlug(slug: string): Promise<Frame | null> {
  const { data, error } = await supabase
    .from('frames')
    .select(`*, category:categories(*), creator:creators(*), frame_tags(tags(*))`)
    .eq('slug', slug)
    .single()

  if (error) return null
  return data as Frame
}

export async function getRelatedFrames(
  frameId: string,
  categoryId: string | null,
  limit = 6
): Promise<Frame[]> {
  let query = supabase
    .from('frames')
    .select(`*, category:categories(*), creator:creators(*)`)
    .eq('is_hidden', false)
    .neq('id', frameId)
    .order('rank', { ascending: false })
    .order('view_count', { ascending: false })
    .limit(limit)

  if (categoryId) {
    query = query.eq('category_id', categoryId)
  }

  const { data, error } = await query
  if (error) return []
  return (data as Frame[]) ?? []
}

export async function getTrendingFrames(limit = 12): Promise<Frame[]> {
  const { data, error } = await supabase
    .from('frames')
    .select(`*, category:categories(*), creator:creators(*)`)
    .eq('is_hidden', false)
    .order('view_count', { ascending: false })
    .limit(limit)

  if (error) return []
  return (data as Frame[]) ?? []
}

export async function getRecentFrames(limit = 12): Promise<Frame[]> {
  const { data, error } = await supabase
    .from('frames')
    .select(`*, category:categories(*), creator:creators(*)`)
    .eq('is_hidden', false)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return []
  return (data as Frame[]) ?? []
}

export async function incrementViewCount(frameId: string): Promise<void> {
  await supabase.rpc('increment_view_count', { frame_id: frameId })
}

export async function checkSlugUnique(slug: string, excludeId?: string): Promise<boolean> {
  let query = supabase.from('frames').select('id').eq('slug', slug)
  if (excludeId) query = query.neq('id', excludeId)
  const { data } = await query
  return !data || data.length === 0
}

// ─── Category Queries ──────────────────────────────────────────────────────────

export async function getCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) return []
  return (data as Category[]) ?? []
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) return null
  return data as Category
}

// ─── Creator Queries ──────────────────────────────────────────────────────────

export async function getCreatorByUsername(username: string): Promise<Creator | null> {
  const { data, error } = await supabase
    .from('creators')
    .select('*')
    .eq('username', username)
    .single()

  if (error) return null
  return data as Creator
}

export async function getCreatorFrames(
  creatorId: string,
  page: number = 1
): Promise<PaginatedFrames> {
  return getFrames(page, { creator_id: creatorId })
}

// ─── Tag Queries ──────────────────────────────────────────────────────────────

export async function getTags(): Promise<Tag[]> {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name', { ascending: true })

  if (error) return []
  return (data as Tag[]) ?? []
}

// ─── Admin Queries ─────────────────────────────────────────────────────────────

export async function isAdminUser(email: string): Promise<boolean> {
  const { data } = await supabase
    .from('admin_users')
    .select('role')
    .eq('email', email)
    .single()
  return data?.role === 'admin'
}

export async function getAdminStats(): Promise<AdminStats> {
  const [framesRes, creatorsRes, categoriesRes, topRes] = await Promise.all([
    supabase.from('frames').select('view_count', { count: 'exact' }),
    supabase.from('creators').select('id', { count: 'exact' }),
    supabase.from('categories').select('id', { count: 'exact' }),
    supabase
      .from('frames')
      .select('id, title, slug, view_count')
      .order('view_count', { ascending: false })
      .limit(5),
  ])

  const totalViews = (framesRes.data ?? []).reduce(
    (sum: number, f: { view_count: number }) => sum + (f.view_count ?? 0),
    0
  )

  return {
    totalFrames: framesRes.count ?? 0,
    totalViews,
    totalCreators: creatorsRes.count ?? 0,
    totalCategories: categoriesRes.count ?? 0,
    topFrames: (topRes.data ?? []) as Pick<Frame, 'id' | 'title' | 'slug' | 'view_count'>[],
  }
}

export async function getAllFrames(): Promise<Frame[]> {
  const { data, error } = await supabase
    .from('frames')
    .select(`*, category:categories(*), creator:creators(*)`)
    .order('rank', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) return []
  return (data as Frame[]) ?? []
}

export async function getAllCreators(): Promise<Creator[]> {
  const { data, error } = await supabase
    .from('creators')
    .select('*')
    .order('display_name', { ascending: true })
  if (error) return []
  return (data as Creator[]) ?? []
}

export async function getCreatorFrameCount(creatorId: string): Promise<number> {
  const { count } = await supabase
    .from('frames')
    .select('id', { count: 'exact', head: true })
    .eq('creator_id', creatorId)
  return count ?? 0
}
