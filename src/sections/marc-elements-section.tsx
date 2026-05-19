import { ElementsSection } from 'polotno/side-panel/side-panel'
import { ElementsPanel } from 'polotno/side-panel/elements-panel'
import type { StoreType } from 'polotno/model/store'
import { ElementsColorBar } from '../components/ElementsColorBar'

export const MarcElementsSection = {
  ...ElementsSection,
  Panel: ({ store }: { store: StoreType }) => (
    <div className="marc-elements-panel">
      <ElementsColorBar />
      <div className="marc-elements-panel__body">
        <ElementsPanel store={store} />
      </div>
    </div>
  ),
}
