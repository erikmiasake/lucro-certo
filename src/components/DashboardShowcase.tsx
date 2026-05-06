"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { 
  TrendingUp, 
  ArrowUpRight, 
  DollarSign, 
  LayoutDashboard,
  Sparkles,
  AlertTriangle,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BentoCardProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

const BentoCard = ({ children, className, delay = 0 }: BentoCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={cn(
        "relative rounded-[28px] bg-zinc-900/50 border border-white/8 backdrop-blur-xl overflow-hidden group",
        className
      )}
    >
      {children}
      <div className="absolute inset-0 border border-primary/0 group-hover:border-primary/20 transition-colors pointer-events-none rounded-[28px]" />
    </motion.div>
  );
};

// Profit waterfall data
const waterfallData = [
  { label: "Faturamento",    value: 100, type: "total",    color: "bg-zinc-600",  textColor: "text-zinc-300", amount: "R$ 32.000" },
  { label: "Custos Fixos",   value: 28,  type: "cost",     color: "bg-red-900/70", textColor: "text-red-400",  amount: "−R$ 9.000" },
  { label: "Custos Variáveis", value: 22, type: "cost",    color: "bg-orange-900/70", textColor: "text-orange-400", amount: "−R$ 7.000" },
  { label: "Desperdícios",   value: 12,  type: "cost",     color: "bg-yellow-900/60", textColor: "text-yellow-500", amount: "−R$ 3.800" },
  { label: "Lucro Real",     value: 38,  type: "profit",   color: "bg-primary",   textColor: "text-primary",  amount: "R$ 12.200" },
];

const WaterfallChart = () => {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="w-full h-full flex flex-col justify-center">
      {/* Mobile: clean table layout */}
      <div className="flex flex-col gap-0 sm:hidden">
        {waterfallData.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 + i * 0.06 }}
            className={cn(
              "flex items-center justify-between py-3 px-1",
              i < waterfallData.length - 1 && "border-b border-white/5"
            )}
          >
            <span className={cn(
              "text-xs font-semibold",
              item.type === "profit" ? "text-primary" : "text-zinc-400"
            )}>
              {item.label}
            </span>
            <span className={cn(
              "text-sm font-bold tabular-nums",
              item.type === "profit" ? "text-primary" : item.type === "cost" ? item.textColor : "text-zinc-300"
            )}>
              {item.amount}
            </span>
          </motion.div>
        ))}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.8, duration: 0.6 }}
          className="flex items-center justify-between pt-3 mt-1 border-t border-white/8"
        >
          <span className="text-zinc-600 text-[10px] uppercase tracking-widest">Margem de lucro</span>
          <span className="text-primary text-xs font-bold">38%</span>
        </motion.div>
      </div>

      {/* Desktop: bar chart layout */}
      <div className="hidden sm:flex flex-col gap-3">
        {waterfallData.map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + i * 0.08, ease: "easeOut" }}
            className="flex items-center gap-3 cursor-default"
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
          >
            <div className="w-[130px] shrink-0 text-right">
              <span className={cn(
                "text-[11px] font-semibold transition-colors duration-200",
                item.type === "profit" ? "text-primary" : hovered === i ? "text-white" : "text-zinc-500"
              )}>
                {item.label}
              </span>
            </div>
            <div className="flex-1 relative h-7 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${item.value}%` }}
                transition={{ duration: 0.6, delay: 0.4 + i * 0.08, ease: "easeOut" }}
                className={cn(
                  "h-full rounded-full",
                  item.type === "profit"
                    ? "bg-primary shadow-[0_0_20px_rgba(16,185,129,0.55)]"
                    : item.color,
                  hovered === i && item.type !== "profit" ? "brightness-125" : ""
                )}
              />
            </div>
            <div className="w-[80px] shrink-0">
              <span className={cn(
                "text-[11px] font-bold tabular-nums",
                item.type === "profit" ? "text-primary" : item.textColor
              )}>
                {item.amount}
              </span>
            </div>
          </motion.div>
        ))}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 0.6 }}
          className="flex justify-end items-center gap-2 pt-2 border-t border-white/5 mt-1"
        >
          <span className="text-zinc-600 text-[10px] uppercase tracking-widest">Margem de lucro</span>
          <span className="text-primary text-[11px] font-bold">38%</span>
        </motion.div>
      </div>
    </div>
  );
};

interface DashboardShowcaseProps {
  onCtaClick?: () => void;
}

export default function DashboardShowcase({ onCtaClick }: DashboardShowcaseProps) {
  return (
    <section className="relative w-full min-h-screen bg-[#030303] overflow-hidden pt-32 pb-24 px-6">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] opacity-50" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] opacity-30" />
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
              asChild
              size="lg" 
              className="w-full sm:w-auto h-12 px-8 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-[0_0_20px_rgba(20,184,105,0.3)] font-semibold group"
            >
              <Link to="/login">
                Começar agora
                <ArrowUpRight className="ml-2 w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="w-full sm:w-auto h-12 px-8 rounded-xl border-white/10 bg-white/5 hover:bg-white/10 text-white transition-all backdrop-blur-md"
              asChild
            >
              <Link to="/como-funciona">Ver como funciona</Link>
            </Button>
          </motion.div>
        </div>

        {/* Interactive Bento Grid */}
        <div className="w-full grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 px-4">
          
          {/* Main Waterfall Chart Card */}
          <BentoCard className="md:col-span-8 h-auto min-h-[340px] md:min-h-[420px] p-6 md:p-8" delay={0.4}>
            <div className="flex items-start justify-between mb-6 md:mb-8">
              <div>
                <h3 className="text-base md:text-xl font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 md:w-5 md:h-5 text-primary shrink-0" />
                  De onde vem o seu lucro real?
                </h3>
                <p className="text-zinc-500 text-xs md:text-sm mt-1">Decomposição do faturamento — últimos 30 dias</p>
              </div>
              <div className="shrink-0 text-[10px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/20">
                30 dias
              </div>
            </div>
            
            <WaterfallChart />
          </BentoCard>

          {/* Right Column */}
          <div className="md:col-span-4 flex flex-col gap-4 md:gap-6">
            
            {/* Saldo Atual Card */}
            <BentoCard className="flex-1 p-5 md:p-6 flex flex-col justify-between" delay={0.5}>
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 text-primary">
                  <DollarSign className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">+12.4%</span>
              </div>
              <div className="mt-4">
                <p className="text-zinc-500 text-[10px] mb-1 uppercase tracking-widest font-bold">Lucro Real do Mês</p>
                <h4 className="text-3xl md:text-4xl font-bold text-white tracking-tight">R$ 12.200</h4>
              </div>
            </BentoCard>

            {/* Actionable AI Insight Card */}
            <BentoCard className="flex-1 p-5 md:p-6 bg-primary/5 border-primary/20" delay={0.6}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-7 h-7 rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Insight da IA</span>
              </div>
              <p className="text-white text-sm leading-relaxed font-medium italic mb-3">
                "Seus desperdícios consomem 12% do faturamento. Reduzir 30% disso adicionaria R$ 1.140 ao seu lucro."
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-primary/70 font-medium">
                <Target className="w-3 h-3" />
                Meta: aumentar margem para 42%
              </div>
            </BentoCard>
          </div>

          {/* Bottom Row */}
          <BentoCard className="md:col-span-4 p-5 md:p-6 flex items-center gap-4" delay={0.7}>
            <div className="w-10 h-10 rounded-2xl bg-red-500/10 flex items-center justify-center border border-red-500/20 shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Alerta de custo</p>
              <p className="text-zinc-500 text-[10px]">Embalagens 18% acima da média</p>
            </div>
          </BentoCard>

          <BentoCard className="md:col-span-4 p-5 md:p-6 flex items-center gap-4" delay={0.75}>
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
              <LayoutDashboard className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-white font-bold text-sm">Controle Total</p>
              <p className="text-zinc-500 text-[10px]">Visibilidade 360° do seu caixa</p>
            </div>
          </BentoCard>

          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 1 }}
            viewport={{ once: true }}
            className="md:col-span-4 flex items-center justify-center text-zinc-600 text-[10px] uppercase tracking-widest font-medium"
          >
            +500 empresas gerenciam com Lucro Real
          </motion.div>

        </div>
      </div>
    </section>
  );
}
