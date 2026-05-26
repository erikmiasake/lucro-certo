"use client";

import { memo, useCallback, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { animate } from "framer-motion";

interface GlowingEffectProps {
  blur?: number;
  inactiveZone?: number;
  proximity?: number;
  spread?: number;
  variant?: "default" | "white";
  glow?: boolean;
  className?: string;
  disabled?: boolean;
  movementDuration?: number;
  borderWidth?: number;
}

const GlowingEffect = memo(
  ({
    blur = 0,
    inactiveZone = 0.7,
    proximity = 0,
    spread = 20,
    variant = "default",
    glow = false,
    className,
    movementDuration = 2,
    borderWidth = 1,
    disabled = true,
  }: GlowingEffectProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const lastPosition = useRef({ x: 0, y: 0 });
    const animationFrameRef = useRef<number>(0);

    const handleMove = useCallback(
      (e?: MouseEvent | { x: number; y: number }) => {
        if (!containerRef.current) return;

        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }

        animationFrameRef.current = requestAnimationFrame(() => {
          const element = containerRef.current;
          if (!element) return;

          const { left, top, width, height } = element.getBoundingClientRect();
          const mouseX = e?.x ?? lastPosition.current.x;
          const mouseY = e?.y ?? lastPosition.current.y;

          if (e) {
            lastPosition.current = { x: mouseX, y: mouseY };
          }

          const center = [left + width * 0.5, top + height * 0.5];
          const distanceFromCenter = Math.hypot(
            mouseX - center[0],
            mouseY - center[1]
          );
          const inactiveRadius = 0.5 * Math.min(width, height) * inactiveZone;

          if (distanceFromCenter < inactiveRadius) {
            element.style.setProperty("--active", "0");
            return;
          }

          const isActive =
            mouseX > left - proximity &&
            mouseX < left + width + proximity &&
            mouseY > top - proximity &&
            mouseY < top + height + proximity;

          element.style.setProperty("--active", isActive ? "1" : "0");

          if (!isActive) return;

          const currentAngle =
            parseFloat(element.style.getPropertyValue("--start")) || 0;
          let targetAngle =
            (180 * Math.atan2(mouseY - center[1], mouseX - center[0])) /
              Math.PI +
            90;

          const angleDiff = ((targetAngle - currentAngle + 180) % 360) - 180;
          const newAngle = currentAngle + angleDiff;

          animate(currentAngle, newAngle, {
            duration: movementDuration,
            ease: [0.16, 1, 0.3, 1],
            onUpdate: (value) => {
              element.style.setProperty("--start", String(value));
            },
          });
        });
      },
      [inactiveZone, proximity, movementDuration]
    );

    useEffect(() => {
      if (disabled) return;

      const handleScroll = () => handleMove();
      const handlePointerMove = (e: PointerEvent) => handleMove(e);

      window.addEventListener("scroll", handleScroll, { passive: true });
      document.body.addEventListener("pointermove", handlePointerMove, {
        passive: true,
      });

      return () => {
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        window.removeEventListener("scroll", handleScroll);
        document.body.removeEventListener("pointermove", handlePointerMove);
      };
    }, [handleMove, disabled]);

    return (
      <div
        ref={containerRef}
        style={
          {
            "--blur": `${blur}px`,
            "--spread": spread,
            "--start": "0",
            "--active": "0",
            "--glowing-border-width": `${borderWidth}px`,
            "--gradient":
              variant === "white"
                ? `repeating-conic-gradient(
                    from 236.32deg at 50% 50%,
                    var(--black),
                    var(--black) 10%,
                    transparent 10%,
                    transparent 40%,
                    var(--black) 50%
                  )`
                : `radial-gradient(circle, #dd7bbb 10%, #dd7bbb 22%, #b944d8 28%, #b944d8 32%, #c76bd1 35%, #c76bd1 40%, #7f43c5 50%, #7f43c5 60%, #4c00ff 68%, #4c00ff 75%, #1d72b8 82%, #1d72b8 100%)`,
          } as React.CSSProperties
        }
        className={cn(
          "pointer-events-none absolute -inset-px rounded-[inherit] border opacity-0 transition-opacity",
          "border-[length:var(--glowing-border-width)] border-transparent",
          "[background:padding-box_linear-gradient(var(--background),var(--background)),border-box_var(--gradient)]",
          "[mask:linear-gradient(#0000,#0000),conic-gradient(from_calc((var(--start)_-_(var(--spread)))*1deg),#000_0deg,#fff,#000_calc(var(--spread)*2deg),#0000_0deg)_border-box]",
          "[mask-composite:intersect]",
          "after:absolute after:inset-0 after:rounded-[inherit] after:opacity-[var(--active)]",
          "after:[background:border-box_var(--gradient)]",
          "after:[mask:linear-gradient(#0000,#0000),conic-gradient(from_calc((var(--start)_-_(var(--spread)))*1deg),#000_0deg,#fff,#000_calc(var(--spread)*2deg),#0000_0deg)_border-box]",
          "after:[mask-composite:intersect]",
          glow &&
            "after:blur-[var(--blur)] after:transition-opacity after:duration-500",
          "opacity-[var(--active)]",
          className,
          disabled && "!hidden"
        )}
      />
    );
  }
);

GlowingEffect.displayName = "GlowingEffect";

export { GlowingEffect };
