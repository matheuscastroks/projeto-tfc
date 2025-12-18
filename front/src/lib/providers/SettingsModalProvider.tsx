'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

type SettingsSection = 'profile' | 'security' | 'billing' | 'sites' | 'install'

interface SettingsModalContextType {
  open: boolean
  section: SettingsSection
  editingSiteId: string | null
  openModal: (section?: SettingsSection, siteId?: string) => void
  closeModal: () => void
  setSection: (section: SettingsSection) => void
  setEditingSiteId: (siteId: string | null) => void
}

const SettingsModalContext = createContext<
  SettingsModalContextType | undefined
>(undefined)

export function SettingsModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [section, setSection] = useState<SettingsSection>('profile')
  const [editingSiteId, setEditingSiteId] = useState<string | null>(null)

  const openModal = (newSection: SettingsSection = 'profile', siteId?: string) => {
    setSection(newSection)
    if (siteId) {
      setEditingSiteId(siteId)
    }
    setOpen(true)
  }

  const closeModal = () => {
    setOpen(false)
    setEditingSiteId(null)
  }

  return (
    <SettingsModalContext.Provider
      value={{
        open,
        section,
        editingSiteId,
        openModal,
        closeModal,
        setSection,
        setEditingSiteId,
      }}
    >
      {children}
    </SettingsModalContext.Provider>
  )
}

export function useSettingsModal() {
  const context = useContext(SettingsModalContext)
  if (!context) {
    throw new Error(
      'useSettingsModal must be used within SettingsModalProvider'
    )
  }
  return context
}
