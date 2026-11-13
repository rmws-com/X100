"use client"

import Image from "next/image"
import Link from "next/link"
import { createPortal } from "react-dom"
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react"
import { ArrowRight, Move3d, RotateCcw, Sparkles, X } from "lucide-react"

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

/** Starting tilt for the lifted card — just enough to read as 3D. */
const INITIAL_ROTATION = { x: -6, y: 12 }

type Rotation = { x: number; y: number }

export interface LiftCardData {
  /** Image path under /public */
  src: string
  alt: string
  /** Large title printed on the info bar */
  title: string
  /** Secondary line, e.g. credit or collection description */
  subtitle?: string
  /** Small label above the title, e.g. "Featured Collection" */
  meta?: string
  /** Badge text in the top-left corner */
  badge?: string
  /** Optional primary action rendered in the info bar */
  href?: string
  hrefLabel?: string
  /** 1-based position, printed on the back face */
  index?: number
}

/**
 * Renders the light that hits the card. The gradient is re-positioned from the
 * current rotation, so dragging the card moves the highlight across its surface
 * exactly like a physical print turned under a lamp.
 */
function glareStyle(rotation: Rotation) {
  const lightX = clamp(50 - rotation.y * 0.55, -15, 115)
  const lightY = clamp(50 + rotation.x * 0.55, -15, 115)
  return {
    background: `radial-gradient(115% 115% at ${lightX}% ${lightY}%, rgba(255,255,255,0.62) 0%, rgba(255,255,255,0.22) 26%, rgba(255,255,255,0.02) 55%, rgba(255,255,255,0) 72%)`,
  }
}

/** A thin specular streak that slides in the opposite direction. */
function specularStyle(rotation: Rotation) {
  const shift = clamp(-rotation.y * 1.6, -80, 80)
  return {
    background: `linear-gradient(${105 + rotation.y * 0.25}deg, transparent ${28 + shift * 0.1}%, rgba(255,255,255,0.42) ${44 + shift * 0.1}%, transparent ${58 + shift * 0.1}%)`,
  }
}

/**
 * Full-screen overlay that lifts one card above a blurred page. The card can be
 * dragged to rotate freely; its lighting follows the current angle.
 *
 * The page behind is blurred with a `filter` on the page roots (see
 * `body.pk-lifted` in globals.css) rather than a `backdrop-filter` scrim: cards
 * with `will-change: transform` are promoted to their own compositor layer and
 * would otherwise be painted above the scrim.
 */
export default function LiftCard({
  open,
  data,
  onClose,
}: {
  open: boolean
  data: LiftCardData | null
  onClose: () => void
}) {
  const [rotation, setRotation] = useState<Rotation>(INITIAL_ROTATION)
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef({ pointerX: 0, pointerY: 0, ...INITIAL_ROTATION })

  const close = useCallback(() => {
    onClose()
  }, [onClose])

  useEffect(() => {
    if (!open) return
    setRotation(INITIAL_ROTATION)
  }, [open, data?.src])

  // Esc closes, and the page behind must not scroll while the card is lifted
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close()
    }
    window.addEventListener("keydown", onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    document.body.classList.add("pk-lifted")
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = previousOverflow
      document.body.classList.remove("pk-lifted")
    }
  }, [open, close])

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture?.(event.pointerId)
    dragStart.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      x: rotation.x,
      y: rotation.y,
    }
    setDragging(true)
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragging) return
    const dx = event.clientX - dragStart.current.pointerX
    const dy = event.clientY - dragStart.current.pointerY
    setRotation({
      // Vertical tilt is capped so the print never ends up upside down
      x: clamp(dragStart.current.x - dy * 0.3, -72, 72),
      y: dragStart.current.y + dx * 0.4,
    })
  }

  const endDrag = () => setDragging(false)

  if (!open || !data || typeof document === "undefined") return null

  const displayAngle = ((rotation.y % 360) + 360) % 360

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${data.title} 大图`}
      className="pk-fade-in fixed inset-0 z-[100] flex items-center justify-center px-4 py-10"
      data-pk-overlay=""
      onClick={close}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-2xl" />

      {/* Close */}
      <button
        type="button"
        onClick={close}
        aria-label="关闭"
        className="absolute top-5 right-5 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
      >
        <X size={20} />
      </button>

      <div
        className="relative z-10 flex w-[min(92vw,760px)] flex-col items-center"
        onClick={(event) => event.stopPropagation()}
      >
        <div style={{ perspective: "1400px" }} className="w-full">
          <div
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onDoubleClick={() => setRotation(INITIAL_ROTATION)}
            style={{
              transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
              transformStyle: "preserve-3d",
              transition: dragging
                ? "none"
                : "transform 0.55s cubic-bezier(0.2, 0.8, 0.2, 1)",
              touchAction: "none",
              cursor: dragging ? "grabbing" : "grab",
            }}
            className="pk-card-lift relative rounded-3xl"
          >
            {/* Glow behind the print, breathing with the tilt */}
            <div
              className="pointer-events-none absolute -inset-6 rounded-[44px] blur-3xl transition-opacity duration-300"
              style={{
                background:
                  "radial-gradient(60% 60% at 50% 45%, rgba(255,255,255,0.42), rgba(255,255,255,0) 70%)",
                opacity: clamp(
                  0.5 + Math.abs(rotation.y) / 180 + Math.abs(rotation.x) / 220,
                  0.5,
                  1,
                ),
              }}
            />

            <div
              style={{ backfaceVisibility: "hidden" }}
              className="relative overflow-hidden rounded-3xl border border-white/15 bg-neutral-950 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.95)]"
            >
              <div className="relative h-[min(58vh,500px)] w-full bg-black">
                <Image
                  src={data.src}
                  alt={data.alt}
                  fill
                  draggable={false}
                  className="select-none object-contain"
                  sizes="(max-width: 768px) 92vw, 760px"
                  quality={92}
                  priority
                />
              </div>

              {/* Info bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-neutral-950/90 px-5 py-4">
                <div className="min-w-0">
                  {data.meta && (
                    <p className="truncate text-[11px] uppercase tracking-[0.18em] text-white/40">
                      {data.meta}
                    </p>
                  )}
                  <p className="truncate text-sm text-white">{data.title}</p>
                  {data.subtitle && (
                    <p className="truncate text-xs text-white/55">{data.subtitle}</p>
                  )}
                </div>
                {data.href && (
                  <Link
                    href={data.href}
                    className="flex shrink-0 items-center gap-1 rounded-full border border-white/20 px-3 py-1.5 text-xs text-white/85 transition-colors hover:bg-white/10"
                  >
                    {data.hrefLabel ?? "查看合集"}
                    <ArrowRight size={13} />
                  </Link>
                )}
              </div>

              {/* Dynamic light: radial glare + moving specular streak */}
              <div
                className="pointer-events-none absolute inset-0 mix-blend-screen"
                style={glareStyle(rotation)}
              />
              <div
                className="pointer-events-none absolute inset-0 opacity-50 mix-blend-soft-light"
                style={specularStyle(rotation)}
              />
              {/* Edge light on the side facing the lamp */}
              <div
                className="pointer-events-none absolute inset-0 rounded-3xl"
                style={{
                  background:
                    "linear-gradient(140deg, rgba(255,255,255,0.35), rgba(255,255,255,0) 38%)",
                  opacity: clamp(0.25 - rotation.y / 420, 0, 0.45),
                }}
              />
            </div>

            {/* Back face — keeps the card readable when spun past 90° */}
            <div
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl border border-white/15 bg-[radial-gradient(120%_120%_at_20%_0%,#2a2a33_0%,#0b0b0e_55%,#000_100%)] px-6 text-center"
            >
              <div className="flex items-center gap-2 text-white/45">
                <Sparkles size={13} className="text-amber-300/80" />
                <span className="text-[10px] uppercase tracking-[0.32em]">
                  {data.badge ?? "Collection"}
                </span>
              </div>
              <p className="text-lg text-white/90">{data.title}</p>
              {typeof data.index === "number" && (
                <p className="text-xs text-white/40">
                  {`No.${String(data.index).padStart(2, "0")}`}
                </p>
              )}
              <p className="mt-3 max-w-[85%] text-[11px] leading-relaxed text-white/30">
                继续拖动可转回正面
              </p>
            </div>
          </div>
        </div>

        {/* Controls hint */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-white/60">
          <span className="flex items-center gap-1.5">
            <Move3d size={13} /> 拖动旋转
          </span>
          <span className="opacity-40">·</span>
          <span>双击复位</span>
          <span className="opacity-40">·</span>
          <span>Esc 关闭</span>
          <button
            type="button"
            onClick={() => setRotation(INITIAL_ROTATION)}
            className="ml-1 flex items-center gap-1 rounded-full border border-white/15 px-3 py-1 text-white/75 transition-colors hover:bg-white/10"
          >
            <RotateCcw size={12} /> 复位
          </button>
          <span className="tabular-nums text-white/35">
            {`${Math.round(displayAngle)}° / ${Math.round(rotation.x)}°`}
          </span>
        </div>
      </div>
    </div>,
    document.body,
  )
}
