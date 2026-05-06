"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GalleryItem {
  title: string;
  category: string;
  image: string;
}

interface GalleryCardProps {
  item: GalleryItem;
  index: number;
}

const GalleryCard = ({ item, index }: GalleryCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="group relative h-80 w-full rounded-[24px] bg-zinc-900 border border-white/10 overflow-hidden cursor-pointer"
    >
      <div className="absolute inset-4 rounded-[18px] overflow-hidden">
        <img
          src={item.image}
          alt={item.title}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.src = `https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=400&auto=format&fit=crop`;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent pointer-events-none transition-opacity duration-300 group-hover:opacity-80" />

        <div className="absolute bottom-0 left-0 right-0 p-6 z-10">
          <h3 className="text-xl font-bold text-white mb-1 tracking-tight">
            {item.title}
          </h3>
          <p className="text-sm text-primary/90 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
            {item.category}
          </p>
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

export const GenerativeArtGallery = () => {
  const galleryItems: GalleryItem[] = [
    { 
      title: "Você pode estar vendendo bem… e lucrando mal.", 
      category: "Faturamento alto não significa dinheiro no bolso.", 
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?q=80&w=800&auto=format&fit=crop" 
    },
    { 
      title: "O problema não é só vender.", 
      category: "É tudo que você não vê acontecendo no meio.", 
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?q=80&w=800&auto=format&fit=crop" 
    },
    { 
      title: "Pequenos custos estão comendo seu lucro.", 
      category: "E eles se acumulam todos os dias.", 
      image: "https://images.unsplash.com/photo-1604594849809-dfedbc827105?q=80&w=800&auto=format&fit=crop" 
    },
    { 
      title: "Sem clareza, toda decisão vira aposta.", 
      category: "Você acha que está indo bem… mas não tem certeza.", 
      image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop" 
    },
    { 
      title: "Aqui você vê a verdade do seu negócio.", 
      category: "Sem planilha, sem achismo, sem complicação.", 
      image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=800&auto=format&fit=crop" 
    },
    { 
      title: "No final, só uma coisa importa: quanto sobra.", 
      category: "E agora você finalmente sabe.", 
      image: "https://images.unsplash.com/photo-1559526324-593bc073d938?q=80&w=800&auto=format&fit=crop" 
    },
  ];

  return (
    <div className="relative w-full min-h-screen bg-[#030303] flex flex-col items-center justify-center p-8 md:p-16 overflow-hidden border-t border-white/5">
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
          transition={{ delay: 0.15, duration: 0.6 }}
          className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-white leading-tight"
        >
          O que o <span className="text-primary">Lucro Real</span> te permite enxergar
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-lg text-zinc-400 max-w-2xl"
        >
          Seu lucro não é apenas faturamento. Entenda o que está por trás dos números e tome o controle total do seu negócio.
        </motion.p>
      </div>

      <div className="relative z-10 w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {galleryItems.map((item, index) => (
          <GalleryCard key={item.title} item={item} index={index} />
        ))}
      </div>
    </div>
  );
};

export default GenerativeArtGallery;
