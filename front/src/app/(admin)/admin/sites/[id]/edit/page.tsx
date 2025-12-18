'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSettingsModal } from '@/lib/providers/SettingsModalProvider'

export default function EditSitePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const router = useRouter()
  const { openModal } = useSettingsModal()
  const [siteId, setSiteId] = useState<string | null>(null)

  useEffect(() => {
    params.then(({ id }) => {
      setSiteId(id)
      openModal('sites', id)
      router.replace('/admin')
    })
  }, [params, openModal, router])

  return null
}
