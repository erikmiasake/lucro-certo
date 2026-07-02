
# Transformar Lucro Real em App Nativo (iOS + Android)

Vou preparar seu projeto para virar um app nativo usando **Capacitor** — a ferramenta que "embrulha" seu app web em um app nativo real, pronto para App Store e Google Play.

## O que vou fazer aqui no Lovable

1. **Instalar Capacitor** e suas dependências (core, cli, ios, android).
2. **Criar o arquivo de configuração** `capacitor.config.ts` com:
   - App ID: `app.lovable.9e09372465704188b8e8946511e7f651`
   - App Name: `Lucro Real`
   - Hot-reload apontando para o sandbox do Lovable (para você testar em tempo real no celular durante desenvolvimento).
3. **Ajustar o splash screen e ícones** com a identidade Emerald Green / Lucro Real (posso gerar os ícones se quiser).
4. **Configurar StatusBar** para combinar com o tema dark premium do app.

## O que você vai precisar fazer depois (fora do Lovable)

Esta parte é obrigatória — as lojas exigem build feito no seu computador:

1. Exportar o projeto para o **GitHub** (botão "Export to Github" no topo).
2. Fazer `git pull` do repositório no seu computador.
3. Rodar:
   ```
   npm install
   npx cap add ios       # se quiser iOS (precisa Mac com Xcode)
   npx cap add android   # se quiser Android (precisa Android Studio)
   npm run build
   npx cap sync
   npx cap run ios       # ou: npx cap run android
   ```
4. Para publicar:
   - **Google Play**: conta de desenvolvedor Google ($25 uma vez), gerar APK/AAB assinado pelo Android Studio.
   - **App Store**: conta Apple Developer ($99/ano), Mac com Xcode, submeter via App Store Connect.

## Requisitos importantes

- **iOS só pode ser compilado em Mac** (limitação da Apple, não do Lovable).
- **Android pode ser compilado em Windows, Mac ou Linux**.
- Cada mudança que você fizer aqui no Lovable depois: `git pull` → `npx cap sync` → rodar de novo.

## Recursos nativos que ficam disponíveis

Depois do Capacitor instalado, posso adicionar sob demanda:
- Notificações push
- Câmera (para anexar comprovantes)
- Biometria (Face ID / impressão digital para login)
- Compartilhamento nativo
- Modo offline

## Pergunta antes de eu começar

Você quer que eu:
- **(a)** só instale e configure o Capacitor (mínimo necessário para gerar o app), ou
- **(b)** já inclua ícones personalizados + splash screen com a marca Lucro Real + StatusBar dark configurada?

Recomendo **(b)** — deixa o app com cara profissional desde a primeira build.
