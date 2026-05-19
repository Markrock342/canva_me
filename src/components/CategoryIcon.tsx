import {
  Briefcase,
  Camera,
  FileText,
  Heart,
  LayoutGrid,
  Megaphone,
  Play,
  Presentation,
  Printer,
  Sparkles,
  Square,
  type LucideIcon,
} from 'lucide-react'
import type { CategoryIconId } from '../data/designHub'

const ICON_MAP: Record<CategoryIconId, LucideIcon> = {
  social: Heart,
  presentation: Presentation,
  video: Play,
  document: FileText,
  print: Printer,
  photo: Camera,
  marketing: Megaphone,
  'for-you': Sparkles,
  business: Briefcase,
  custom: Square,
}

type Props = {
  id: CategoryIconId
  size?: number
  strokeWidth?: number
  className?: string
}

export function CategoryIcon({ id, size = 22, strokeWidth = 2, className }: Props) {
  const Icon = ICON_MAP[id] ?? LayoutGrid
  return <Icon size={size} strokeWidth={strokeWidth} className={className} aria-hidden />
}
