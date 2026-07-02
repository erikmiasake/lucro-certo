# LucroReal — Build Nativo (iOS / Android)

Este guia prepara o projeto LucroReal para build nativo com Capacitor.

## O que já está configurado

- App ID: `live.lucroreal.app`
- App Name: `LucroReal`
- Plugins: Push Notifications, Splash Screen, Status Bar, Biometria (`capacitor-native-biometric`)
- Ícone e splash de origem: `resources/icon.png` (1024×1024) e `resources/splash.png` (2732×2732)
- Tema escuro com fundo preto

## Pré-requisitos

- Node.js 20+ (recomendado 22 LTS)
- Git
- Para Android: Android Studio (última versão estável)
- Para iOS: Mac com Xcode 15+ e conta Apple Developer

## Fluxo de build (Mac/PC)

### 1. Baixar o projeto

```bash
git clone <URL_DO_SEU_REPOSITÓRIO>
cd <nome-do-projeto>
npm install
```

> O arquivo `capacitor.config.ts` já está configurado para build de produção (o bloco `server` de hot-reload do Lovable está comentado).

### 2. Gerar ícones e splash screens nativos

```bash
npx capacitor-assets generate --iconBackgroundColor '#000000' --splashBackgroundColor '#000000' --ios --android
```

Esse comando lê os arquivos em `resources/` e cria todos os tamanhos necessários para iOS e Android.

### 3. Adicionar as plataformas (só na primeira vez)

```bash
npx cap add ios
npx cap add android
```

### 4. Build da web e sincronização

```bash
npm run build
npx cap sync
```

Ou use os scripts prontos:

```bash
npm run build:android   # build + sync android
npm run build:ios       # build + sync ios
```

### 5. Abrir no IDE nativo

```bash
npx cap open ios      # abre no Xcode
npx cap open android  # abre no Android Studio
```

## Configurações manuais importantes

### iOS (Xcode)

1. Selecione o target e configure o **Signing & Capabilities** com sua Apple Team.
2. Adicione a capability **Push Notifications**.
3. Verifique se o `Bundle Identifier` é `live.lucroreal.app`.
4. O arquivo `Info.plist` já deve conter (ou adicione se necessário):

```xml
<key>NSFaceIDUsageDescription</key>
<string>Usamos Face ID / Touch ID para facilitar seu login de forma segura.</string>
```

### Android (Android Studio)

1. Verifique em `android/app/build.gradle`:

```gradle
android {
    namespace "live.lucroreal.app"
    defaultConfig {
        applicationId "live.lucroreal.app"
        minSdkVersion 23
        targetSdkVersion 34
    }
}
```

2. Para push notifications, o FCM (Firebase Cloud Messaging) é necessário. Você precisará adicionar o `google-services.json` do Firebase no projeto Android e aplicar o plugin `com.google.gms.google-services`.

### Biometria

O plugin `capacitor-native-biometric` já está instalado. No iOS, o `NSFaceIDUsageDescription` acima é suficiente. No Android, nenhuma permissão adicional é necessária.

## Ciclo de atualização

Sempre que houver mudanças no código web:

```bash
git pull
npm install
npm run build
npx cap sync
```

Depois abra o Xcode/Android Studio e rode/build novamente.

## Publicação

### Google Play Store

- Gere um **AAB** (Android App Bundle) assinado no Android Studio.
- Conta de desenvolvedor Google: taxa única de US$ 25.

### Apple App Store

- Crie o app no App Store Connect com o bundle ID `live.lucroreal.app`.
- Conta Apple Developer: US$ 99/ano.
- No Xcode: **Product → Archive → Distribute App**.

## Importante: lembrete de hot-reload

Se quiser voltar a usar o hot-reload do Lovable durante testes locais, descomente o bloco `server` em `capacitor.config.ts`:

```ts
server: {
  url: 'https://9e093724-6570-4188-b8e8-946511e7f651.lovableproject.com?forceHideBadge=true',
  cleartext: true,
},
```

**Nunca deixe esse bloco ativo no build final** para as lojas.

---

Dúvidas? Use o Claude Code no projeto para ajustar configurações ou plugins.
