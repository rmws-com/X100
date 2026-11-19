import { getPhotoStamp } from "@/lib/photo-stamps"
import { cn } from "@/lib/utils"

interface PhotoStampProps {
  /** Image path the stamp is derived from (query string is ignored). */
  src?: string | null
  /** Position/size overrides — callers pass the corner offsets. */
  className?: string
}

/**
 * Translucent black corner label with the capture date and category.
 *
 * A faint white sheet sits behind the text so the label stays readable on both
 * the bright skies and the dark bottom gradients used across the site; the text
 * itself is semi-transparent black in the site's sans-serif face.
 */
export default function PhotoStamp({ src, className }: PhotoStampProps) {
  const { date, category, color } = getPhotoStamp(src)

  return (
    <span
      className={cn(
        "photo-stamp pointer-events-none absolute z-30 inline-flex select-none items-center gap-1.5 rounded-[5px] bg-white/45 px-1.5 py-1 text-[10px] font-medium leading-none tracking-tight text-black/65 backdrop-blur-[2px]",
        className,
      )}
    >
      <span className="tabular-nums">{date}</span>
      <span aria-hidden className="h-2 w-px bg-black/25" />
      <span className="inline-flex items-center gap-1">
        <span
          aria-hidden
          className="h-1 w-1 rounded-full"
          style={{ backgroundColor: color, opacity: 0.8 }}
        />
        {category}
      </span>
    </span>
  )
}
