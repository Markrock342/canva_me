import { Heart, Home, LayoutTemplate, Search, X, type LucideIcon } from 'lucide-react'

export type NavIconId = 'home' | 'templates' | 'social' | 'search' | 'close'

const ICON_MAP: Record<NavIconId, LucideIcon> = {
  home: Home,
  templates: LayoutTemplate,
  social: Heart,
  search: Search,
  close: X,
}

type Props = {
  id: NavIconId
  size?: number
  strokeWidth?: number
  className?: string
}

export function NavIcon({ id, size = 20, strokeWidth = 2, className }: Props) {
  const Icon = ICON_MAP[id]
  return <Icon size={size} strokeWidth={strokeWidth} className={className} aria-hidden />
}
