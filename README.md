# Canvame

สตูดิโอตัดต่อรูปบนเว็บ — UI และเครื่องมือแบบ Canva (powered by [Polotno SDK](https://polotno.com/))

## ฟีเจอร์

- Canvas วางรูป ข้อความ รูปทรง SVG
- Crop, ฟิลเตอร์, เอฟเฟกต์, เลเยอร์, หลายหน้า
- Toolbar ดาวน์โหลดมาตรฐาน (Polotno)
- **Export HD** — PNG 1×–4×, JPG HD, PDF 300 DPI
- UI ภาษาไทยบางส่วน

## เริ่มใช้

```bash
npm install
cp .env.example .env   # ใส่ Polotno API key
npm run dev
```

เปิด http://localhost:5173

### Polotno API Key

1. สมัครฟรีที่ https://polotno.com/cabinet/
2. คัดลอก key ใส่ใน `.env`:

```
VITE_POLOTNO_KEY=your_key_here
```

เวอร์ชันทดลองจะมีเครดิต "Powered by Polotno" — ลบได้เมื่อซื้อ license

## สคริปต์

| คำสั่ง | ความหมาย |
|--------|----------|
| `npm run dev` | รัน dev server |
| `npm run build` | build production |
| `npm run preview` | ดู build |

## โครงสร้าง

```
src/
  store.ts              # Polotno store
  components/
    StudioEditor.tsx    # Editor หลัก
    HdExportBar.tsx     # Export ความละเอียดสูง
  i18n-th.ts            # แปล UI
```

## หมายเหตุ

- ต้องใช้ **React 18** (Polotno ยังไม่รองรับ React 19 เต็มรูปแบบ)
- Export 4× ใช้ RAM มาก — บนมือถืออาจช้าหรือล้ม
- ไม่ใช่ Canva ทางการ — เป็น editor ระดับมืออาชีพผ่าน Polotno
