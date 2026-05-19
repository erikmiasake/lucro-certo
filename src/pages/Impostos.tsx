import { Landmark } from 'lucide-react';

export default function Impostos() {
  return (
    <div className="p-5 md:p-8 max-w-4xl mx-auto safe-bottom">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Landmark className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Gestão fiscal</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Impostos</h1>
        <p className="text-muted-foreground text-sm mt-1">Gestão fiscal do seu negócio</p>
      </div>

      <div className="rounded-2xl p-6 bg-card border border-border">
        <p className="text-sm text-foreground">
          Esta seção está em desenvolvimento. Em breve você poderá acompanhar seus impostos e
          obrigações fiscais diretamente aqui.
        </p>
      </div>
    </div>
  );
}
