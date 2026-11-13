"use client"

import Image from "next/image"
import { createPortal } from "react-dom"
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react"
import { ArrowUpRight, Move3d, RotateCcw, Sparkles, X } from "lucide-react"
import { pokemonShots, type PokemonShot } from "@/lib/pokemon"
import { useShutterSound } from "./sound-effects"

// Same rainbow palette as the Featured Photos module so both rails share a look
const RAINBOW =
  "conic-gradient(from 0deg, #ff4d6d, #ffb703, #52e5a3, #38bdf8, #a855f7, #ff4d6d)"

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

/** Starting tilt for the lifted card — just enough to read as 3D. */
const INITIAL_ROTATION = { x: -6, y: 12 }

type Rotation = { x: number; y: number }

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

export default function PokemonGallery() {
  const { playShutterSound } = useShutterSound()
  const [active, setActive] = useState<PokemonShot | null>(null)
  const [rotation, setRotation] = useState<Rotation>(INITIAL_ROTATION)
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef({ pointerX: 0, pointerY: 0, ...INITIAL_ROTATION })

  const close = useCallback(() => setActive(null), [])

  const open = (shot: PokemonShot) => {
    playShutterSound()
    setRotation(INITIAL_ROTATION)
    setActive(shot)
  }

  // Esc closes, and the page behind must not scroll while the card is lifted
  useEffect(() => {
    if (!active) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close()
    }
    window.addEventListener("keydown", onKeyDown)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    // The marquee is promoted to its own compositor layer, so a
    // backdrop-filter scrim alone would be painted beneath it. Blurring the
    // page roots (everything except the overlay) is what actually works.
    document.body.classList.add("pk-lifted")
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = previousOverflow
      document.body.classList.remove("pk-lifted")
    }
  }, [active, close])

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

  if (pokemonShots.length === 0) return null

  const activeIndex = active
    ? pokemonShots.findIndex((shot) => shot.id === active.id)
    : -1
  const displayAngle = ((rotation.y % 360) + 360) % 360

  // Two identical groups keep the loop seamless — the track slides exactly one
  // group width and restarts, so the seam is indistinguishable.
  const groups = [0, 1]

  return (
    <div>
      <div className="pk-viewport relative -mx-4 overflow-hidden px-4 py-12">
        {/* soft fade at both edges so cards dissolve instead of cutting off */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-16 z-40 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-16 z-40 bg-gradient-to-l from-background to-transparent" />

        <div className="pk-track flex w-max">
          {groups.map((group) => (
            <div
              key={group}
              className="flex shrink-0 gap-6 pr-6"
              aria-hidden={group === 1}
            >
              {pokemonShots.map((shot) => (
                <button
                  key={`${group}-${shot.id}`}
                  type="button"
                  onClick={() => open(shot)}
                  tabIndex={group === 1 ? -1 : 0}
                  aria-label={`查看 ${shot.title}（${shot.credit.author} / ${shot.credit.license}）`}
                  className="group relative block w-[240px] shrink-0 origin-center cursor-pointer text-left transition-[transform,box-shadow] duration-500 ease-out hover:z-30 hover:scale-[1.2] hover:shadow-[0_26px_64px_-20px_rgba(0,0,0,0.55)] sm:w-[280px] lg:w-[300px]"
                >
                  {/* Pale white halo that blooms on hover */}
                  <div className="pointer-events-none absolute -inset-4 rounded-[40px] bg-white opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-70" />

                  {/* Outer glow: blurred rainbow halo (recedes while hovered so
                      the white halo reads as the active light) */}
                  <div
                    className="pointer-events-none absolute -inset-3 rounded-[30px] opacity-70 blur-2xl saturate-150 transition-opacity duration-500 group-hover:opacity-35"
                    style={{ background: RAINBOW }}
                  />

                  {/* Rotating rainbow border */}
                  <div className="relative overflow-hidden rounded-2xl p-[3px]">
                    <div
                      className="pk-rainbow absolute inset-[-60%]"
                      style={{ background: RAINBOW }}
                    />
                    <div className="relative overflow-hidden rounded-[13px] bg-black">
                      <div className="relative aspect-square w-full overflow-hidden">
                        <Image
                          src={shot.src}
                          alt={shot.alt}
                          fill
                          className="object-cover transition-transform duration-700 group-hover:scale-105 group-hover:opacity-85"
                          sizes="(max-width: 640px) 240px, (max-width: 1024px) 280px, 300px"
                          quality={85}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />
                        {/* Inner white bloom — reads as light wrapping the print */}
                        <div
                          className="pointer-events-none absolute inset-0 rounded-[13px] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                          style={{
                            boxShadow:
                              "inset 0 0 48px rgba(255,255,255,0.55), inset 0 0 8px rgba(255,255,255,0.45)",
                          }}
                        />
                      </div>

                      {/* Badge */}
                      <div className="absolute top-3 left-3 flex items-center gap-1 rounded-full border border-white/20 bg-black/50 px-2 py-1 backdrop-blur-sm">
                        <Sparkles size={12} className="text-amber-300" />
                        <span className="text-xs text-white">宝可梦</span>
                      </div>

                      {/* Caption */}
                      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between gap-2 p-4">
                        <div className="min-w-0">
                          <p className="truncate text-sm text-white">{shot.title}</p>
                          <p className="truncate text-[11px] text-white/60">
                            {`© ${shot.credit.author} · ${shot.credit.license}`}
                          </p>
                        </div>
                        <Move3d
                          size={16}
                          className="shrink-0 -translate-x-2 text-white opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Crisp white rim highlight on hover */}
                  <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/0 transition-all duration-500 group-hover:ring-white/55" />
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Attribution + trademark notice */}
      <p className="mt-4 text-center text-xs text-primary-secondary/70 leading-relaxed">
        图片来自 Wikimedia Commons，均为 CC0 / 公有领域 / CC BY / CC BY-SA 授权，仅等比缩放至 1400px 供展示，点击图片可查看大图、作者与原始页面。
        <br className="hidden sm:block" />
        宝可梦角色及相关形象版权归 Nintendo / Creatures / GAME FREAK 所有，此处仅作纪实摄影展示。
      </p>

      {/* ---------------------------------------------------------------
          Lifted card overlay: blurred page behind, freely rotatable print
          whose lighting follows the current rotation.
          --------------------------------------------------------------- */}
      {active &&
        typeof document !== "undefined" &&
        createPortal(
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${active.title} 大图`}
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
            className="relative z-10 flex w-[min(92vw,720px)] flex-col items-center"
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
                      1
                    ),
                  }}
                />

                <div
                  style={{ backfaceVisibility: "hidden" }}
                  className="relative overflow-hidden rounded-3xl border border-white/15 bg-neutral-950 shadow-[0_40px_120px_-30px_rgba(0,0,0,0.95)]"
                >
                  <div className="relative h-[min(58vh,500px)] w-full bg-black">
                    <Image
                      src={active.src}
                      alt={active.alt}
                      fill
                      draggable={false}
                      className="select-none object-contain"
                      sizes="(max-width: 768px) 92vw, 720px"
                      quality={92}
                      priority
                    />
                  </div>

                  {/* Info bar */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 bg-neutral-950/90 px-5 py-4">
                    <div className="min-w-0">
                      <p className="truncate text-sm text-white">{active.title}</p>
                      <p className="truncate text-xs text-white/55">
                        {`© ${active.credit.author} · ${active.credit.license}`}
                      </p>
                    </div>
                    <a
                      href={active.credit.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={playShutterSound}
                      className="flex shrink-0 items-center gap-1 rounded-full border border-white/20 px-3 py-1.5 text-xs text-white/85 transition-colors hover:bg-white/10"
                    >
                      原始页面
                      <ArrowUpRight size={13} />
                    </a>
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

                {/* Back face — keeps the print readable when spun past 90° */}
                <div
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                  className="absolute inset-0 flex flex-col items-center justify-center gap-3 overflow-hidden rounded-3xl border border-white/15 bg-[radial-gradient(120%_120%_at_20%_0%,#2a2a33_0%,#0b0b0e_55%,#000_100%)] px-6 text-center"
                >
                  <div className="flex items-center gap-2 text-white/45">
                    <Sparkles size={13} className="text-amber-300/80" />
                    <span className="text-[10px] uppercase tracking-[0.32em]">Pokémon</span>
                  </div>
                  <p className="text-lg text-white/90">{active.title}</p>
                  <p className="text-xs text-white/40">
                    {`No.${String(activeIndex + 1).padStart(2, "0")} · ${active.credit.author}`}
                  </p>
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
          document.body
        )}
    </div>
  )
}
