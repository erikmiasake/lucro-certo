"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  ArrowUpRight, 
  DollarSign, 
  Zap, 
  PieChart, 
  LayoutDashboard,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DashboardShowcaseProps {
  onCtaClick?: () => void;
}

export default function DashboardShowcase({ onCtaClick }: DashboardShowcaseProps) {
  return (
    <section className="relative w-full min-h-screen bg-[#030303] overflow-hidden pt-32 pb-20 px-6">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] opacity-30" />
        <div 
          className="absolute inset-0 opacity-[0.05]" 
          style={{ 
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} 
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center">
        {/* Header Text */}
        <div className="text-center max-w-3xl mx-auto mb-16 px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md"
          >
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-[10px] md:text-xs font-medium text-zinc-300 uppercase tracking-wider">
              Inteligência Artificial para Negócios
            </span>
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.1]"
          >
            Seu negócio no <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-emerald-400 to-primary/80">
              piloto automático.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-zinc-400 text-base md:text-lg mb-10 max-w-2xl mx-auto"
          >
            A plataforma inteligente que analisa seus custos, vendas e lucratividade em tempo real. Tome decisões baseadas em dados, não em palpites.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Button 
              onClick={onCtaClick}
              size="lg" 
              className="w-full sm:w-auto h-12 px-8 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(20,184,105,0.3)] hover:shadow-[0_0_30px_rgba(20,184,105,0.5)] font-semibold group"
            >
              Começar grátis
              <ArrowUpRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto h-12 px-8 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all backdrop-blur-md"
            >
              Ver demonstração
            </Button>
          </motion.div>
        </div>

        {/* Dashboard Visual Mockup - Bento Grid Style */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 px-4"
        >
          {/* Main Chart Card */}
          <div className="md:col-span-8 h-[300px] md:h-[450px] rounded-[32px] bg-zinc-900/40 border border-white/10 backdrop-blur-xl p-6 md:p-8 relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  Visão Geral de Lucro
                </h3>
                <p className="text-zinc-500 text-sm mt-1">Comparativo dos últimos 30 dias</p>
              </div>
              <div className="flex gap-2">
                {[7, 30, 90].map((d) => (
                  <button key={d} className={cn("px-3 py-1 rounded-lg text-[10px] font-medium transition-colors", d === 30 ? "bg-primary/20 text-primary border border-primary/30" : "bg-white/5 text-zinc-500 border border-transparent")}>
                    {d}D
                  </button>
                ))}
              </div>
            </div>
            
            {/* Fake Chart Illustration */}
            <div className="flex items-end justify-between h-[60%] w-full gap-2 md:gap-4 px-2">
              {[40, 60, 45, 75, 55, 90, 65, 85, 70, 95, 80, 100].map((h, i) => (
                <div key={i} className="flex-1 group/bar relative">
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    transition={{ duration: 1, delay: 0.6 + (i * 0.05) }}
                    className={cn(
                      "w-full rounded-t-lg transition-all duration-300", 
                      i === 11 ? "bg-primary shadow-[0_0_15px_rgba(20,184,105,0.4)]" : "bg-zinc-800 group-hover/bar:bg-zinc-700"
                    )} 
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column Bento Cards */}
          <div className="md:col-span-4 flex flex-col gap-4 md:gap-6">
            {/* Metric Card 1 */}
            <div className="flex-1 rounded-[32px] bg-zinc-900/40 border border-white/10 backdrop-blur-xl p-6 flex flex-col justify-between hover:bg-zinc-800/40 transition-colors cursor-default group">
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                  <DollarSign className="w-5 h-5 text-primary" />
                </div>
                <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">+12.4%</span>
              </div>
              <div>
                <p className="text-zinc-500 text-sm mb-1 uppercase tracking-wider font-semibold">Saldo Atual</p>
                <h4 className="text-3xl font-bold text-white tracking-tight">R$ 124.500</h4>
              </div>
            </div>

            {/* Metric Card 2 - AI Insight */}
            <div className="flex-1 rounded-[32px] bg-primary/10 border border-primary/20 backdrop-blur-xl p-6 relative overflow-hidden group">
              <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-primary/20 rounded-full blur-3xl" />
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Insight da IA</span>
              </div>
              <p className="text-white text-sm leading-relaxed font-medium">
                "Sua margem de lucro cresceu 15% após o corte de custos fixos no último trimestre."
              </p>
            </div>
          </div>

          {/* Bottom Row Bento Cards */}
          {/* Quick Stats */}
          <div className="md:col-span-4 rounded-[32px] bg-zinc-900/40 border border-white/10 backdrop-blur-xl p-6 flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 group-hover:scale-110 transition-transform">
              <LayoutDashboard className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-white font-bold">12 Projetos</p>
              <p className="text-zinc-500 text-xs">Ativos simultaneamente</p>
            </div>
          </div>

          <div className="md:col-span-4 rounded-[32px] bg-zinc-900/40 border border-white/10 backdrop-blur-xl p-6 flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center border border-purple-500/20 group-hover:scale-110 transition-transform">
              <PieChart className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-white font-bold">Distribuição IA</p>
              <p className="text-zinc-500 text-xs">Otimização de recursos</p>
            </div>
          </div>

          <div className="md:col-span-4 rounded-[32px] bg-zinc-900/40 border border-white/10 backdrop-blur-xl p-6 flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center border border-orange-500/20 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6 text-orange-400" />
            </div>
            <div>
              <p className="text-white font-bold">Alta Performance</p>
              <p className="text-zinc-500 text-xs">Respostas em milissegundos</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
