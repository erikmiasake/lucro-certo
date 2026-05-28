/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
  token?: string
}

export const SignupEmail = ({
  siteName,
  recipient,
  token,
}: SignupEmailProps) => (
  <Html lang="pt-BR" dir="ltr">
    <Head />
    <Preview>Seu código de confirmação do {siteName}: {token}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Confirme seu e-mail</Heading>
        <Text style={text}>
          Olá! Use o código abaixo para confirmar seu cadastro no <strong>{siteName}</strong>.
        </Text>

        <Section style={codeBox}>
          <Text style={codeText}>{token}</Text>
        </Section>

        <Text style={text}>
          Este código foi enviado para <strong>{recipient}</strong> e expira em 60 minutos.
        </Text>
        <Text style={footer}>
          Se você não criou uma conta, pode ignorar este e-mail com segurança.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '32px 28px', maxWidth: '480px' }
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  color: '#0a0a0a',
  margin: '0 0 20px',
}
const text = {
  fontSize: '15px',
  color: '#404040',
  lineHeight: '1.55',
  margin: '0 0 20px',
}
const codeBox = {
  backgroundColor: '#f4f4f5',
  borderRadius: '12px',
  padding: '20px',
  textAlign: 'center' as const,
  margin: '28px 0',
}
const codeText = {
  fontSize: '36px',
  fontWeight: 'bold' as const,
  letterSpacing: '10px',
  color: '#10b981',
  margin: '0',
  fontFamily: 'monospace',
}
const footer = { fontSize: '12px', color: '#999999', margin: '24px 0 0' }
