## Objetivo

Adicionar o botão **Continuar com Google** na tela de login (e cadastro) usando o Google OAuth gerenciado pelo Lovable Cloud, sem precisar de credenciais próprias.

## O que será feito

1. **Habilitar Google OAuth gerenciado** via `configure_social_auth(["google"])`. Isso gera o módulo `src/integrations/lovable/` e instala `@lovable.dev/cloud-auth-js`. Email/senha permanece habilitado.

2. **Atualizar `src/components/ui/login.tsx`** (`AuthFormSplitScreen`):
   - Adicionar nova prop `onGoogleSignIn?: () => Promise<void>`.
   - Renderizar um botão **Continuar com Google** acima do formulário de e-mail/senha, com ícone do Google e divisor "ou continue com e-mail".
   - Estilo consistente com o tema escuro premium e botão primário Emerald.

3. **Atualizar `src/pages/Auth.tsx`**:
   - Implementar `handleGoogleSignIn` chamando `lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin })`.
   - Tratar `result.error` (toast) e `result.redirected` (apenas retornar — o navegador redireciona).
   - Passar a função para `AuthFormSplitScreen` via `onGoogleSignIn`.

4. **Pós-callback**: o `AuthGuard` já detecta a sessão; usuários OAuth chegam com `email_confirmed_at` preenchido (Google já confirma e-mail), então o fluxo de verificação não bloqueia. O redirect leva para `/` que vai para `/welcome` ou `/dashboard` dependendo do estado de onboarding.

## Verificação

- Clicar em "Continuar com Google" no `/login` redireciona para a tela de consentimento do Google.
- Após autorizar, o usuário cai logado no app sem passar por verificação de e-mail.
- Login com e-mail/senha continua funcionando exatamente como antes.

## Fora do escopo

- Apple Sign-In, outros provedores.
- BYOK (credenciais Google próprias) — usaremos as gerenciadas pelo Lovable Cloud.
