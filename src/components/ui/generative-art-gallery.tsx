"use client";

import React, { useRef, useEffect, useState } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

// Generative Art Canvas Component
interface GenerativeArtCanvasProps {
  isHovered: boolean;
}

const GenerativeArtCanvas = ({ isHovered }: GenerativeArtCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lines: Line[] = [];
    const numLines = 30;

    class Line {
      x: number;
      y: number;
      speed: number;
      angle: number;
      length: number;

      constructor() {
        if (!canvas) {
          this.x = 0;
          this.y = 0;
        } else {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
        }
        this.speed = Math.random() * 0.5 + 0.1;
        this.angle = Math.random() * Math.PI * 2;
        this.length = Math.random() * 20 + 5;
      }

      update() {
        if (!canvas) return;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
          this.x = Math.random() * canvas.width;
          this.y = Math.random() * canvas.height;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - Math.cos(this.angle) * this.length, this.y - Math.sin(this.angle) * this.length);
        ctx.strokeStyle = `rgba(168, 85, 247, ${Math.random() * 0.3 + 0.1})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    const init = () => {
      lines = [];
      for (let i = 0; i < numLines; i++) {
        lines.push(new Line());
      }
    };

    const animate = () => {
      if (isHovered) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        lines.forEach(line => {
          line.update();
          line.draw();
        });
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      animationFrameId = requestAnimationFrame(animate);
    };

    canvas.width = 400;
    canvas.height = 400;
    init();
    animate();

    return () => cancelAnimationFrame(animationFrameId);
  }, [isHovered]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full opacity-0 group-hover:opacity-100 transition-opacity duration-500" />;
};

// Gallery Card Component with 3D tilt effect
interface GalleryItem {
  title: string;
  category: string;
  image: string;
}

interface GalleryCardProps {
  item: GalleryItem;
  index: number;
  key?: string;
}

const GalleryCard = ({ item, index }: GalleryCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const cardVariants = {
    offscreen: { y: 50, opacity: 0 },
    onscreen: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        bounce: 0.4,
        duration: 0.8,
        delay: index * 0.1
      }
    }
  };

  return (
    <motion.div
      key={item.title}
      variants={cardVariants}
      initial="offscreen"
      whileInView="onscreen"
      viewport={{ once: true, amount: 0.5 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="group relative h-80 w-full rounded-[24px] bg-zinc-900 border border-white/10"
    >
      <div
        style={{ transform: "translateZ(50px)", transformStyle: "preserve-3d" }}
        className="absolute inset-4 flex flex-col justify-end p-6 rounded-[18px] overflow-hidden cursor-pointer"
      >
        <img
          src={item.image}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = `https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=400&auto=format&fit=crop`;
          }}
        />
        <GenerativeArtCanvas isHovered={isHovered} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none transition-opacity duration-300 group-hover:opacity-80"></div>

        <div className="relative z-10 pointer-events-none">
          <motion.h3
            className="text-xl font-bold text-white mb-1 tracking-tight"
          >
            {item.title}
          </motion.h3>
          <motion.p
            className="text-sm text-primary/90 font-medium"
          >
            {item.category}
          </motion.p>
        </div>
        <div className="absolute top-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
            <ArrowUpRight className="w-4 h-4 text-primary" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

// The main Strategic Insights component
export const GenerativeArtGallery = () => {
  const galleryItems: GalleryItem[] = [
    { 
      title: "Você pode estar vendendo bem… e lucrando mal.", 
      category: "Faturamento alto não significa dinheiro no bolso.", 
      // Cash register / point of sale
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=800&auto=format&fit=crop" 
    },
    { 
      title: "O problema não é só vender.", 
      category: "É tudo que você não vê acontecendo no meio.", 
      // Business owner looking at documents/receipts
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=800&auto=format&fit=crop" 
    },
    { 
      title: "Pequenos custos estão comendo seu lucro.", 
      category: "E eles se acumulam todos os dias.", 
      // Coins / counting money
      image: "https://images.unsplash.com/photo-1604594849809-dfedbc827105?q=80&w=800&auto=format&fit=crop" 
    },
    { 
      title: "Sem clareza, toda decisão vira aposta.", 
      category: "Você acha que está indo bem… mas não tem certeza.", 
      // Person analyzing charts on laptop
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop" 
    },
    { 
      title: "Aqui você vê a verdade do seu negócio.", 
      category: "Sem planilha, sem achismo, sem complicação.", 
      // Clean dashboard / mobile app on phone
      image: "https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?q=80&w=800&auto=format&fit=crop" 
    },
    { 
      title: "No final, só uma coisa importa: quanto sobra.", 
      category: "E agora você finalmente sabe.", 
      // Entrepreneur relaxed, in control
      image: "https://images.unsplash.com/photo-1559526324-593bc073d938?q=80&w=800&auto=format&fit=crop" 
    },
  ];

  return (
    <div className="relative w-full min-h-screen bg-[#030303] flex flex-col items-center justify-center p-8 md:p-16 overflow-hidden border-t border-white/5">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-5xl bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none opacity-40" />

      <div className="relative z-10 flex flex-col items-center text-center mb-16 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-6 tracking-widest uppercase"
        >
          Visão Estratégica
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.8, ease: "easeInOut" }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-white leading-tight"
        >
          O que o <span className="text-primary">Lucro Real</span> te permite enxergar
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.8, ease: "easeInOut" }}
          className="text-lg text-zinc-400 max-w-2xl"
        >
          Seu lucro não é apenas faturamento. Entenda o que está por trás dos números e tome o controle total do seu negócio.
        </motion.p>
      </div>

      {/* Gallery Grid */}
      <div className="relative z-10 w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {galleryItems.map((item, index) => (
          <GalleryCard key={item.title} item={item} index={index} />
        ))}
      </div>
    </div>
  );
};

export default GenerativeArtGallery;
