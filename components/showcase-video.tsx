"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { Maximize2, Play, Volume2, VolumeX, X } from "lucide-react"

// Same rainbow palette used by the collection grid so the block feels related
const RAINBOW = "conic-gradient(from 0deg, #ff4d6d, #ffb703, #52e5a3, #38bdf8, #a855f7, #ff4d6d)"

const VIDEO_SRC = "/video/showreel.mp4"
const POSTER_SRC = "/video/showreel-poster.jpg"

/**
 * Showreel block shown after the collections grid.
 *
 * The inline preview always plays (muted + loop, which every browser allows
 * without a gesture). Clicking it opens a full-width stage over a blurred page;
 * because that click is a real user gesture the stage is allowed to start with
 * sound, so only the preview stays muted.
 */
export default function ShowcaseVideo() {
  const [open, setOpen] = useState(false)
  const [muted, setMuted] = useState(false)
  const previewRef = useRef<HTMLVideoElement>(null)
  const stageRef = useRef<HTMLVideoElement>(null)
  const resumeAt = useRef(0)

  const close = useCallback(() => setOpen(false), [])

  // Opening: remember where the preview was, pause it, hand the time over
  useEffect(() => {
    if (!open) return
    const preview = previewRef.current
    resumeAt.current = preview?.currentTime ?? 0
    preview?.pause()

    const stage = stageRef.current
    if (stage) {
      stage.currentTime = resumeAt.current
      void stage.play().catch(() => {})
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close()
    }
    window.addEventListener("keydown", onKeyDown)

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    // Sharing the "lifted" class with LiftCard — it blurs the page roots,
    // which backdrop-filter cannot do for composited (will-change) layers.
    document.body.classList.add("pk-lifted")

    return () => {
      window.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = previousOverflow
      document.body.classList.remove("pk-lifted")

      const back = previewRef.current
      if (back) {
        back.muted = true
        void back.play().catch(() => {})
      }
    }
  }, [open, close])

  // Keep the staged player in sync with the toggle
  useEffect(() => {
    const stage = stageRef.current
    if (stage) stage.muted = muted
  }, [muted])

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl text-primary">Showreel</h2>
          <p className="mt-1 text-sm text-primary-secondary">
            循环播放 · 点击画面可铺满全屏
          </p>
        </div>
        <span className="text-xs text-primary-secondary/70">06:48 · 720p · 静音自动播放</span>
      </div>

      <div className="group relative">
        {/* Soft halo that only shows on hover */}
        <div className="pointer-events-none absolute -inset-3 rounded-[40px] bg-white opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-60" />

        {/* Rainbow glow — kept low so it reads as an edge, not a colour wash */}
        <div
          className="pointer-events-none absolute -inset-2 rounded-[28px] opacity-20 blur-xl saturate-150 transition-opacity duration-500 group-hover:opacity-40"
          style={{ background: RAINBOW }}
        />

        {/* Rotating rainbow border */}
        <div className="relative overflow-hidden rounded-[22px] p-[3px]">
          <div className="pk-rainbow absolute inset-[-60%]" style={{ background: RAINBOW }} />

          <div className="relative overflow-hidden rounded-[19px] bg-black">
            <video
              ref={previewRef}
              src={VIDEO_SRC}
              poster={POSTER_SRC}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              className="aspect-video w-full object-cover transition-transform duration-700 group-hover:scale-[1.02]"
            />

            {/* Vignette so the corner labels stay readable */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

            {/* Center affordance — playback never depends on it */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/45 bg-black/45 text-white shadow-[0_8px_30px_rgba(0,0,0,0.45)] backdrop-blur-sm transition-all duration-500 group-hover:scale-110 group-hover:bg-black/65">
                <Play size={22} className="ml-0.5" fill="currentColor" strokeWidth={0} />
              </span>
            </div>

            <div className="pointer-events-none absolute bottom-4 left-5 flex items-center gap-2 text-white">
              <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11px] backdrop-blur-sm">
                Showreel
              </span>
              <span className="text-[11px] text-white/70">点击铺满全屏</span>
            </div>

            <div className="pointer-events-none absolute top-4 right-5 flex items-center gap-1.5 rounded-full border border-white/25 bg-black/45 px-2.5 py-1.5 text-[11px] text-white backdrop-blur-sm">
              <Maximize2 size={12} />
              全屏
            </div>

            {/* The click target keeps the video element free of interactive nesting */}
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="全屏播放 Showreel"
              className="absolute inset-0 z-20 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Showreel 全屏播放"
            data-pk-overlay=""
            className="pk-fade-in fixed inset-0 z-[100] flex items-center justify-center px-4 py-8"
            onClick={close}
          >
            <div className="absolute inset-0 bg-black/55 backdrop-blur-2xl" />

            <button
              type="button"
              onClick={close}
              aria-label="关闭"
              className="absolute top-5 right-5 z-20 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20"
            >
              <X size={20} />
            </button>

            <div
              className="relative z-10 w-[min(94vw,1280px)]"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="overflow-hidden rounded-2xl border border-white/12 bg-black shadow-[0_40px_120px_-30px_rgba(0,0,0,0.95)]">
                <video
                  ref={stageRef}
                  src={VIDEO_SRC}
                  poster={POSTER_SRC}
                  autoPlay
                  loop
                  playsInline
                  controls
                  className="max-h-[86vh] w-full bg-black object-contain"
                />
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 text-xs text-white/60">
                <button
                  type="button"
                  onClick={() => setMuted((value) => !value)}
                  className="flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1 text-white/80 transition-colors hover:bg-white/10"
                >
                  {muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                  {muted ? "取消静音" : "静音"}
                </button>
                <span className="opacity-40">·</span>
                <span>空白点击或 Esc 关闭</span>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
