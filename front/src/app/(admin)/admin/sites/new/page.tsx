'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSettingsModal } from '@/lib/providers/SettingsModalProvider'

export default function NewSitePage() {
  const router = useRouter()
  const { openModal } = useSettingsModal()

  useEffect(() => {
    openModal('sites')
    // Redirect to admin page after opening modal
    router.replace('/admin')
  }, [openModal, router])

  return null
}
