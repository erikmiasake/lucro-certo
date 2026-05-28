import { Helmet } from "react-helmet-async";
import { ArrowLeft, Shield } from "lucide-react";
import { Link } from "react-router-dom";

export default function Privacy() {
  return (
    <>
      <Helmet>
        <title>Política de Privacidade — Lucro Real</title>
        <meta
          name="description"
          content="Política de Privacidade do Lucro Real. Saiba como protegemos seus dados financeiros."
        />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <header className="border-b border-border/60 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
          <div className="max-w-3xl mx-auto px-4 h-14 flex items-center gap-3">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Link>
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <span className="font-semibold text-foreground">Lucro Real</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="max-w-3xl mx-auto px-4 py-10">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            Política de Privacidade
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            Última atualização: 28 de maio de 2026
          </p>

          <div className="space-y-8 text-[15px] leading-relaxed text-foreground/90">
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                1. Dados que coletamos
              </h2>
              <p className="text-muted-foreground">
                Coletamos apenas o necessário para o funcionamento do aplicativo:
              </p>
              <ul className="mt-2 space-y-1.5 list-disc list-inside text-muted-foreground">
                <li>
                  <strong className="text-foreground">Dados de cadastro:</strong>{" "}
                  nome, e-mail e senha (criptografada) ao criar sua conta.
                </li>
                <li>
                  <strong className="text-foreground">Dados financeiros:</strong>{" "}
                  receitas, custos e movimentações que você insere manualmente no app.
                </li>
                <li>
                  <strong className="text-foreground">Dados de uso:</strong>{" "}
                  informações técnicas como tipo de dispositivo e navegador, apenas para melhorar a experiência.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                2. Como usamos seus dados
              </h2>
              <p className="text-muted-foreground">
                Seus dados financeiros são usados exclusivamente para:
              </p>
              <ul className="mt-2 space-y-1.5 list-disc list-inside text-muted-foreground">
                <li>Calcular lucro, margem e métricas do seu negócio;</li>
                <li>Gerar relatórios e insights personalizados;</li>
                <li>Sincronizar seus dados entre dispositivos logados.</li>
              </ul>
              <p className="mt-3 text-muted-foreground">
                <strong className="text-foreground">Nunca vendemos seus dados.</strong>{" "}
                Não compartilhamos suas informações financeiras com terceiros para fins de marketing.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                3. Armazenamento e segurança
              </h2>
              <p className="text-muted-foreground">
                Seus dados são armazenados em infraestrutura segura via{" "}
                <strong className="text-foreground">Lovable Cloud</strong>, com criptografia em trânsito (TLS) e em repouso. Implementamos autenticação moderna (OAuth 2.0 + JWT) e políticas de acesso rigorosas (RLS) no banco de dados.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                4. Seus direitos
              </h2>
              <p className="text-muted-foreground">
                Você pode, a qualquer momento:
              </p>
              <ul className="mt-2 space-y-1.5 list-disc list-inside text-muted-foreground">
                <li>Acessar, corrigir ou excluir seus dados;</li>
                <li>Exportar suas movimentações;</li>
                <li>Solicitar a exclusão completa da conta e todos os dados associados.</li>
              </ul>
              <p className="mt-3 text-muted-foreground">
                Para exercer esses direitos, entre em contato pelo e-mail{" "}
                <a
                  href="mailto:contato@lucroreal.live"
                  className="text-primary hover:underline"
                >
                  contato@lucroreal.live
                </a>.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                5. Cookies e tecnologias similares
              </h2>
              <p className="text-muted-foreground">
                Utilizamos cookies essenciais para manter sua sessão de login e garantir a segurança da aplicação. Não utilizamos cookies de rastreamento ou publicidade de terceiros.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                6. Alterações nesta política
              </h2>
              <p className="text-muted-foreground">
                Podemos atualizar esta Política de Privacidade periodicamente. Qualquer mudança significativa será notificada por e-mail ou dentro do aplicativo.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                7. Contato
              </h2>
              <p className="text-muted-foreground">
                Dúvidas sobre privacidade? Envie um e-mail para{" "}
                <a
                  href="mailto:contato@lucroreal.live"
                  className="text-primary hover:underline"
                >
                  contato@lucroreal.live
                </a>.
              </p>
            </section>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border/60 mt-12">
          <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Lucro Real</span>
            </div>
            <p className="text-xs text-muted-foreground">
              © 2026 Lucro Real. Todos os direitos reservados.
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
