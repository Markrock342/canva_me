import { PolotnoContainer, SidePanelWrap, WorkspaceWrap } from 'polotno'
import { Toolbar } from 'polotno/toolbar/toolbar'
import { PagesTimeline } from 'polotno/pages-timeline'
import { ZoomButtons } from 'polotno/toolbar/zoom-buttons'
import { SidePanel } from 'polotno/side-panel'
import { STUDIO_SECTIONS } from '../sections/templatesSection'
import { Workspace } from 'polotno/canvas/workspace'
import type { StoreType } from 'polotno/model/store'
import { HdExportBar } from './HdExportBar'

export function StudioEditor({
  store,
  onHome,
}: {
  store: StoreType
  onHome?: () => void
}) {
  return (
    <div className="studio-shell">
      <header className="studio-header">
        {onHome && (
          <button type="button" className="studio-header__back" onClick={onHome}>
            ← หน้าหลัก
          </button>
        )}
        <div className="studio-brand">
          <span className="studio-brand__mark" aria-hidden />
          <div>
            <span className="studio-brand__name">marc-canva</span>
            <span className="studio-brand__tag">สตูดิโอตัดต่อรูป</span>
          </div>
        </div>
        <HdExportBar store={store} />
      </header>

      <PolotnoContainer className="studio-root bp5-dark">
        <SidePanelWrap>
          <SidePanel store={store} sections={STUDIO_SECTIONS} defaultSection="templates" />
        </SidePanelWrap>
        <WorkspaceWrap>
          <Toolbar store={store} downloadButtonEnabled />
          <Workspace store={store} />
          <ZoomButtons store={store} />
          <PagesTimeline store={store} />
        </WorkspaceWrap>
      </PolotnoContainer>
    </div>
  )
}
