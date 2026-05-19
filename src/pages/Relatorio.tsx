import { useState, useRef } from 'react';
import { useStore } from '@/hooks/use-store';
import { getMonthlySummary, type MonthlySummary } from '@/lib/finance';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Download, Loader2, AlertCircle, TrendingUp, TrendingDown, DollarSign, Target, Lightbulb, AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

interface AIReport {
  summary: string;
  diagnosis: string;
  problems: string[];
  recommendations: string[];
  conclusion: string;
}

function getMonthOptions() {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
  for (let i = 0; i < 6; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    options.push({
      value: `${d.getFullYear()}-${d.getMonth()}`,
      label: `${monthNames[d.getMonth()]} ${d.getFullYear()}`,
    });
  }
  return options;
}

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function formatDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-');
  return `${d}/${m}`;
}

export default function Relatorio() {
  const appState = useStore();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${now.getMonth()}`;
  });
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<{ summary: MonthlySummary; ai: AIReport } | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  const monthOptions = getMonthOptions();

  const handleGenerate = async () => {
    const [yearStr, monthStr] = selectedMonth.split('-');
    const year = parseInt(yearStr);
    const month = parseInt(monthStr);
    const summary = getMonthlySummary(year, month);

    if (!summary.isValid) {
      toast.error(summary.invalidReason || 'Dados insuficientes para gerar relatório confiável.');
      return;
    }

    setLoading(true);
    setReport(null);

    try {
      const { data, error } = await supabase.functions.invoke('monthly-report', {
        body: { monthlySummary: summary, businessType: appState.businessType },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setReport({ summary, ai: data as AIReport });
    } catch (e: any) {
      toast.error(e.message || 'Erro ao gerar relatório');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    try {
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import('jspdf'),
        import('html2canvas'),
      ]);
      const element = reportRef.current;
      const canvas = await html2canvas(element, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const imgWidth = pageWidth - margin * 2;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = margin;
      pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - margin * 2;
      while (heightLeft > 0) {
        pdf.addPage();
        position = margin - (imgHeight - heightLeft);
        pdf.addImage(imgData, 'JPEG', margin, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - margin * 2;
      }
      pdf.save(`relatorio-${report?.summary.monthLabel?.replace(/\s/g, '-')}.pdf`);
      toast.success('PDF baixado com sucesso!');
    } catch {
      toast.error('Erro ao gerar PDF');
    }
  };

  const s = report?.summary;
  const ai = report?.ai;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            Relatório Mensal
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Análise completa do seu mês com diagnóstico e recomendações</p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="Selecione o mês" />
          </SelectTrigger>
          <SelectContent>
            {monthOptions.map(opt => (
              <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleGenerate} disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
          {loading ? 'Analisando seus dados...' : 'Gerar Relatório'}
        </Button>
        {report && (
          <Button variant="outline" onClick={handleDownloadPDF}>
            <Download className="h-4 w-4 mr-2" />
            Baixar PDF
          </Button>
        )}
      </div>

      {/* Report Preview */}
      {report && s && ai && (
        <div ref={reportRef} className="bg-background border border-border rounded-2xl overflow-hidden" style={{ fontFamily: 'system-ui, sans-serif' }}>
          {/* Cover */}
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-8 text-center border-b border-border">
            <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-2xl font-bold text-foreground">Relatório Mensal</h2>
            <p className="text-lg text-primary font-semibold mt-1">{s.monthLabel}</p>
            <p className="text-sm text-muted-foreground mt-2">{appState.businessProfile?.name || 'Meu Negócio'}</p>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            {/* Summary Section */}
            <section>
              <SectionTitle icon={<CheckCircle className="h-5 w-5" />} title="Resumo do Mês" />
              <p className="text-sm text-muted-foreground leading-relaxed">{ai.summary}</p>
            </section>

            {/* Key Numbers */}
            <section>
              <SectionTitle icon={<DollarSign className="h-5 w-5" />} title="Números do Mês" />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MetricCard label="Faturamento" value={formatCurrency(s.revenue)} color="text-blue-600" />
                <MetricCard label="Custos" value={formatCurrency(s.costs)} color="text-red-500" />
                <MetricCard label="Lucro" value={formatCurrency(s.profit)} color={s.profit >= 0 ? 'text-emerald-600' : 'text-red-500'} />
                <MetricCard label="Margem" value={`${s.margin}%`} color="text-primary" />
              </div>
            </section>

            {/* Operational View */}
            <section>
              <SectionTitle icon={<Target className="h-5 w-5" />} title="Visão Operacional" />
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <MiniCard label="Dias operacionais" value={String(s.operatingDays)} />
                <MiniCard label="Dias com dados" value={String(s.daysWithData)} />
                <MiniCard label="Média diária" value={formatCurrency(s.avgDailyProfit)} sub="lucro" />
                <MiniCard label="Entradas registradas" value={String(s.totalEntries)} />
                <MiniCard label="Custos manuais" value={String(s.totalManualCosts)} />
                <MiniCard label="Custos fixos (mapa)" value={String(s.totalCostMapItems)} />
                {s.bestDay && <MiniCard label="Melhor dia" value={formatDate(s.bestDay.date)} sub={formatCurrency(s.bestDay.profit)} />}
                {s.worstDay && <MiniCard label="Pior dia" value={formatDate(s.worstDay.date)} sub={formatCurrency(s.worstDay.profit)} />}
                <MiniCard label="Custo/Receita" value={`${s.costPercentage}%`} />
              </div>
            </section>

            {/* Cost Breakdown */}
            <section>
              <SectionTitle icon={<TrendingDown className="h-5 w-5" />} title="Análise de Custos" />
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Fixos</span>
                  <span className="font-medium">{formatCurrency(s.totalFixed)} ({s.fixedPercentage}%)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Variáveis</span>
                  <span className="font-medium">{formatCurrency(s.totalVariable)} ({s.variablePercentage}%)</span>
                </div>
                {s.topCategories.length > 0 && (
                  <div className="mt-3 space-y-1">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Maiores Gastos</p>
                    {s.topCategories.map((cat, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{cat.name}</span>
                        <span>{formatCurrency(cat.amount)} ({cat.percentage}%)</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Diagnosis */}
            <section>
              <SectionTitle icon={<TrendingUp className="h-5 w-5" />} title="Diagnóstico" />
              <p className="text-sm text-muted-foreground leading-relaxed">{ai.diagnosis}</p>
            </section>

            {/* Problems */}
            {ai.problems.length > 0 && (
              <section>
                <SectionTitle icon={<AlertTriangle className="h-5 w-5" />} title="Pontos de Atenção" />
                <ul className="space-y-2">
                  {ai.problems.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{p}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Recommendations */}
            {ai.recommendations.length > 0 && (
              <section>
                <SectionTitle icon={<Lightbulb className="h-5 w-5" />} title="Recomendações" />
                <ul className="space-y-2">
                  {ai.recommendations.map((r, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">{r}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Goals */}
            {s.goalMonthlyProfit && (
              <section>
                <SectionTitle icon={<Target className="h-5 w-5" />} title="Meta do Mês" />
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-muted rounded-full h-3 overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(s.goalProgress, 100)}%` }} />
                  </div>
                  <span className="text-sm font-medium">{s.goalProgress}%</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatCurrency(s.profit)} de {formatCurrency(s.goalMonthlyProfit)}
                </p>
              </section>
            )}

            {/* Conclusion */}
            <section className="bg-primary/5 rounded-xl p-4 border border-primary/10">
              <p className="text-sm font-medium text-foreground">{ai.conclusion}</p>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="text-primary">{icon}</span>
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
    </div>
  );
}

function MetricCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="bg-muted/50 rounded-xl p-3 border border-border">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
  );
}

function MiniCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-muted/30 rounded-lg p-2.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold text-foreground">{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
