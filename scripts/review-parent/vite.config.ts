import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { relative } from 'node:path';
const baseline = process.env.REVIEW_BASELINE === '1';
const baselineFiles = ['ParentHomeView','ParentDashboard','ParentMonitoringDashboard','ParentActivityLog','StruggleAlert','SubjectProgressCharts','ChildSelector','CurriculumTracking','AgeGroupedLeaderboard','ProgressNotifications'];
const stubs = ['/context/UserContext.tsx', '/services/authService.ts', '/services/firebaseAuthService.ts', '/services/geminiService.ts', '/hooks/useRealtimeListeners.ts', '/hooks/useGameSounds.ts'];
export default defineConfig({ plugins: [react(), { name: 'synthetic-parent-review', enforce: 'pre', load(id) {
  if (stubs.some(suffix => id.endsWith(suffix))) return readFileSync(new URL('./fixtures.ts', import.meta.url), 'utf8');
  if (baseline && (baselineFiles.some(name => id.endsWith('/components/' + name + '.tsx')) || id.endsWith('/components/SignIn.css'))) return execFileSync('git', ['show', 'ff97190e:' + relative(process.cwd(), id)], { encoding: 'utf8' });
} }], server: { host: '127.0.0.1', port: baseline ? 3012 : 3011, strictPort: true } });
