import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from 'polotno'
import { Toolbar } from 'polotno/toolbar/toolbar'
import { Workspace } from 'polotno/canvas/workspace'
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons'
import { PagesTimeline } from 'polotno/pages-timeline'
import type { StoreType } from 'polotno/model/store'

type Props = {
  store: StoreType
  onHome: () => void
  onEditAsMine: () => void
}

/** โหมดดูอย่างเดียวจากลิงก์แชร์ — ไม่มีแผงข้าง / ไม่มีแถบ export */
export function ShareViewer({ store, onHome, onEditAsMine }: Props) {
  return (
    <div className="share-viewer">
      <header className="share-viewer__bar">
        <p className="share-viewer__badge" role="status">
          โหมดอ่านอย่างเดียว
        </p>
        <div className="share-viewer__actions">
          <button type="button" className="share-viewer__btn share-viewer__btn--ghost" onClick={onHome}>
            ปิด
          </button>
          <button type="button" className="share-viewer__btn share-viewer__btn--primary" onClick={onEditAsMine}>
            แก้ไขเป็นของฉัน
          </button>
        </div>
      </header>

      <PolotnoContainer className="studio-root bp5-dark share-viewer__canvas">
        <SidePanelWrap className="share-viewer__side-spacer" aria-hidden>
          <div className="share-viewer__side-spacer-inner" />
        </SidePanelWrap>
        <WorkspaceWrap>
          <Toolbar store={store} downloadButtonEnabled={false} />
          <Workspace store={store} />
          <ZoomButtons store={store} />
          <PagesTimeline store={store} />
        </WorkspaceWrap>
      </PolotnoContainer>
    </div>
  )
}
