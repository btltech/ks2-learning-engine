import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { execFileSync } from 'node:child_process';
import { relative } from 'node:path';
const baseline=process.env.REVIEW_BASELINE==='1';
const stubs=['/context/UserContext.tsx','/hooks/useGameSounds.ts','/services/teacherWorkspaceService.ts','/services/teacherAnalyticsService.ts','/services/homeworkService.ts','/services/classroomService.ts','/services/geminiService.ts'];
const originals=['TeacherDashboard','TeacherHomeView','EnhancedTeacherDashboard','ClassroomMode'];
export default defineConfig({plugins:[react(),{name:'synthetic-teacher-review',enforce:'pre',load(id){
 if(stubs.some(suffix=>id.endsWith(suffix)))return 'export * from "/scripts/review-teacher/fixtures.ts";';
 if(baseline&&originals.some(name=>id.endsWith('/components/'+name+'.tsx')))return execFileSync('git',['show','5da9936d:'+relative(process.cwd(),id)],{encoding:'utf8'});
}}],optimizeDeps:{entries:['scripts/review-teacher/index.html']},server:{host:'127.0.0.1',port:baseline?3014:3013,strictPort:true}});
