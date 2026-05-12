/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Seu código de verificação do Lucro Real</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={brandBar}>
          <Text style={brand}>Lucro Real</Text>
        </Section>
        <Heading style={h1}>Confirme sua identidade</Heading>
        <Text style={text}>
          Use o código abaixo para confirmar sua identidade:
        </Text>
        <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
          <Text style={codeStyle}>{token}</Text>
        </Section>
        <Text style={footer}>
          Este código expira em alguns minutos. Se você não solicitou,
          ignore este e-mail.
          <br />
          <Link href="https://lucroreal.live" style={footerLink}>lucroreal.live</Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif" }
const container = { padding: '32px 28px', maxWidth: '560px' }
const brandBar = { paddingBottom: '24px', borderBottom: '1px solid #eef0f2', marginBottom: '28px' }
const brand = { fontSize: '18px', fontWeight: 700 as const, color: 'hsl(152, 76%, 38%)', margin: 0, letterSpacing: '-0.01em' }
const h1 = { fontSize: '24px', fontWeight: 700 as const, color: '#0f1419', margin: '0 0 16px', letterSpacing: '-0.02em' }
const text = { fontSize: '15px', color: '#3a3f46', lineHeight: '1.6', margin: '0 0 16px' }
const footerLink = { color: 'hsl(152, 76%, 38%)', textDecoration: 'none' }
const codeStyle = {
  fontFamily: "'SF Mono', Menlo, Monaco, Consolas, monospace",
  fontSize: '32px',
  fontWeight: 700 as const,
  color: '#0f1419',
  letterSpacing: '0.4em',
  backgroundColor: '#f5f7fa',
  borderRadius: '14px',
  padding: '20px 24px',
  display: 'inline-block',
  margin: 0,
}
const footer = { fontSize: '12px', color: '#8a8f96', margin: '32px 0 0', paddingTop: '20px', borderTop: '1px solid #eef0f2', lineHeight: '1.6' }
