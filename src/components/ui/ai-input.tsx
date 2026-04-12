"use client"

import React from "react"
import { cx } from "class-variance-authority"
import { AnimatePresence, motion } from "motion/react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface OrbProps {
  dimension?: string
  className?: string
  tones?: {
    base?: string
    accent1?: string
    accent2?: string
    accent3?: string
  }
  spinDuration?: number
}

const ColorOrb: React.FC<OrbProps> = ({
  dimension = "192px",
  className,
  tones,
  spinDuration = 20,
}) => {
  const fallbackTones = {
    base: "oklch(95% 0.02 264.695)",
    accent1: "oklch(75% 0.15 350)",
    accent2: "oklch(80% 0.12 200)",
    accent3: "oklch(78% 0.14 280)",
  }

  const palette = { ...fallbackTones, ...tones }

  const dimValue = parseInt(dimension.replace("px", ""), 10)

  const blurStrength =
    dimValue < 50 ? Math.max(dimValue * 0.008, 1) : Math.max(dimValue * 0.015, 4)

  const contrastStrength =
    dimValue < 50 ? Math.max(dimValue * 0.004, 1.2) : Math.max(dimValue * 0.008, 1.5)

  const pixelDot =
    dimValue < 50 ? Math.max(dimValue * 0.004, 0.05) : Math.max(dimValue * 0.008, 0.1)

  const shadowRange =
    dimValue < 50 ? Math.max(dimValue * 0.004, 0.5) : Math.max(dimValue * 0.008, 2)

  const maskRadius =
    dimValue < 30 ? "0%" : dimValue < 50 ? "5%" : dimValue < 100 ? "15%" : "25%"

  const adjustedContrast =
    dimValue < 30
      ? 1.1
      : dimValue < 50
        ? Math.max(contrastStrength * 1.2, 1.3)
        : contrastStrength

  return (
    <div className={cn("relative", className)}>
      <style>{`
        @property --angle {
          syntax: "<angle>";
          inherits: false;
          initial-value: 0deg;
        }

        .color-orb {
          display: grid;
          grid-template-areas: "stack";
          overflow: hidden;
          border-radius: 50%;
          position: relative;
          transform: scale(1.1);
        }

        .color-orb::before,
        .color-orb::after {
          content: "";
          display: block;
          grid-area: stack;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          transform: translateZ(0);
        }

        .color-orb::before {
          background:
            conic-gradient(from calc(var(--angle) * 2) at 25% 70%, var(--accent3), transparent 20% 80%, var(--accent3)),
            conic-gradient(from calc(var(--angle) * 2) at 45% 75%, var(--accent2), transparent 30% 60%, var(--accent2)),
            conic-gradient(from calc(var(--angle) * -3) at 80% 20%, var(--accent1), transparent 40% 60%, var(--accent1)),
            conic-gradient(from calc(var(--angle) * 2) at 15% 5%, var(--accent2), transparent 10% 90%, var(--accent2)),
            conic-gradient(from calc(var(--angle) * 1) at 20% 80%, var(--accent1), transparent 10% 90%, var(--accent1)),
            conic-gradient(from calc(var(--angle) * -2) at 85% 10%, var(--accent3), transparent 20% 80%, var(--accent3));
          box-shadow: inset var(--base) 0 0 var(--shadow) calc(var(--shadow) * 0.2);
          filter: blur(var(--blur)) contrast(var(--contrast));
          animation: spin var(--spin-duration) linear infinite;
        }

        .color-orb::after {
          background-image: radial-gradient(circle at center, var(--base) var(--dot), transparent var(--dot));
          background-size: calc(var(--dot) * 2) calc(var(--dot) * 2);
          backdrop-filter: blur(calc(var(--blur) * 2)) contrast(calc(var(--contrast) * 2));
          mix-blend-mode: overlay;
        }

        .color-orb[style*="--mask: 0%"]::after {
          mask-image: none;
        }

        .color-orb:not([style*="--mask: 0%"])::after {
          mask-image: radial-gradient(black var(--mask), transparent 75%);
        }

        @keyframes spin {
          to { --angle: 360deg; }
        }

        @media (prefers-reduced-motion: reduce) {
          .color-orb::before { animation: none; }
        }
      `}</style>
      <div
        className="color-orb"
        style={
          {
            width: dimension,
            height: dimension,
            "--base": palette.base,
            "--accent1": palette.accent1,
            "--accent2": palette.accent2,
            "--accent3": palette.accent3,
            "--blur": `${blurStrength}px`,
            "--contrast": adjustedContrast,
            "--dot": `${pixelDot}px`,
            "--shadow": `${shadowRange}px`,
            "--mask": maskRadius,
            "--spin-duration": `${spinDuration}s`,
          } as React.CSSProperties
        }
      />
    </div>
  )
}

const SPEED_FACTOR = 1

interface ContextShape {
  showForm: boolean
  successFlag: boolean
  triggerOpen: () => void
  triggerClose: () => void
}

const FormContext = React.createContext<ContextShape>({} as ContextShape)
const useFormContext = () => React.useContext(FormContext)

export function MorphPanel() {
  const wrapperRef = React.useRef<HTMLDivElement>(null)
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const [showForm, setShowForm] = React.useState(false)
  const [successFlag, setSuccessFlag] = React.useState(false)

  const triggerClose = React.useCallback(() => {
    setShowForm(false)
    textareaRef.current?.blur()
  }, [])

  const triggerOpen = React.useCallback(() => {
    setShowForm(true)
    setTimeout(() => {
      textareaRef.current?.focus()
    })
  }, [])

  const handleSuccess = React.useCallback(() => {
    triggerClose()
    setSuccessFlag(true)
    setTimeout(() => setSuccessFlag(false), 1500)
  }, [triggerClose])

  React.useEffect(() => {
    function clickOutsideHandler(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node) && showForm) {
        triggerClose()
      }
    }
    document.addEventListener("mousedown", clickOutsideHandler)
    return () => document.removeEventListener("mousedown", clickOutsideHandler)
  }, [showForm, triggerClose])

  const ctx = React.useMemo(
    () => ({ showForm, successFlag, triggerOpen, triggerClose }),
    [showForm, successFlag, triggerOpen, triggerClose]
  )

  return (
    <FormContext.Provider value={ctx}>
      <div ref={wrapperRef} className="relative flex flex-col items-center">
        <motion.div layout transition={SPRING_LOGO}>
          <DockBar />
          <InputForm ref={textareaRef} onSuccess={handleSuccess} />
        </motion.div>
      </div>
    </FormContext.Provider>
  )
}

function DockBar() {
  const { showForm, triggerOpen } = useFormContext()
  return (
    <motion.div layout transition={SPRING_LOGO}>
      <Button
        variant="ghost"
        onClick={triggerOpen}
        className={cn(
          "relative flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all",
          showForm
            ? "pointer-events-none border-transparent opacity-0"
            : "border-border bg-background shadow-sm hover:bg-accent"
        )}
      >
        <motion.div layout transition={SPRING_LOGO} className="relative h-6 w-6">
          <AnimatePresence mode="wait">
            {showForm ? (
              <motion.div
                key="orb"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
              >
                <ColorOrb dimension="24px" tones={{ base: "oklch(22.64% 0 0)" }} />
              </motion.div>
            ) : (
              <motion.div
                key="sparkle"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
                className="flex h-6 w-6 items-center justify-center"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M8 0L9.2 6.8L16 8L9.2 9.2L8 16L6.8 9.2L0 8L6.8 6.8L8 0Z"
                    fill="currentColor"
                  />
                </svg>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <span className="text-foreground">Ask AI</span>
      </Button>
    </motion.div>
  )
}

const FORM_WIDTH = 360
const FORM_HEIGHT = 200

function InputForm({
  ref,
  onSuccess,
}: {
  ref: React.Ref<HTMLTextAreaElement>
  onSuccess: () => void
}) {
  const { triggerClose, showForm } = useFormContext()
  const btnRef = React.useRef<HTMLButtonElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSuccess()
  }

  function handleKeys(e: React.KeyboardEvent) {
    if (e.key === "Escape") triggerClose()
    if (e.key === "Enter" && e.metaKey) {
      e.preventDefault()
      btnRef.current?.click()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="relative">
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0, width: 0 }}
            animate={{
              opacity: 1,
              height: FORM_HEIGHT,
              width: FORM_WIDTH,
            }}
            exit={{ opacity: 0, height: 0, width: 0 }}
            transition={{
              type: "spring",
              stiffness: 300 / SPEED_FACTOR,
              damping: 30,
            }}
            className="overflow-hidden rounded-2xl border border-border bg-background shadow-lg"
          >
            <div className="flex h-full flex-col">
              <div className="flex items-center justify-between border-b border-border px-3 py-2">
                <span className="text-xs font-medium text-muted-foreground">
                  AI Input
                </span>
                <div className="flex items-center gap-1">
                  <KeyHint>⌘</KeyHint>
                  <KeyHint>Enter</KeyHint>
                </div>
              </div>
              <textarea
                ref={ref}
                onKeyDown={handleKeys}
                placeholder="Ask anything..."
                className="flex-1 resize-none bg-transparent px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <div className="flex items-center justify-end border-t border-border px-3 py-2">
                <Button
                  ref={btnRef}
                  type="submit"
                  size="sm"
                  className="h-7 rounded-lg px-3 text-xs"
                >
                  Send
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute top-2 left-3"
          >
            <ColorOrb dimension="24px" tones={{ base: "oklch(22.64% 0 0)" }} />
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  )
}

const SPRING_LOGO = {
  type: "spring",
  stiffness: 350 / SPEED_FACTOR,
  damping: 35,
} as const

function KeyHint({
  children,
  className,
}: {
  children: string
  className?: string
}) {
  return (
    <kbd
      className={cx(
        "text-foreground flex h-6 w-fit items-center justify-center rounded-sm border px-[6px] font-sans",
        className
      )}
    >
      {children}
    </kbd>
  )
}

export default MorphPanel
