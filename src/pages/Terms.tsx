import { Helmet } from "react-helmet-async";
import { ArrowLeft, Shield } from "lucide-react";
import { Link } from "react-router-dom";

export default function Terms() {
  return (
    <>
      <Helmet>
        <title>Termos de Serviço — Lucro Real</title>
        <meta
          name="description"
          content="Termos de Serviço do Lucro Real. Leia as condições de uso do aplicativo."
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
            Termos de Serviço
          </h1>
          <p className="text-muted-foreground text-sm mb-8">
            Última atualização: 28 de maio de 2026
          </p>

          <div className="space-y-8 text-[15px] leading-relaxed text-foreground/90">
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                1. Aceitação dos termos
              </h2>
              <p className="text-muted-foreground">
                Ao criar uma conta e utilizar o Lucro Real, você concorda com estes Termos de Serviço. Se não concordar com qualquer parte, não utilize o aplicativo.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                2. Descrição do serviço
              </h2>
              <p className="text-muted-foreground">
                O Lucro Real é uma ferramenta de gestão financeira para empreendedores e pessoas físicas. O aplicativo permite:
              </p>
              <ul className="mt-2 space-y-1.5 list-disc list-inside text-muted-foreground">
                <li>Registrar receitas e custos;</li>
                <li>Visualizar métricas de lucro e margem;</li>
                <li>Acompanhar desempenho financeiro diário, semanal e mensal;</li>
                <li>Receber insights e sugestões de melhoria.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                3. Conta do usuário
              </h2>
              <p className="text-muted-foreground">
                Você é responsável por manter a segurança de sua conta e senha. Notifique-nos imediatamente sobre qualquer uso não autorizado.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                4. Uso aceitável
              </h2>
              <p className="text-muted-foreground">
                É proibido:
              </p>
              <ul className="mt-2 space-y-1.5 list-disc list-inside text-muted-foreground">
                <li>Utilizar o serviço para atividades ilegais ou fraudulentas;</li>
                <li>Tentar acessar dados de outros usuários sem autorização;</li>
                <li>Interferir no funcionamento normal do aplicativo;</li>
                <li>Distribuir malware ou código malicioso através do serviço.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                5. Limitação de responsabilidade
              </h2>
              <p className="text-muted-foreground">
                O Lucro Real é fornecido "como está". Não nos responsabilizamos por:
              </p>
              <ul className="mt-2 space-y-1.5 list-disc list-inside text-muted-foreground">
                <li>Decisões financeiras tomadas com base nos dados do aplicativo;</li>
                <li>Perda de dados por falha de conexão ou dispositivo do usuário;</li>
                <li>Interrupções temporárias do serviço por manutenção ou fatores externos.</li>
              </ul>
              <p className="mt-3 text-muted-foreground">
                Recomendamos sempre consultar um contador ou advisor financeiro para decisões importantes.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                6. Propriedade intelectual
              </h2>
              <p className="text-muted-foreground">
                Todo o conteúdo, design, código e marca do Lucro Real são de nossa propriedade. Você não pode copiar, modificar ou distribuir partes do aplicativo sem autorização expressa.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                7. Cancelamento e exclusão
              </h2>
              <p className="text-muted-foreground">
                Você pode cancelar sua conta a qualquer momento. Após o cancelamento, seus dados serão excluídos permanentemente em até 30 dias, conforme nossa{" "}
                <Link to="/privacy" className="text-primary hover:underline">
                  Política de Privacidade
                </Link>.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                8. Alterações nos termos
              </h2>
              <p className="text-muted-foreground">
                Podemos atualizar estes Termos periodicamente. Alterações significativas serão notificadas por e-mail ou no aplicativo. O uso continuado do serviço após alterações constitui aceitação dos novos termos.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                9. Lei aplicável
              </h2>
              <p className="text-muted-foreground">
                Estes Termos são regidos pelas leis da República Federativa do Brasil. Qualquer disputa será resolvida no foro da comarca de São Paulo/SP.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">
                10. Contato
              </h2>
              <p className="text-muted-foreground">
                Dúvidas sobre estes termos? Envie um e-mail para{" "}
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
