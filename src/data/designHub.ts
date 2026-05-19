export type CategoryIconId =
  | 'social'
  | 'presentation'
  | 'video'
  | 'document'
  | 'print'
  | 'photo'
  | 'marketing'
  | 'for-you'
  | 'business'
  | 'custom'

/** หมวดหลักแบบ Canva — sidebar โมดัล + แถวไอคอนหน้า Home */
export type DesignFormat = {
  id: string
  label: string
  width: number
  height: number
  query: string
}

export type DesignGroup = {
  id: string
  label: string
  iconId: CategoryIconId
  color: string
  query: string
  formats?: DesignFormat[]
}

export const DESIGN_GROUPS: DesignGroup[] = [
  {
    id: 'for-you',
    label: 'สำหรับคุณ',
    iconId: 'for-you',
    color: '#7c5cff',
    query: 'trending social media marketing',
  },
  {
    id: 'presentation',
    label: 'พรีเซนเทชัน',
    iconId: 'presentation',
    color: '#ff6b2c',
    query: 'presentation slide',
    formats: [
      { id: 'pres-16-9', label: '16:9', width: 1920, height: 1080, query: 'presentation' },
      { id: 'pres-4-3', label: '4:3', width: 1024, height: 768, query: 'presentation classic' },
    ],
  },
  {
    id: 'social',
    label: 'โซเชียลมีเดีย',
    iconId: 'social',
    color: '#e1306c',
    query: 'social media',
    formats: [
      { id: 'ig-post', label: 'IG โพสต์', width: 1080, height: 1080, query: 'instagram post' },
      { id: 'ig-story', label: 'IG Story', width: 1080, height: 1920, query: 'instagram story' },
      { id: 'ig-reel', label: 'IG Reels', width: 1080, height: 1920, query: 'instagram reel' },
      { id: 'fb-post', label: 'FB โพสต์', width: 1200, height: 630, query: 'facebook post' },
      { id: 'fb-cover', label: 'FB ปก', width: 851, height: 315, query: 'facebook cover' },
      { id: 'tiktok', label: 'TikTok', width: 1080, height: 1920, query: 'tiktok' },
      { id: 'line', label: 'LINE', width: 1040, height: 1040, query: 'line official' },
    ],
  },
  {
    id: 'photo',
    label: 'ภาพถ่าย',
    iconId: 'photo',
    color: '#f472b6',
    query: 'photo collage poster',
    formats: [
      { id: 'photo-a4', label: 'A4', width: 2480, height: 3508, query: 'photo print a4' },
      { id: 'photo-sq', label: 'สี่เหลี่ยม', width: 1080, height: 1080, query: 'photo square' },
    ],
  },
  {
    id: 'video',
    label: 'วิดีโอ',
    iconId: 'video',
    color: '#ec4899',
    query: 'video thumbnail youtube',
    formats: [
      { id: 'yt-thumb', label: 'YouTube', width: 1280, height: 720, query: 'youtube thumbnail' },
      { id: 'yt-short', label: 'Shorts', width: 1080, height: 1920, query: 'youtube short' },
    ],
  },
  {
    id: 'print',
    label: 'งานพิมพ์',
    iconId: 'print',
    color: '#a855f7',
    query: 'flyer poster print',
    formats: [
      { id: 'flyer-a4', label: 'ใบปลิว A4', width: 2480, height: 3508, query: 'flyer a4' },
      { id: 'poster', label: 'โปสเตอร์', width: 1080, height: 1920, query: 'poster' },
      { id: 'card', label: 'นามบัตร', width: 1050, height: 600, query: 'business card' },
    ],
  },
  {
    id: 'document',
    label: 'เอกสาร',
    iconId: 'document',
    color: '#14b8a6',
    query: 'document report',
    formats: [
      { id: 'doc-a4', label: 'A4', width: 2480, height: 3508, query: 'document a4' },
      { id: 'doc-letter', label: 'Letter', width: 2550, height: 3300, query: 'letter document' },
    ],
  },
  {
    id: 'marketing',
    label: 'การตลาด',
    iconId: 'marketing',
    color: '#f59e0b',
    query: 'marketing promotion sale',
    formats: [
      { id: 'sale', label: 'ลดราคา', width: 1080, height: 1080, query: 'sale promotion' },
      { id: 'ad', label: 'โฆษณา', width: 1080, height: 1080, query: 'advertisement' },
    ],
  },
  {
    id: 'business',
    label: 'ธุรกิจ',
    iconId: 'business',
    color: '#3b82f6',
    query: 'business corporate',
    formats: [
      { id: 'linkedin', label: 'LinkedIn', width: 1200, height: 627, query: 'linkedin post' },
      { id: 'resume', label: 'เรซูเม่', width: 2480, height: 3508, query: 'resume cv' },
    ],
  },
]

/** แถวไอคอนกลมบนหน้า Home */
export const HOME_QUICK_CATEGORIES = [
  { id: 'social' as const, label: 'โซเชียลมีเดีย', iconId: 'social' as const, color: '#fce7f3', iconColor: '#e1306c' },
  { id: 'presentation' as const, label: 'พรีเซนเทชัน', iconId: 'presentation' as const, color: '#ffedd5', iconColor: '#ea580c' },
  { id: 'video' as const, label: 'วิดีโอ', iconId: 'video' as const, color: '#fce7f3', iconColor: '#db2777' },
  { id: 'document' as const, label: 'เอกสาร', iconId: 'document' as const, color: '#ccfbf1', iconColor: '#0d9488' },
  { id: 'print' as const, label: 'งานพิมพ์', iconId: 'print' as const, color: '#f3e8ff', iconColor: '#9333ea' },
  { id: 'photo' as const, label: 'ภาพถ่าย', iconId: 'photo' as const, color: '#fce7f3', iconColor: '#ec4899' },
  { id: 'marketing' as const, label: 'การตลาด', iconId: 'marketing' as const, color: '#fef3c7', iconColor: '#d97706' },
  { id: 'for-you' as const, label: 'สำหรับคุณ', iconId: 'for-you' as const, color: '#ede9fe', iconColor: '#7c5cff' },
]

export function getDesignGroup(id: string): DesignGroup {
  return DESIGN_GROUPS.find((g) => g.id === id) ?? DESIGN_GROUPS[0]
}
