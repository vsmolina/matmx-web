'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { FilePlus, FileText, Loader2, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  quoteId: number
}

export default function GenerateOrViewPDFButton({ quoteId }: Props) {
  const [hasPDF, setHasPDF] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkPDFExists()
  }, [quoteId])

  async function checkPDFExists() {
    try {
      const res = await fetch(`http://localhost:4000/api/email/quote/${quoteId}/pdf`, { method: 'HEAD', credentials: 'include' })
      setHasPDF(res.ok)
    } catch {
      setHasPDF(false)
    }
  }

  async function handleGenerate() {
    setLoading(true)
    try {
      const res = await fetch(`http://localhost:4000/api/sales/quotes/${quoteId}/generate-pdf`, {
        method: 'POST',
        credentials: 'include'
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('PDF generated')
      setHasPDF(true)
    } catch (err) {
      toast.error('Could not generate PDF')
    } finally {
      setLoading(false)
    }
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {hasPDF ? (
            <a
              href={`http://localhost:4000/api/email/quote/${quoteId}/pdf`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button size="icon" variant="ghost">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          ) : (
            <Button
              size="icon"
              variant="ghost"
              onClick={handleGenerate}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <FilePlus className="h-4 w-4" />}
            </Button>
          )}
        </TooltipTrigger>
        <TooltipContent>
          <p>{hasPDF ? 'View PDF' : 'Generate PDF'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
