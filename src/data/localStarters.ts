import type { CatalogTemplateItem } from '../types/catalogTemplate'

function svgPreview(w: number, h: number, bg: string, label: string, sub?: string) {
  const subLine = sub
    ? `<text x="50%" y="58%" fill="rgba(255,255,255,0.85)" font-size="${Math.round(w * 0.035)}" text-anchor="middle" font-family="system-ui,sans-serif">${sub}</text>`
    : ''
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="${Math.round((300 * h) / w)}" viewBox="0 0 ${w} ${h}"><rect width="100%" height="100%" fill="${bg}"/><text x="50%" y="48%" fill="#fff" font-size="${Math.round(w * 0.07)}" font-weight="600" text-anchor="middle" font-family="system-ui,sans-serif">${label}</text>${subLine}</svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

function starterDesign(
  width: number,
  height: number,
  background: string,
  headline: string,
  subline?: string,
) {
  const headlineSize = Math.round(Math.min(width, height) * 0.09)
  const subSize = Math.round(headlineSize * 0.45)
  const children: Record<string, unknown>[] = [
    {
      id: 'headline',
      type: 'text',
      x: width * 0.08,
      y: height * 0.38,
      rotation: 0,
      opacity: 1,
      locked: false,
      blurEnabled: false,
      blurRadius: 10,
      brightnessEnabled: false,
      brightness: 0,
      sepiaEnabled: false,
      grayscaleEnabled: false,
      shadowEnabled: false,
      shadowBlur: 5,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowColor: 'black',
      text: headline,
      placeholder: '',
      fontSize: headlineSize,
      fontFamily: 'Roboto',
      fontStyle: 'normal',
      fontWeight: 'bold',
      textDecoration: '',
      fill: 'rgba(255,255,255,1)',
      align: 'center',
      width: width * 0.84,
      height: headlineSize * 2.2,
      strokeWidth: 0,
      stroke: 'black',
      lineHeight: 1.15,
      letterSpacing: 0,
    },
  ]
  if (subline) {
    children.push({
      id: 'subline',
      type: 'text',
      x: width * 0.1,
      y: height * 0.55,
      rotation: 0,
      opacity: 1,
      locked: false,
      blurEnabled: false,
      blurRadius: 10,
      brightnessEnabled: false,
      brightness: 0,
      sepiaEnabled: false,
      grayscaleEnabled: false,
      shadowEnabled: false,
      shadowBlur: 5,
      shadowOffsetX: 0,
      shadowOffsetY: 0,
      shadowColor: 'black',
      text: subline,
      placeholder: '',
      fontSize: subSize,
      fontFamily: 'Roboto',
      fontStyle: 'normal',
      fontWeight: 'normal',
      textDecoration: '',
      fill: 'rgba(255,255,255,0.92)',
      align: 'center',
      width: width * 0.8,
      height: subSize * 2,
      strokeWidth: 0,
      stroke: 'black',
      lineHeight: 1.2,
      letterSpacing: 0,
    })
  }
  return {
    width,
    height,
    fonts: [],
    pages: [
      {
        id: 'page-1',
        width,
        height,
        background,
        children,
      },
    ],
  }
}

type StarterDef = {
  id: string
  title: string
  width: number
  height: number
  bg: string
  headline: string
  sub?: string
}

const STARTERS: StarterDef[] = [
  { id: 'ig-post', title: 'IG โพสต์', width: 1080, height: 1080, bg: '#7c3aed', headline: 'หัวข้อของคุณ', sub: 'แก้ข้อความได้เลย' },
  { id: 'ig-story', title: 'IG Story', width: 1080, height: 1920, bg: '#db2777', headline: 'สตอรี่วันนี้', sub: 'ปัดขึ้นเพื่อดูเพิ่ม' },
  { id: 'fb-cover', title: 'FB ปก', width: 851, height: 315, bg: '#2563eb', headline: 'ชื่อเพจ / แบรนด์', sub: 'คำโปรยสั้นๆ' },
  { id: 'yt-thumb', title: 'YouTube', width: 1280, height: 720, bg: '#dc2626', headline: 'ชื่อวิดีโอ', sub: 'คลิกเพื่อดู' },
  { id: 'sale', title: 'ลดราคา', width: 1080, height: 1080, bg: '#ea580c', headline: 'SALE 50%', sub: 'วันนี้ – สิ้นเดือน' },
  { id: 'menu', title: 'เมนูร้าน', width: 1080, height: 1350, bg: '#15803d', headline: 'เมนูแนะนำ', sub: 'ราคาเริ่มต้น 99.-' },
  { id: 'event', title: 'อีเวนต์', width: 1080, height: 1080, bg: '#0891b2', headline: 'งานเปิดตัว', sub: 'วันที่ · สถานที่' },
  { id: 'minimal', title: 'มินิมอล', width: 1080, height: 1080, bg: '#1f2937', headline: 'Less is more', sub: 'marc-canva' },
  { id: 'presentation', title: 'สไลด์', width: 1920, height: 1080, bg: '#4f46e5', headline: 'พรีเซนเทชัน', sub: 'หัวข้อย่อย' },
  { id: 'a4-flyer', title: 'ใบปลิว A4', width: 2480, height: 3508, bg: '#b45309', headline: 'โปรโมชันพิเศษ', sub: 'รายละเอียดด้านล่าง' },
]

export const LOCAL_STARTER_TEMPLATES: CatalogTemplateItem[] = STARTERS.map((s) => ({
  provider: 'marc-canva',
  providerLabel: 'marc-canva',
  title: s.title,
  preview: svgPreview(s.width, s.height, s.bg, s.headline, s.sub),
  width: s.width,
  height: s.height,
  inlineDesign: starterDesign(s.width, s.height, s.bg, s.headline, s.sub),
}))
