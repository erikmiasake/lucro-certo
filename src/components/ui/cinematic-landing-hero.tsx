"use client";

import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const INJECTED_STYLES = `
  .gsap-reveal { visibility: hidden; }

  .film-grain {
    position: absolute; inset: 0; width: 100%; height: 100%;
    pointer-events: none; z-index: 50; opacity: 0.03; mix-blend-mode: overlay;
  }

  .bg-grid-theme {
    background-size: 60px 60px;
    background-image: 
      linear-gradient(to right, color-mix(in srgb, var(--color-foreground) 5%, transparent) 1px, transparent 1px),
      linear-gradient(to bottom, color-mix(in srgb, var(--color-foreground) 5%, transparent) 1px, transparent 1px);
    mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
    -webkit-mask-image: radial-gradient(ellipse at center, black 0%, transparent 70%);
  }

  .text-3d-matte {
    color: var(--color-foreground);
    text-shadow: 
      0 10px 30px color-mix(in srgb, var(--color-foreground) 20%, transparent), 
      0 2px 4px color-mix(in srgb, var(--color-foreground) 10%, transparent);
  }

  .text-silver-matte {
    color: #FFFFFF !important;
    -webkit-text-fill-color: #FFFFFF !important;
    text-shadow: 
      0 0 40px rgba(255,255,255,0.15),
      0 4px 12px rgba(0,0,0,0.5);
  }

  .text-card-silver-matte {
    background: linear-gradient(180deg, #FFFFFF 0%, #A1A1AA 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    transform: translateZ(0);
    filter: 
      drop-shadow(0px 12px 24px rgba(0,0,0,0.8)) 
      drop-shadow(0px 4px 8px rgba(0,0,0,0.6));
  }

  .premium-depth-card {
    background: linear-gradient(145deg, hsl(152 76% 20%) 0%, hsl(228 14% 7%) 100%);
    box-shadow: 
      0 40px 100px -20px rgba(0, 0, 0, 0.9),
      0 20px 40px -20px rgba(0, 0, 0, 0.8),
      inset 0 1px 2px rgba(255, 255, 255, 0.1),
      inset 0 -2px 4px rgba(0, 0, 0, 0.8);
    border: 1px solid rgba(255, 255, 255, 0.04);
    position: relative;
  }

  .card-sheen {
    position: absolute; inset: 0; border-radius: inherit; pointer-events: none; z-index: 50;
    background: radial-gradient(800px circle at var(--mouse-x, 50%) var(--mouse-y, 50%), rgba(255,255,255,0.06) 0%, transparent 40%);
    mix-blend-mode: screen; transition: opacity 0.3s ease;
  }

  .iphone-bezel {
    background-color: #111;
    box-shadow: 
      inset 0 0 0 2px #52525B, 
      inset 0 0 0 7px #000, 
      0 40px 80px -15px rgba(0,0,0,0.9),
      0 15px 25px -5px rgba(0,0,0,0.7);
    transform-style: preserve-3d;
  }

  .hardware-btn {
    background: linear-gradient(90deg, #404040 0%, #171717 100%);
    box-shadow: 
      -2px 0 5px rgba(0,0,0,0.8),
      inset -1px 0 1px rgba(255,255,255,0.15),
      inset 1px 0 2px rgba(0,0,0,0.8);
    border-left: 1px solid rgba(255,255,255,0.05);
  }
  
  .screen-glare {
    background: linear-gradient(110deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 45%);
  }

  .widget-depth {
    background: linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%);
    box-shadow: 
      0 10px 20px rgba(0,0,0,0.3),
      inset 0 1px 1px rgba(255,255,255,0.05),
      inset 0 -1px 1px rgba(0,0,0,0.5);
    border: 1px solid rgba(255,255,255,0.03);
  }

  .floating-ui-badge {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.01) 100%);
    backdrop-filter: blur(24px); 
    -webkit-backdrop-filter: blur(24px);
    box-shadow: 
      0 0 0 1px rgba(255, 255, 255, 0.1),
      0 25px 50px -12px rgba(0, 0, 0, 0.8),
      inset 0 1px 1px rgba(255,255,255,0.2),
      inset 0 -1px 1px rgba(0,0,0,0.5);
  }

  .btn-modern-light, .btn-modern-dark {
    transition: all 0.4s cubic-bezier(0.25, 1, 0.5, 1);
  }
  .btn-modern-light {
    background: linear-gradient(180deg, hsl(152 76% 52%) 0%, hsl(152 76% 42%) 100%);
    color: hsl(228 14% 7%);
    box-shadow: 0 0 0 1px rgba(0,0,0,0.05), 0 2px 4px rgba(0,0,0,0.1), 0 12px 24px -4px rgba(0,0,0,0.3), inset 0 1px 1px rgba(255,255,255,0.3), inset 0 -3px 6px rgba(0,0,0,0.1);
  }
  .btn-modern-light:hover {
    transform: translateY(-3px);
    box-shadow: 0 0 0 1px rgba(0,0,0,0.05), 0 6px 12px -2px rgba(0,0,0,0.15), 0 20px 32px -6px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.3), inset 0 -3px 6px rgba(0,0,0,0.1);
  }
  .btn-modern-light:active {
    transform: translateY(1px);
  }
  .btn-modern-dark {
    background: linear-gradient(180deg, #27272A 0%, #18181B 100%);
    color: #FFFFFF;
    box-shadow: 0 0 0 1px rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.6), 0 12px 24px -4px rgba(0,0,0,0.9), inset 0 1px 1px rgba(255,255,255,0.15), inset 0 -3px 6px rgba(0,0,0,0.8);
  }
  .btn-modern-dark:hover {
    transform: translateY(-3px);
    background: linear-gradient(180deg, #3F3F46 0%, #27272A 100%);
  }

  .progress-ring {
    transform: rotate(-90deg);
    transform-origin: center;
    stroke-dasharray: 402;
    stroke-dashoffset: 402;
    stroke-linecap: round;
  }
`;

export interface CinematicHeroProps extends React.HTMLAttributes<HTMLDivElement> {
  brandName?: string;
  tagline1?: string;
  tagline2?: string;
  cardHeading?: string;
  cardDescription?: React.ReactNode;
  metricValue?: number;
  metricLabel?: string;
  ctaHeading?: string;
  ctaDescription?: string;
  onCtaClick?: () => void;
}

export function CinematicHero({
  brandName = "Lucro Real",
  tagline1 = "Saiba quanto realmente",
  tagline2 = "sobra no seu bolso.",
  cardHeading = "Gestão inteligente.",
  cardDescription = (
    <>
      Registre vendas, organize custos fixos e variáveis, e descubra seu lucro
      real com ajuda de <strong>inteligência artificial</strong>.
    </>
  ),
  metricValue = 87,
  metricLabel = "% Margem",
  ctaHeading = "Comece agora.",
  ctaDescription = "Descubra quanto realmente sobra no seu negócio. Simples, sem cadastro, resultados em segundos.",
  onCtaClick,
  className,
  ...props
}: CinematicHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mainCardRef = useRef<HTMLDivElement>(null);
  const mockupRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (window.scrollY > window.innerHeight * 2) return;
      cancelAnimationFrame(requestRef.current);
      requestRef.current = requestAnimationFrame(() => {
        if (mainCardRef.current && mockupRef.current) {
          const rect = mainCardRef.current.getBoundingClientRect();
          mainCardRef.current.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
          mainCardRef.current.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
          const xVal = (e.clientX / window.innerWidth - 0.5) * 2;
          const yVal = (e.clientY / window.innerHeight - 0.5) * 2;
          gsap.to(mockupRef.current, {
            rotationY: xVal * 12,
            rotationX: -yVal * 12,
            ease: "power3.out",
            duration: 1.2,
          });
        }
      });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;

    const ctx = gsap.context(() => {
      gsap.set(".text-track", { autoAlpha: 0, y: 60, scale: 0.85, filter: "blur(20px)", rotationX: -20 });
      gsap.set(".text-days", { autoAlpha: 1, clipPath: "inset(0 100% 0 0)" });
      gsap.set(".main-card", { y: window.innerHeight + 200, autoAlpha: 1 });
      gsap.set([".card-left-text", ".card-right-text", ".mockup-scroll-wrapper", ".floating-badge", ".phone-widget"], { autoAlpha: 0 });
      gsap.set(".cta-wrapper", { autoAlpha: 0, scale: 0.8, filter: "blur(30px)" });

      const introTl = gsap.timeline({ delay: 0.3 });
      introTl
        .to(".text-track", { duration: 1.8, autoAlpha: 1, y: 0, scale: 1, filter: "blur(0px)", rotationX: 0, ease: "expo.out" })
        .to(".text-days", { duration: 1.4, clipPath: "inset(0 0% 0 0)", ease: "power4.inOut" }, "-=1.0");

      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=7000",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      scrollTl
        .to([".hero-text-wrapper", ".bg-grid-theme"], { scale: 1.15, filter: "blur(20px)", opacity: 0.2, ease: "power2.inOut", duration: 2 }, 0)
        .to(".main-card", { y: 0, ease: "power3.inOut", duration: 2 }, 0)
        .to(".main-card", { width: "100%", height: "100%", borderRadius: "0px", ease: "power3.inOut", duration: 1.5 })
        .fromTo(".mockup-scroll-wrapper",
          { y: 300, z: -500, rotationX: 50, rotationY: -30, autoAlpha: 0, scale: 0.6 },
          { y: 0, z: 0, rotationX: 0, rotationY: 0, autoAlpha: 1, scale: 1, ease: "expo.out", duration: 2.5 }, "-=0.8"
        )
        .fromTo(".phone-widget", { y: 40, autoAlpha: 0, scale: 0.95 }, { y: 0, autoAlpha: 1, scale: 1, stagger: 0.15, ease: "back.out(1.2)", duration: 1.5 }, "-=1.5")
        .to(".progress-ring", { strokeDashoffset: 60, duration: 2, ease: "power3.inOut" }, "-=1.2")
        .to(".counter-val", { innerHTML: metricValue, snap: { innerHTML: 1 }, duration: 2, ease: "expo.out" }, "-=2.0")
        .fromTo(".floating-badge", { y: 100, autoAlpha: 0, scale: 0.7, rotationZ: -10 }, { y: 0, autoAlpha: 1, scale: 1, rotationZ: 0, ease: "back.out(1.5)", duration: 1.5, stagger: 0.2 }, "-=2.0")
        .fromTo(".card-left-text", { x: -50, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: "power4.out", duration: 1.5 }, "-=1.5")
        .fromTo(".card-right-text", { x: 50, autoAlpha: 0, scale: 0.8 }, { x: 0, autoAlpha: 1, scale: 1, ease: "expo.out", duration: 1.5 }, "<")
        .to({}, { duration: 2.5 })
        .set(".hero-text-wrapper", { autoAlpha: 0 })
        .set(".cta-wrapper", { autoAlpha: 1 })
        .to({}, { duration: 1.5 })
        .to([".mockup-scroll-wrapper", ".floating-badge", ".card-left-text", ".card-right-text"], {
          scale: 0.9, y: -40, z: -200, autoAlpha: 0, ease: "power3.in", duration: 1.2, stagger: 0.05,
        })
        .to(".main-card", {
          width: isMobile ? "92vw" : "85vw",
          height: isMobile ? "92vh" : "85vh",
          borderRadius: isMobile ? "32px" : "40px",
          ease: "expo.inOut",
          duration: 1.8
        }, "pullback")
        .to(".cta-wrapper", { scale: 1, filter: "blur(0px)", ease: "expo.inOut", duration: 1.8 }, "pullback")
        .to(".main-card", { y: -window.innerHeight - 300, ease: "power3.in", duration: 1.5 });

    }, containerRef);

    return () => ctx.revert();
  }, [metricValue]);

  return (
    <div ref={containerRef} className={cn("relative w-full min-h-screen bg-background", className)} {...props}>
      <style dangerouslySetInnerHTML={{ __html: INJECTED_STYLES }} />

      {/* Hero Text Layer */}
      <div className="hero-text-wrapper absolute inset-0 z-10 flex flex-col items-center justify-center px-6">
        <div className="absolute inset-0 bg-grid-theme opacity-30" />
        <div className="film-grain" />

        <div className="relative z-10 text-center max-w-5xl mx-auto">
          <p className="text-track text-sm md:text-base font-medium tracking-[0.2em] uppercase text-muted-foreground mb-6 md:mb-8">
            Assistente financeiro com IA
          </p>
          <h1 className="text-track text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[0.95] text-silver-matte">
            {tagline1}
          </h1>
          <h1 className="text-days text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[0.95] mt-1 md:mt-2" style={{ color: "hsl(152 76% 52%)" }}>
            {tagline2}
          </h1>
          <p className="text-track text-muted-foreground text-base md:text-lg max-w-xl mx-auto mt-6 md:mt-8 leading-relaxed">
            Registre vendas, organize custos e descubra seu lucro real com ajuda de IA.
          </p>
        </div>
      </div>

      {/* Main Card */}
      <div
        ref={mainCardRef}
        className="main-card fixed inset-0 m-auto z-20 w-[90vw] md:w-[80vw] h-[85vh] rounded-[40px] premium-depth-card overflow-hidden"
      >
        <div className="card-sheen" />

        {/* Card Left Text - Tightly positioned for Mobile */}
        <div className="card-left-text absolute top-10 sm:top-16 md:top-1/2 left-6 right-6 md:right-auto md:left-12 md:-translate-y-1/2 z-30 w-auto md:max-w-sm text-center md:text-left">
          <h2 className="text-card-silver-matte text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
            {cardHeading}
          </h2>
          <p className="text-zinc-400 text-sm md:text-base mt-3 md:mt-4 leading-relaxed max-w-[280px] sm:max-w-md mx-auto md:mx-0">
            {cardDescription}
          </p>
        </div>

        {/* Card Right - Floating Phone Mockup */}
        <div className="card-right-text absolute bottom-[-15%] sm:bottom-[-10%] left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-4 lg:right-12 md:top-1/2 md:-translate-y-1/2 z-30 scale-[0.6] sm:scale-[0.7] md:scale-[0.9] lg:scale-100 origin-bottom md:origin-center pointer-events-none md:pointer-events-auto">
          <div ref={mockupRef} className="mockup-scroll-wrapper" style={{ perspective: "1200px" }}>
            <div 
              className="iphone-bezel relative w-[240px] md:w-[280px] h-[480px] md:h-[560px] rounded-[40px] md:rounded-[50px] p-[8px] md:p-[10px]"
              style={{
                maskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, black 80%, transparent 100%)',
              }}
            >
              {/* Hardware buttons */}
              <div className="hardware-btn absolute -right-[3px] top-[120px] md:top-[160px] w-[3px] h-[60px] md:h-[80px] rounded-r-sm" />
              <div className="hardware-btn absolute -left-[3px] top-[100px] md:top-[130px] w-[3px] h-[30px] md:h-[40px] rounded-l-sm" />
              <div className="hardware-btn absolute -left-[3px] top-[150px] md:top-[190px] w-[3px] h-[50px] md:h-[60px] rounded-l-sm" />

              {/* Screen */}
              <div className="relative w-full h-full rounded-[32px] md:rounded-[40px] overflow-hidden bg-black">
                <div className="screen-glare absolute inset-0 z-40 rounded-[32px] md:rounded-[40px]" />
                {/* Dynamic Island */}
                <div className="absolute top-3 left-1/2 -translate-x-1/2 w-[80px] md:w-[100px] h-[24px] md:h-[30px] bg-black rounded-full z-30" />

                {/* Screen Content - Dashboard mockup */}
                <div className="relative z-10 w-full h-full p-4 pt-12 md:pt-14 flex flex-col gap-3" style={{ background: "linear-gradient(180deg, hsl(228 14% 10%) 0%, hsl(228 14% 7%) 100%)" }}>
                  {/* Header */}
                  <div className="phone-widget flex items-center justify-between">
                    <div>
                      <p className="text-zinc-500 text-[9px] md:text-[10px]">Hoje</p>
                      <p className="text-white text-sm md:text-base font-bold">Visão Geral</p>
                    </div>
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-zinc-800 flex items-center justify-center">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(152 76% 52%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                    </div>
                  </div>

                  {/* Metric Card */}
                  <div className="phone-widget widget-depth rounded-2xl p-3 md:p-4 flex items-center gap-3">
                    <svg className="w-[50px] h-[50px] md:w-[64px] md:h-[64px]" viewBox="0 0 140 140">
                      <circle cx="70" cy="70" r="64" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="10" />
                      <circle className="progress-ring" cx="70" cy="70" r="64" fill="none" stroke="hsl(152 76% 52%)" strokeWidth="10" />
                    </svg>
                    <div>
                      <p className="text-zinc-400 text-[9px] md:text-[10px]">Lucro Real</p>
                      <p className="text-white text-xl md:text-2xl font-bold">
                        R$ <span className="counter-val">0</span>
                      </p>
                    </div>
                  </div>

                  {/* Mini chart bars */}
                  <div className="phone-widget widget-depth rounded-2xl p-3 flex-1">
                    <p className="text-zinc-400 text-[9px] md:text-[10px] mb-2">Últimos 7 dias</p>
                    <div className="flex items-end gap-1.5 h-[60%]">
                      {[40, 65, 50, 80, 70, 90, 75].map((h, i) => (
                        <div key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: i === 5 ? "hsl(152 76% 52%)" : "rgba(255,255,255,0.08)" }} />
                      ))}
                    </div>
                  </div>

                  {/* Bottom insight */}
                  <div className="phone-widget widget-depth rounded-2xl p-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 md:w-6 md:h-6 rounded-full flex items-center justify-center" style={{ background: "hsl(152 76% 52% / 0.15)" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="hsl(152 76% 52%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2"/></svg>
                      </div>
                      <div>
                        <p className="text-zinc-400 text-[8px] md:text-[9px]">Insight IA</p>
                        <p className="text-zinc-300 text-[9px] md:text-[10px]">Margem subiu 12% esta semana</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Badges */}
        <div className="floating-badge floating-ui-badge absolute top-4 md:top-12 right-4 md:right-16 z-40 px-3 md:px-4 py-1.5 md:py-2 rounded-full flex items-center gap-2">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: "hsl(152 76% 52%)" }} />
          <span className="text-white text-[10px] md:text-xs font-medium">Custos organizados</span>
        </div>
        <div className="floating-badge floating-ui-badge absolute bottom-4 md:bottom-16 left-4 md:left-16 z-40 px-3 md:px-4 py-1.5 md:py-2 rounded-full flex items-center gap-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="hsl(152 76% 52%)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7"/></svg>
          <span className="text-white text-[10px] md:text-xs font-medium">IA analisa tudo</span>
        </div>

        {/* CTA Wrapper */}
        <div className="cta-wrapper absolute inset-0 z-40 flex flex-col items-center justify-center text-center px-6">
          <h2 className="text-card-silver-matte text-3xl md:text-5xl lg:text-6xl font-bold leading-tight max-w-2xl">
            {ctaHeading}
          </h2>
          <p className="text-zinc-400 text-sm md:text-lg max-w-lg mt-4 md:mt-6 leading-relaxed">
            {ctaDescription}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mt-8 md:mt-10">
            <button
              onClick={onCtaClick}
              className="btn-modern-light px-8 py-3.5 rounded-xl text-sm font-semibold"
            >
              Começar agora →
            </button>
            <a
              href="/login"
              className="btn-modern-dark px-8 py-3.5 rounded-xl text-sm font-semibold"
            >
              Ver como funciona
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
