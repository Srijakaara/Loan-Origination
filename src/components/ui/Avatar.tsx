import { cn } from '@/lib/utils'

export function Avatar({ initials, className }: { initials: string; className?: string }) {
  return (
    <div
      className={cn(
        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy-800 text-xs font-semibold text-white',
        className,
      )}
    >
      {initials}
    </div>
  )
}
