import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '@/hooks/use-store';
import { getMonthSummary } from '@/lib/finance';
import {
  BookOpen, AlertTriangle, Calculator, CheckCircle2,
  ChevronDown, ExternalLink, Landmark, ShieldCheck, Calendar,
  Lightbulb, XCircle, ArrowRight, Target,
} from 'lucide-react';

type TaxType = 'mei' | 'autonomo' | 'simples';

interface TaxInfo {
  label: string;
  icon: string;
  howItWorks: string[];
  ranges: { label: string; value: string }[];
  commonErrors: string[];
  practicalSteps: string[];
  routine: string[];
}

const taxData: Record<TaxType, TaxInfo> = {
  mei: {
    label: 'MEI',
    icon: '🏷️',
    howItWorks: [
      'O MEI paga um valor fixo por mês, independente do quanto faturou.',
      'Esse valor é atualizado todo ano e inclui INSS + impostos da sua atividade.',
      'Não precisa fazer cálculos complicados: é um boleto só, chamado DAS.',
      'Limite de faturamento anual: R$ 81.000 (ou ~R$ 6.750/mês).',
    ],
    ranges: [
      { label: 'Comércio e Indústria', value: 'R$ 75 – R$ 85/mês' },
      { label: 'Serviços', value: 'R$ 79 – R$ 90/mês' },
      { label: 'Comércio + Serviços', value: 'R$ 80 – R$ 91/mês' },
    ],
    commonErrors: [
      'Não pagar o DAS todo mês, mesmo sem faturamento.',
      'Ultrapassar o limite de R$ 81 mil/ano sem perceber.',
      'Esquecer da Declaração Anual (DASN-SIMEI) — prazo até 31 de maio.',
      'Confundir faturamento bruto com lucro na hora de avaliar o limite.',
    ],
    practicalSteps: [
      'Acesse o Portal do Empreendedor e gere o boleto DAS todo mês.',
      'Anote tudo que entrou de receita — mesmo valores pequenos.',
      'Separe o valor do DAS no início do mês, antes de gastar.',
      'Programe um lembrete mensal para pagar até o dia 20.',
      'Faça a Declaração Anual (DASN-SIMEI) no início do ano.',
    ],
    routine: [
      'Todo dia 1º: verificar se já gerou o boleto DAS do mês.',
      'Todo dia 15: conferir se o faturamento do mês está dentro do limite.',
      'Todo dia 20: pagar o DAS (evite atrasos para não gerar multa).',
      'Todo mês: anotar receita total no app.',
      'Todo janeiro: verificar se precisa fazer a DASN-SIMEI.',
    ],
  },
  autonomo: {
    label: 'Autônomo',
    icon: '👤',
    howItWorks: [
      'O autônomo paga imposto com base no que recebe, usando o carnê-leão.',
      'Todo mês é preciso calcular o que recebeu e gerar a guia de pagamento.',
      'O imposto principal é o IRPF (Imposto de Renda), que varia de 0% a 27,5%.',
      'Além disso, precisa recolher o INSS por conta própria.',
    ],
    ranges: [
      { label: 'Faturamento até R$ 2.259/mês', value: 'Isento de IR' },
      { label: 'R$ 2.260 a R$ 4.600/mês', value: '~7,5% a 15% de IR' },
      { label: 'Acima de R$ 4.600/mês', value: '~22,5% a 27,5% de IR' },
      { label: 'INSS (contribuinte individual)', value: '11% a 20% do salário mínimo' },
    ],
    commonErrors: [
      'Não recolher o carnê-leão mensal e acumular dívida.',
      'Esquecer de pagar o INSS (fica sem aposentadoria).',
      'Não guardar recibos e notas — dificulta a declaração anual.',
      'Misturar conta pessoal com conta do trabalho.',
    ],
    practicalSteps: [
      'Acesse o sistema do carnê-leão no site da Receita Federal.',
      'Informe os recebimentos do mês para gerar a guia de imposto.',
      'Pague o DARF (guia de IR) até o último dia útil do mês seguinte.',
      'Pague o GPS (guia do INSS) até o dia 15 do mês seguinte.',
      'Guarde todos os comprovantes e recibos organizados.',
    ],
    routine: [
      'Toda semana: anotar recebimentos e despesas.',
      'Todo fim de mês: acessar o carnê-leão e lançar valores.',
      'Até dia 15: pagar INSS (GPS).',
      'Até o último dia útil: pagar IR (DARF) se houver valor.',
      'Todo abril: preparar a Declaração Anual do IR.',
    ],
  },
  simples: {
    label: 'Empresa (Simples)',
    icon: '🏢',
    howItWorks: [
      'O Simples Nacional unifica vários impostos em uma guia só (DAS).',
      'A alíquota varia de acordo com o faturamento dos últimos 12 meses.',
      'Quanto mais a empresa fatura, maior a faixa de imposto.',
      'O contador geralmente calcula e gera a guia para você.',
    ],
    ranges: [
      { label: 'Até R$ 180 mil/ano', value: '~4% a 6% do faturamento' },
      { label: 'R$ 180 mil a R$ 360 mil/ano', value: '~7% a 11%' },
      { label: 'R$ 360 mil a R$ 720 mil/ano', value: '~10% a 14%' },
      { label: 'Acima de R$ 720 mil/ano', value: '~14% a 19%' },
    ],
    commonErrors: [
      'Não acompanhar o faturamento acumulado — pode cair em faixa maior.',
      'Deixar o contador fazer tudo sem entender o básico.',
      'Atrasar o DAS e gerar multas e juros.',
      'Não separar dinheiro para impostos no fluxo de caixa.',
    ],
    practicalSteps: [
      'Peça ao contador a guia DAS todo mês.',
      'Confira se o valor bate com o faturamento informado.',
      'Separe de 6% a 15% do faturamento mensal para impostos.',
      'Pague o DAS até o dia 20 de cada mês.',
      'Revise trimestralmente com o contador se está na faixa certa.',
    ],
    routine: [
      'Todo início de mês: conferir guia DAS com o contador.',
      'Todo dia 20: pagar o DAS.',
      'Todo trimestre: reunião rápida com o contador.',
      'Todo janeiro: revisar enquadramento e faixas.',
      'Sempre: manter notas fiscais organizadas.',
    ],
  },
};

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } },
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.07 } } };

function Section({ title, icon: Icon, children, accent }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  accent?: string;
}) {
  const [open, setOpen] = useState(true);
  return (
    <motion.div variants={fadeUp} className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-sm overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors"
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${accent || 'bg-primary/10'}`}>
          <Icon className={`h-4 w-4 ${accent ? 'text-white' : 'text-primary'}`} />
        </div>
        <span className="text-sm font-semibold text-foreground flex-1">{title}</span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Impostos() {
  const [type, setType] = useState<TaxType>('mei');
  const info = taxData[type];
  const state = useStore();
  const month = getMonthSummary();

  const estimateRange = () => {
    const revenue = month.totalEntries;
    if (revenue <= 0) return null;
    switch (type) {
      case 'mei':
        return { min: 75, max: 91, note: 'valor fixo mensal do DAS' };
      case 'autonomo': {
        const irMin = revenue <= 2259 ? 0 : revenue * 0.075;
        const irMax = revenue <= 2259 ? 0 : revenue * 0.275;
        const inss = 1412 * 0.11;
        return { min: Math.round(irMin + inss), max: Math.round(irMax + inss), note: 'IR + INSS estimados' };
      }
      case 'simples': {
        return { min: Math.round(revenue * 0.04), max: Math.round(revenue * 0.15), note: 'alíquota varia pela faixa' };
      }
    }
  };

  const estimate = estimateRange();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-1">
        <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Landmark className="h-5 w-5 text-primary" />
          Impostos
          <span className="text-xs font-normal text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">Guia Prático</span>
        </h1>
        <p className="text-xs text-muted-foreground">Entenda seus impostos de forma simples e prática.</p>
      </motion.div>

      {/* Tax type selector */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex gap-2">
        {(['mei', 'autonomo', 'simples'] as TaxType[]).map((t) => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-medium transition-all border ${
              type === t
                ? 'bg-primary/10 border-primary/30 text-primary shadow-sm'
                : 'bg-card/50 border-border/40 text-muted-foreground hover:bg-muted/30'
            }`}
          >
            <span className="mr-1">{taxData[t].icon}</span>
            {taxData[t].label}
          </button>
        ))}
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={type}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, y: -8 }}
          variants={stagger}
          className="space-y-3"
        >
          {/* Como funciona */}
          <Section title="Como funciona" icon={BookOpen} accent="bg-blue-500/80">
            <ul className="space-y-2">
              {info.howItWorks.map((item, i) => (
                <li key={i} className="flex gap-2 text-xs text-muted-foreground leading-relaxed">
                  <ArrowRight className="h-3 w-3 text-blue-400 mt-0.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          {/* Quanto se paga */}
          <Section title="Quanto geralmente se paga" icon={Calculator} accent="bg-emerald-500/80">
            <div className="space-y-2">
              {info.ranges.map((r, i) => (
                <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-muted/20 border border-border/30">
                  <span className="text-xs text-muted-foreground">{r.label}</span>
                  <span className="text-xs font-semibold text-foreground">{r.value}</span>
                </div>
              ))}
              <p className="text-[10px] text-muted-foreground/70 flex items-center gap-1 mt-1">
                <AlertTriangle className="h-3 w-3" />
                Valores aproximados para referência. Consulte um contador para valores exatos.
              </p>
            </div>
          </Section>

          {/* Com base no seu negócio */}
          <Section title="Com base no seu negócio" icon={Target} accent="bg-primary">
            {estimate ? (
              <div className="space-y-3">
                <div className="rounded-xl bg-primary/5 border border-primary/20 p-4">
                  <p className="text-[10px] text-muted-foreground mb-2">
                    Com base na sua receita de {formatCurrency(month.totalEntries)} este mês:
                  </p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-foreground">
                      {formatCurrency(estimate.min)} – {formatCurrency(estimate.max)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">/mês</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">{estimate.note}</p>
                </div>
                <div className="rounded-lg bg-amber-500/5 border border-amber-500/20 px-3 py-2 flex items-start gap-2">
                  <AlertTriangle className="h-3 w-3 text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-[10px] text-amber-300/80 leading-relaxed">
                    Isso é uma <strong>estimativa simplificada</strong>. Não substitui o cálculo oficial de um contador. 
                    Use como referência para se organizar.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-xl bg-muted/20 border border-border/30 p-4 text-center">
                <p className="text-xs text-muted-foreground">
                  Registre receitas na aba de Movimentações para ver uma estimativa personalizada.
                </p>
              </div>
            )}
          </Section>

          {/* Erros comuns */}
          <Section title="Erros comuns" icon={XCircle} accent="bg-red-500/80">
            <ul className="space-y-2">
              {info.commonErrors.map((e, i) => (
                <li key={i} className="flex gap-2 text-xs text-muted-foreground leading-relaxed">
                  <XCircle className="h-3 w-3 text-red-400 mt-0.5 shrink-0" />
                  {e}
                </li>
              ))}
            </ul>
          </Section>

          {/* O que fazer na prática */}
          <Section title="O que fazer na prática" icon={CheckCircle2} accent="bg-emerald-500/80">
            <ol className="space-y-2">
              {info.practicalSteps.map((s, i) => (
                <li key={i} className="flex gap-2 text-xs text-muted-foreground leading-relaxed">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ol>
          </Section>

          {/* Rotina simples */}
          <Section title="Rotina simples" icon={Calendar} accent="bg-violet-500/80">
            <ul className="space-y-2">
              {info.routine.map((r, i) => (
                <li key={i} className="flex gap-2 text-xs text-muted-foreground leading-relaxed">
                  <Calendar className="h-3 w-3 text-violet-400 mt-0.5 shrink-0" />
                  {r}
                </li>
              ))}
            </ul>
          </Section>

          {/* Referências */}
          <motion.div variants={fadeUp} className="rounded-2xl border border-border/40 bg-card/30 p-4 space-y-2">
            <p className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider">Fontes confiáveis</p>
            <div className="flex flex-wrap gap-2">
              {[
                { label: 'Receita Federal', url: 'https://www.gov.br/receitafederal' },
                { label: 'Portal do Empreendedor', url: 'https://www.gov.br/empresas-e-negocios/pt-br/empreendedor' },
                { label: 'SEBRAE', url: 'https://sebrae.com.br' },
              ].map((ref) => (
                <a
                  key={ref.label}
                  href={ref.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-primary transition-colors bg-muted/20 border border-border/30 rounded-lg px-2.5 py-1.5"
                >
                  <ExternalLink className="h-2.5 w-2.5" />
                  {ref.label}
                </a>
              ))}
            </div>
          </motion.div>

          {/* Disclaimer */}
          <motion.div variants={fadeUp} className="flex items-start gap-2 px-1">
            <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground/50 mt-0.5 shrink-0" />
            <p className="text-[10px] text-muted-foreground/50 leading-relaxed">
              Este guia tem caráter educativo e orientativo. Os valores apresentados são estimativas aproximadas e não 
              substituem a consulta a um profissional contábil. Leis e valores podem mudar a cada ano.
            </p>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
