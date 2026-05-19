import { setDefaultColor } from 'polotno/side-panel/elements-panel'
import { ELEMENT_COLORS } from './components/ElementsColorBar'

/** สีเริ่มต้นเมื่อวางรูปทรง/เส้นจากแผงองค์ประกอบ */
export function setupPolotnoDefaults() {
  setDefaultColor(ELEMENT_COLORS[0])
  document.documentElement.style.setProperty('--marc-element-color', ELEMENT_COLORS[0])
}
