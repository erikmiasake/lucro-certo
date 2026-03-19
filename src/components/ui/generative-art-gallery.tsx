"use client";

import React from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const GenerativeArtCanvas = ({ isHovered }: { isHovered: boolean }) => {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
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
        this.x = Math.random() * canvas!.width;
        this.y = Math.random() * canvas!.height;
        this.speed = Math.random() * 0.5 + 0.1;
        this.angle = Math.random() * Math.PI * 2;
        this.length = Math.random() * 20 + 5;
      }
      update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;
        if (this.x < 0 || this.x > canvas!.width || this.y < 0 || this.y > canvas!.height) {
          this.x = Math.random() * canvas!.width;
          this.y = Math.random() * canvas!.height;
        }
      }
      draw() {
        ctx!.beginPath();
        ctx!.moveTo(this.x, this.y);
        ctx!.lineTo(this.x - Math.cos(this.angle) * this.length, this.y - Math.sin(this.angle) * this.length);
        ctx!.strokeStyle = `rgba(168, 85, 247, ${Math.random() * 0.3 + 0.1})`;
        ctx!.lineWidth = 1;
        ctx!.stroke();
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

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
};

interface GalleryCardProps {
  item: { title: string; category: string; image: string };
  index: number;
  onClick?: () => void;
}

const GalleryCard = ({ item, index, onClick }: GalleryCardProps) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent) => {
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
    onscreen: { y: 0, opacity: 1, transition: { type: "spring", bounce: 0.4, duration: 0.8, delay: index * 0.1 } }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="offscreen"
      animate="onscreen"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="group relative h-52 w-full rounded-xl bg-card border border-border cursor-pointer"
    >
      <div className="absolute inset-[1px] rounded-xl overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => { (e.target as HTMLImageElement).onerror = null; (e.target as HTMLImageElement).src = 'https://placehold.co/400x400/1a1a2e/ffffff?text=Error'; }}
        />
        <GenerativeArtCanvas isHovered={isHovered} />

        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-foreground font-bold text-base">
            {item.title}
          </h3>
          <p className="text-muted-foreground text-xs mt-0.5">
            {item.category}
          </p>
        </div>

        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight className="h-5 w-5 text-foreground" />
        </div>
      </div>
    </motion.div>
  );
};

export { GalleryCard, GenerativeArtCanvas };
export type { GalleryCardProps };
