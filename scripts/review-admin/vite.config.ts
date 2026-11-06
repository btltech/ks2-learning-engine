import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { execFileSync } from 'node:child_process';
import { relative,resolve } from 'node:path';
import {tmpdir} from 'node:os';
const baseline=process.env.REVIEW_BASELINE==='1';
const stubs=['/context/UserContext.tsx','/hooks/useGameSounds.ts','/services/questionPerformance.ts','/services/firebaseAuthService.ts','/services/contentQualityService.ts','/services/settingsService.ts','/services/cloudBankService.ts','/services/analyticsService.ts','/services/streakRewardsService.ts'];
const originals=['AdminConsole','AnalyticsDashboard','QuestionQualityDashboard','CurriculumCoverageDashboard','CloudBankMonitor'];
export default defineConfig({cacheDir:resolve(tmpdir(),baseline?'ks2-admin-vite-before':'ks2-admin-vite-after'),plugins:[react(),{name:'synthetic-admin-review',enforce:'pre',load(id){
 if(stubs.some(suffix=>id.endsWith(suffix)))return 'export * from "/scripts/review-admin/fixtures.ts";';
 if(baseline&&originals.some(name=>id.endsWith('/components/'+name+'.tsx')))return execFileSync('git',['show','3144ae86:'+relative(process.cwd(),id)],{encoding:'utf8'});
}}],optimizeDeps:{entries:['scripts/review-admin/index.html']},server:{host:'127.0.0.1',port:baseline?3016:3015,strictPort:true}});
