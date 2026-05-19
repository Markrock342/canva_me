import { createStore } from 'polotno/model/store'

const key = import.meta.env.VITE_POLOTNO_KEY ?? ''

export const polotnoKey = key

export const store = createStore({
  key,
  showCredit: false,
})

store.addPage()

// ขนาดเริ่มต้น IG Post
store.setSize(1080, 1080)
