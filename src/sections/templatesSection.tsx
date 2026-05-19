import {
  TemplatesSection,
  TextSection,
  PhotosSection,
  DrawSection,
  UploadSection,
  BackgroundSection,
  LayersSection,
  SizeSection,
  type Section,
} from 'polotno/side-panel'
import type { StoreType } from 'polotno/model/store'
import { CanvameTemplatesPanel } from '../components/CanvameTemplatesPanel'
import { MarcElementsSection } from './marc-elements-section'

export const CanvameTemplatesSection: Section = {
  ...TemplatesSection,
  Panel: ({ store }: { store: StoreType }) => (
    <CanvameTemplatesPanel store={store} />
  ),
}

export const STUDIO_SECTIONS: Section[] = [
  CanvameTemplatesSection,
  TextSection,
  PhotosSection,
  MarcElementsSection,
  DrawSection,
  UploadSection,
  BackgroundSection,
  LayersSection,
  SizeSection,
]
