export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string
}

export interface Creator {
  id: string
  username: string
  display_name: string
  bio: string | null
  avatar_url: string | null
  website: string | null
  instagram: string | null
  created_at: string
}

export interface Tag {
  id: string
  name: string
  slug: string
}

export interface Frame {
  id: string
  title: string
  slug: string
  description: string | null
  file_url: string
  thumbnail_url: string | null
  category_id: string | null
  creator_id: string | null
  tags: string[]
  technique_notes: string | null
  rank: number
  is_hidden: boolean
  view_count: number
  created_at: string
  category?: Category
  creator?: Creator
  frame_tags?: { tags: Tag }[]
}

export interface AdminUser {
  id: string
  email: string
  role: string
}

export interface PaginatedFrames {
  frames: Frame[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface FrameFilters {
  q?: string
  category?: string
  tag?: string
  creator_id?: string
}

export interface AdminStats {
  totalFrames: number
  totalViews: number
  totalCreators: number
  totalCategories: number
  topFrames: Pick<Frame, 'id' | 'title' | 'slug' | 'view_count'>[]
}
