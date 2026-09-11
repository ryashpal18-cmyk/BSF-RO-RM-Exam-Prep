import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.bsf.rorm.examprep',
  appName: 'BSF RO/RM Exam Prep',
  webDir: 'dist',
  bundledWebRuntime: false,
  android: {
    allowMixedContent: false
  },
  server: {
    androidScheme: 'https'
  }
};

export default config;
