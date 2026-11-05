import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {readFileSync} from 'node:fs';
export default defineConfig({plugins:[{name:'review-manifest',configureServer(server){server.middlewares.use('/api/yoruba-audio',(req,res)=>{res.setHeader('Content-Type','application/json');res.end(readFileSync(new URL('./yoruba-sample.json',import.meta.url),'utf8'));});}},react(),{name:'isolated-phone-review',enforce:'pre',load(id){
if(['/services/progressVisualizationService.ts','/services/socialLearningService.ts','/services/gameService.ts','/services/gamesUnlockService.ts','/services/streakRewardsService.ts','/context/UserContext.tsx','/hooks/useGameSounds.ts','/hooks/useTTSEnhanced.ts','/services/geminiService.ts','/services/classroomService.ts','/services/questionPerformance.ts'].some(p=>id.endsWith(p)))return readFileSync(new URL('./fixtures.ts',import.meta.url),'utf8');
}}],server:{host:'127.0.0.1',port:3010,strictPort:true},resolve:{alias:{'@':process.cwd()}}});
