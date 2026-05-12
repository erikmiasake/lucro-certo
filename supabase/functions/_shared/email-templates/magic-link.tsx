/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface MagicLinkEmailProps {
  siteName: string
  confirmationUrl: string
}

export const MagicLinkEmail = ({ confirmationUrl }: MagicLinkEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Seu link de acesso ao Lucro Real</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={brandBar}>
          <Text style={brand}>Lucro Real</Text>
        </Section>
        <Heading style={h1}>Seu link de acesso</Heading>
        <Text style={text}>
          Clique no botão abaixo para entrar na sua conta. O link expira em
          alguns minutos.
        </Text>
        <Section style={{ textAlign: 'center' as const, margin: '32px 0' }}>
          <Button style={button} href={confirmationUrl}>
            Entrar
          </Button>
        </Section>
        <Text style={muted}>
          Se o botão não funcionar, copie e cole este link no navegador:
        </Text>
        <Text style={linkFallback}>{confirmationUrl}</Text>
        <Text style={footer}>
          Se você não pediu este link, pode ignorar este e-mail.
          <br />
          <Link href="https://lucroreal.live" style={footerLink}>lucroreal.live</Link>
        </Text>
      </Container>
    </Body>
  </Html>
)

export default MagicLinkEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif",
}
const container = { padding: '32px 28px', maxWidth: '560px' }
const brandBar = { paddingBottom: '24px', borderBottom: '1px solid #eef0f2', marginBottom: '28px' }
const brand = { fontSize: '18px', fontWeight: 700 as const, color: 'hsl(152, 76%, 38%)', margin: 0, letterSpacing: '-0.01em' }
const h1 = { fontSize: '24px', fontWeight: 700 as const, color: '#0f1419', margin: '0 0 16px', letterSpacing: '-0.02em' }
const text = { fontSize: '15px', color: '#3a3f46', lineHeight: '1.6', margin: '0 0 16px' }
const muted = { fontSize: '12px', color: '#8a8f96', margin: '0 0 6px' }
const linkFallback = { fontSize: '12px', color: 'hsl(152, 76%, 38%)', wordBreak: 'break-all' as const, margin: '0 0 28px' }
const footerLink = { color: 'hsl(152, 76%, 38%)', textDecoration: 'none' }
const button = { backgroundColor: 'hsl(152, 76%, 45%)', color: '#0f1419', fontSize: '15px', fontWeight: 600 as const, borderRadius: '14px', padding: '14px 28px', textDecoration: 'none', display: 'inline-block' }
const footer = { fontSize: '12px', color: '#8a8f96', margin: '32px 0 0', paddingTop: '20px', borderTop: '1px solid #eef0f2', lineHeight: '1.6' }
