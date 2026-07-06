import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Copy, Check, ArrowLeft, Sparkles, ShieldCheck } from "lucide-react";

const mcpUrl = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/mcp`;

export default function Connect() {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(mcpUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <>
      <Helmet>
        <title>Conectar assistente IA — Lucro Real</title>
        <meta
          name="description"
          content="Conecte o Lucro Real ao ChatGPT ou Claude e converse com suas receitas, custos e lucro pelo assistente."
        />
      </Helmet>

      <main className="min-h-screen bg-background text-foreground">
        <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>

          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-5 w-5 text-primary" />
            <p className="text-xs uppercase tracking-wider text-primary font-semibold">
              Agent Integrations
            </p>
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
            Conectar um assistente ao Lucro Real
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Conecte o ChatGPT ou o Claude à sua conta para consultar receitas,
            custos e lucro — e adicionar movimentações — direto pelo assistente.
          </p>

          {/* MCP URL */}
          <section className="mt-8 rounded-2xl border border-primary/15 bg-card/60 backdrop-blur p-4 sm:p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              URL do servidor
            </p>
            <div className="mt-2 flex items-center gap-2">
              <code className="flex-1 text-xs sm:text-sm font-mono bg-secondary/50 border border-primary/10 rounded-lg px-3 py-2.5 overflow-x-auto whitespace-nowrap">
                {mcpUrl}
              </code>
              <button
                onClick={copy}
                className="shrink-0 h-10 px-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 inline-flex items-center gap-1.5"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copiado" : "Copiar"}
              </button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Você fará login com sua conta Lucro Real ao conectar. O assistente
              só acessa os seus próprios dados.
            </p>
          </section>

          {/* ChatGPT */}
          <section className="mt-6 rounded-2xl border border-primary/15 bg-card/60 backdrop-blur p-4 sm:p-5">
            <h2 className="text-lg font-semibold">ChatGPT</h2>
            <ol className="mt-3 space-y-2.5 text-sm text-foreground/90 list-decimal pl-5">
              <li>
                Abra{" "}
                <a
                  className="text-primary hover:underline"
                  href="https://chatgpt.com/#settings/Connectors/Advanced"
                  target="_blank"
                  rel="noreferrer"
                >
                  chatgpt.com/#settings/Connectors/Advanced
                </a>{" "}
                e ative o <strong>Developer mode</strong> (leia o aviso mostrado ali).
              </li>
              <li>
                No menu <strong>“+”</strong> do campo de mensagem, ative o
                Developer mode.
              </li>
              <li>
                Clique em <strong>Add sources</strong> e depois em{" "}
                <strong>Connect more</strong>.
              </li>
              <li>Dê um nome ao conector e cole a URL acima.</li>
              <li>Peça ao ChatGPT para usar o Lucro Real.</li>
            </ol>
          </section>

          {/* Claude */}
          <section className="mt-6 rounded-2xl border border-primary/15 bg-card/60 backdrop-blur p-4 sm:p-5">
            <h2 className="text-lg font-semibold">Claude</h2>
            <ol className="mt-3 space-y-2.5 text-sm text-foreground/90 list-decimal pl-5">
              <li>
                Abra{" "}
                <a
                  className="text-primary hover:underline"
                  href="https://claude.ai/customize/connectors?modal=add-custom-connector"
                  target="_blank"
                  rel="noreferrer"
                >
                  claude.ai/customize/connectors
                </a>
                .
              </li>
              <li>Dê um nome ao conector e cole a URL acima.</li>
              <li>
                Ative o conector no campo de mensagem e peça ao Claude para usar
                o Lucro Real.
              </li>
            </ol>
          </section>

          <p className="mt-6 text-xs text-muted-foreground">
            O assistente pode consultar seu resumo do mês, listar receitas e
            custos e adicionar novas movimentações — sempre em nome da sua
            conta.
          </p>
        </div>
      </main>
    </>
  );
}
