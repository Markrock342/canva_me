import { setTranslations } from 'polotno/config'

/** แปล UI หลักเป็นภาษาไทย (merge กับ default ของ Polotno) */
export function applyThaiTranslations() {
  setTranslations(
    {
      toolbar: {
        download: 'ดาวน์โหลด',
        saveAsImage: 'บันทึกเป็นรูป',
        saveAsPDF: 'บันทึกเป็น PDF',
        crop: 'ครอบตัด',
        cropDone: 'เสร็จ',
        cropCancel: 'ยกเลิก',
        filters: 'ฟิลเตอร์',
        effects: 'เอฟเฟกต์',
        position: 'ตำแหน่ง',
        layering: 'เลเยอร์',
        flip: 'พลิก',
        removeBackground: 'ลบพื้นหลัง',
        duplicateElements: 'ทำสำเนา',
        removeElements: 'ลบ',
      },
      sidePanel: {
        templates: 'เทมเพลต',
        text: 'ข้อความ',
        photos: 'รูปภาพ',
        elements: 'องค์ประกอบ',
        draw: 'วาด',
        upload: 'อัปโหลด',
        background: 'พื้นหลัง',
        layers: 'เลเยอร์',
        resize: 'ขนาด',
        searchPlaceholder: 'ค้นหาไอคอน…',
        tables: 'ตาราง',
        lines: 'เส้น',
        shapes: 'รูปทรง',
        searchTemplatesWithSameSize: 'แสดงเทมเพลตขนาดเดียวกับงาน',
        noResults: 'ไม่พบเทมเพลต',
        error: 'โหลดไม่สำเร็จ — ลองใหม่อีกครั้ง',
      },
      workspace: {
        noPages: 'ยังไม่มีหน้า — กดเพิ่มหน้า',
      },
    },
    { validate: false },
  )
}
