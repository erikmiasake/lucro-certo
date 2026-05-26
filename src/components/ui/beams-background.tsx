"use client";

import { useEffect, useRef, useCallback } from "react";
import { cn } from "@/lib/utils";

interface AnimatedGradientBackgroundProps {
    className?: string;
    children?: React.ReactNode;
    intensity?: "subtle" | "medium" | "strong";
}

interface Beam {
    x: number;
    y: number;
    width: number;
    length: number;
    angle: number;
    speed: number;
    opacity: number;
    hue: number;
    pulse: number;
    pulseSpeed: number;
}

function createBeam(width: number, height: number): Beam {
    const angle = -35 + Math.random() * 10;
    return {
        x: Math.random() * width * 1.5 - width * 0.25,
        y: Math.random() * height * 1.5 - height * 0.25,
        width: 30 + Math.random() * 60,
        length: height * 2.5,
        angle,
        speed: 0.4 + Math.random() * 0.8,
        opacity: 0.1 + Math.random() * 0.12,
        hue: 140 + Math.random() * 40,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.015 + Math.random() * 0.02,
    };
}

export function BeamsBackground({
    className,
    children,
    intensity = "strong",
}: AnimatedGradientBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const beamsRef = useRef<Beam[]>([]);
    const animationFrameRef = useRef<number>(0);
    const BEAM_COUNT = 8; // Reduced from 30

    const opacityMap = {
        subtle: 0.7,
        medium: 0.85,
        strong: 1,
    };

    useEffect(() => {
        // Mobile / reduced-motion fallback: skip the animated canvas entirely.
        // The per-frame canvas blur(35px) over the full viewport freezes iOS Safari.
        const isMobile = typeof window !== "undefined" && window.matchMedia("(max-width: 767px)").matches;
        const prefersReducedMotion = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (isMobile || prefersReducedMotion) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d", { alpha: true });
        if (!ctx) return;

        const updateCanvasSize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
            ctx.scale(dpr, dpr);

            beamsRef.current = Array.from({ length: BEAM_COUNT }, () =>
                createBeam(canvas.width, canvas.height)
            );
        };

        updateCanvasSize();
        window.addEventListener("resize", updateCanvasSize);

        let lastTime = 0;
        const FPS_INTERVAL = 1000 / 30; // Cap at 30fps

        function animate(timestamp: number) {
            if (!canvas || !ctx) return;

            const elapsed = timestamp - lastTime;
            if (elapsed < FPS_INTERVAL) {
                animationFrameRef.current = requestAnimationFrame(animate);
                return;
            }
            lastTime = timestamp - (elapsed % FPS_INTERVAL);

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.filter = "blur(35px)";

            beamsRef.current.forEach((beam, index) => {
                beam.y -= beam.speed;
                beam.pulse += beam.pulseSpeed;

                if (beam.y + beam.length < -100) {
                    beam.y = canvas!.height + 100;
                    beam.x = Math.random() * canvas!.width;
                }

                ctx!.save();
                ctx!.translate(beam.x, beam.y);
                ctx!.rotate((beam.angle * Math.PI) / 180);

                const pulsingOpacity =
                    beam.opacity *
                    (0.8 + Math.sin(beam.pulse) * 0.2) *
                    opacityMap[intensity];

                const gradient = ctx!.createLinearGradient(0, 0, 0, beam.length);
                gradient.addColorStop(0, `hsla(${beam.hue}, 85%, 65%, 0)`);
                gradient.addColorStop(0.1, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity * 0.5})`);
                gradient.addColorStop(0.4, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity})`);
                gradient.addColorStop(0.6, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity})`);
                gradient.addColorStop(0.9, `hsla(${beam.hue}, 85%, 65%, ${pulsingOpacity * 0.5})`);
                gradient.addColorStop(1, `hsla(${beam.hue}, 85%, 65%, 0)`);

                ctx!.fillStyle = gradient;
                ctx!.fillRect(-beam.width / 2, 0, beam.width, beam.length);
                ctx!.restore();
            });

            animationFrameRef.current = requestAnimationFrame(animate);
        }

        animationFrameRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener("resize", updateCanvasSize);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [intensity]);

    return (
        <div className={cn("relative w-full", className)}>
            {/* Static gradient fallback — always rendered, cheap on mobile */}
            <div
                aria-hidden
                className="fixed inset-0 pointer-events-none z-0 md:hidden"
                style={{
                    background:
                        "radial-gradient(ellipse at 20% 10%, hsla(155, 85%, 45%, 0.18), transparent 55%), radial-gradient(ellipse at 80% 90%, hsla(160, 80%, 40%, 0.14), transparent 55%), hsl(var(--background))",
                }}
            />
            {/* Animated canvas — desktop only */}
            <canvas
                ref={canvasRef}
                className="fixed inset-0 pointer-events-none z-0 hidden md:block"
                style={{ filter: "blur(15px)", willChange: "transform" }}
            />
            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
}
