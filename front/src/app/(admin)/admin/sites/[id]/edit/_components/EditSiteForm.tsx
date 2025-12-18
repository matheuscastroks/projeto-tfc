'use client'

import { useRouter } from 'next/navigation'
import * as React from 'react'
import { Input } from '@ui/input'
import { Button } from '@ui/button'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@ui/select'
import { Alert, AlertDescription } from '@ui/alert'
import { Building2, Activity } from 'lucide-react'
import Link from 'next/link'
import { Spinner } from '@ui/spinner'
import { useUpdateSite } from '@/lib/hooks'

export function EditSiteForm({
  site,
}: {
  site: { id: string; name: string; status: 'active' | 'inactive' }
}) {
  const router = useRouter()
  const updateSiteMutation = useUpdateSite()
  const [status, setStatus] = React.useState<'active' | 'inactive'>(site.status)

  async function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const fd = new FormData(e.currentTarget)
    const name = fd.get('name') as string

    try {
      await updateSiteMutation.mutateAsync({
        siteId: site.id,
        data: { name, status },
      })
      router.push('/admin/insights')
    } catch (error) {
      console.error('Failed to update site:', error)
    }
  }
  return (
    <form className="space-y-4 sm:space-y-5 md:space-y-6" onSubmit={onSave}>
      <div className="space-y-4 sm:space-y-5">
        <div className="space-y-1.5 sm:space-y-2">
          <label
            htmlFor="site-name"
            className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2"
          >
            <Building2 className="h-3.5 w-3.5" />
            Nome do Site
          </label>
          <Input
            id="site-name"
            name="name"
            defaultValue={site.name}
            placeholder="Nome do site"
            required
          />
        </div>
        <div className="space-y-1.5 sm:space-y-2">
          <label
            htmlFor="site-status"
            className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-2"
          >
            <Activity className="h-3.5 w-3.5" />
            Status
          </label>
          <Select
            value={status}
            onValueChange={(v) => setStatus(v as 'active' | 'inactive')}
          >
            <SelectTrigger id="site-status">
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="inactive">Inativo</SelectItem>
            </SelectContent>
          </Select>
          <input type="hidden" name="status" value={status} />
        </div>
      </div>

      {updateSiteMutation.isError && (
        <div className="text-xs text-center text-destructive bg-destructive/10 border border-destructive/20 rounded-lg py-2 px-3 sm:px-4">
          {updateSiteMutation.error instanceof Error
            ? updateSiteMutation.error.message
            : 'Falha ao atualizar site'}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-1">
        <p className="text-[10px] sm:text-xs text-muted-foreground/70 max-w-xs">
          As alterações serão aplicadas imediatamente após salvar.
        </p>

        <div className="flex items-center gap-3">
          <Button
            type="submit"
            variant="primary-rounded"
            size="lg-rounded"
            disabled={updateSiteMutation.isPending}
            className="sm:w-auto w-full"
          >
            {updateSiteMutation.isPending ? (
              <>
                <Spinner className="w-4 h-4 animate-spin" />
                <span>Salvando...</span>
              </>
            ) : (
              <span>Salvar Alterações</span>
            )}
          </Button>
          <Button
            variant="outline-rounded"
            size="lg-rounded"
            className="sm:w-auto w-full"
            onClick={() => router.push('/admin/insights')}
          >
            Cancelar
          </Button>
        </div>
      </div>
    </form>
  )
}
