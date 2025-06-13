'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format } from 'date-fns'
import {
  MessageCircle,
  PhoneCall,
  Mail,
  Users
} from 'lucide-react'

type LogType = 'call' | 'email' | 'meeting' | 'note'

const iconByType: Record<LogType, React.ReactElement> = {
  call: <PhoneCall className="w-4 h-4 text-blue-500" />,
  email: <Mail className="w-4 h-4 text-green-600" />,
  meeting: <Users className="w-4 h-4 text-purple-600" />,
  note: <MessageCircle className="w-4 h-4 text-muted-foreground" />
}

export default function ViewLogDialog({
  customer,
  open,
  onOpenChange,
  logs,
  loading
}: {
  customer: any,
  open: boolean,
  onOpenChange: (open: boolean) => void,
  logs: any[],
  loading: boolean
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Interaction History for {customer.name}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-muted-foreground">Loading logs...</p>
        ) : logs.length === 0 ? (
          <p className="text-sm text-muted-foreground">No logs found.</p>
        ) : (
          <ScrollArea className="max-h-[60vh] pr-2">
            <ul className="space-y-4">
              {logs.map((log: any) => (
                <li key={log.id} className="flex gap-2 items-start">
                  <div className="mt-1">
                    {iconByType[log.type as LogType] ?? (
                      <MessageCircle className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      <span className="capitalize">{log.type}</span> by{' '}
                      <strong>{log.created_by}</strong> &middot;{' '}
                      {format(new Date(log.created_at), 'PPP p')}
                    </p>
                    <p className="text-sm">{log.note || '—'}</p>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  )
}
