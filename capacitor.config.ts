import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.9e09372465704188b8e8946511e7f651',
  appName: 'Lucro Real',
  webDir: 'dist',
  server: {
    url: 'https://9e093724-6570-4188-b8e8-946511e7f651.lovableproject.com?forceHideBadge=true',
    cleartext: true,
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#0a0a0a',
  },
  android: {
    backgroundColor: '#0a0a0a',
  },
};

export default config;
