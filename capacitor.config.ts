// Phase 1 prep (app stores) — used only when you run the Capacitor steps in RUNBOOK.md.
import type { CapacitorConfig } from '@capacitor/cli';
const config: CapacitorConfig = {
  appId: 'app.tongshu.selector',
  appName: '通書擇日',
  webDir: 'dist',
};
export default config;
