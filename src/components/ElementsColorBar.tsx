import { useEffect, useState } from 'react'
import { setDefaultColor } from 'polotno/side-panel/elements-panel'

export const ELEMENT_COLORS = [
  '#7c5cff',
  '#2ee6c5',
  '#ff6b9d',
  '#ffc857',
  '#4ecdc4',
  '#45b7d1',
  '#e84a5f',
  '#1a1a24',
] as const

export function ElementsColorBar() {
  const [active, setActive] = useState<string>(ELEMENT_COLORS[0])

  useEffect(() => {
    setDefaultColor(active)
    document.documentElement.style.setProperty('--marc-element-color', active)
  }, [active])

  return (
    <div className="elements-color-bar">
      <p className="elements-color-bar__hint">
        ตัวอย่างในกริดเป็นสีเทา (ปกติของ Polotno) — เลือกสีด้านล่าง รูปทรง/เส้นจะได้สีนี้เมื่อวางบนผืน
      </p>
      <div className="elements-color-bar__swatches" role="list" aria-label="เลือกสีองค์ประกอบ">
        {ELEMENT_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            role="listitem"
            className={`elements-color-bar__swatch${active === color ? ' is-active' : ''}`}
            style={{ background: color }}
            title={color}
            aria-label={`สี ${color}`}
            aria-pressed={active === color}
            onClick={() => setActive(color)}
          />
        ))}
      </div>
    </div>
  )
}
