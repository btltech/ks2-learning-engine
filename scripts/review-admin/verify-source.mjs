// Compare behavior-bearing source against the exact main revision used for PR C.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
const files=['AdminConsole','AnalyticsDashboard','QuestionQualityDashboard','CurriculumCoverageDashboard','CloudBankMonitor'];
const evidence=[];
for(const file of files){
 const path='components/'+file+'.tsx';
 const parse=source=>ts.createSourceFile(path,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 const old=parse(execFileSync('git',['show','3144ae86:'+path],{encoding:'utf8'})),now=parse(readFileSync(path,'utf8'));
 const project=source=>{
  const effects=[],functions={},actions=[],labels=[],testIds=[],loggingAndRequests=[];
  const hasJsx=node=>{let found=false;const visit=n=>{if(ts.isJsxElement(n)||ts.isJsxSelfClosingElement(n))found=true;ts.forEachChild(n,visit);};visit(node);return found;};
  const compact=node=>node.getText(source).replace(/\s+/g,' ');
  const visit=node=>{
   if(ts.isCallExpression(node)&&['useEffect','useMemo'].includes(node.expression.getText(source))&&!hasJsx(node))effects.push(compact(node));
   if(ts.isCallExpression(node)&&/^(console\.(log|info|warn|error)|fetch|window\.confirm|window\.alert)$/.test(node.expression.getText(source)))loggingAndRequests.push(compact(node));
   if(ts.isVariableDeclaration(node)&&node.initializer&&(ts.isArrowFunction(node.initializer)||ts.isFunctionExpression(node.initializer))&&!hasJsx(node.initializer))functions[node.name.getText(source)]=compact(node.initializer);
   if(ts.isFunctionDeclaration(node)&&!hasJsx(node))functions[node.name?.getText(source)]=compact(node);
   if(ts.isJsxAttribute(node)){const name=node.name.getText(source);if(['onClick','onChange'].includes(name))actions.push(compact(node));if(name==='aria-label')labels.push(compact(node));if(name==='data-testid')testIds.push(compact(node));}
   ts.forEachChild(node,visit);
  };visit(source);return {effects,functions,actions,labels,testIds,loggingAndRequests};
 };
 const a=project(old),b=project(now);assert.deepEqual(b.loggingAndRequests,a.loggingAndRequests,path+' logging, fetch, confirmation calls');assert.deepEqual(b.effects,a.effects,path+' effects/dependencies');assert.deepEqual(b.functions,a.functions,path+' handlers/calculations');assert.deepEqual(b.actions,a.actions,path+' click/change actions');assert.deepEqual(b.testIds,a.testIds,path+' test ids');for(const label of a.labels)assert(b.labels.includes(label),path+' existing accessible label');
 evidence.push({path,effects:a.effects.length,loggingAndRequestCalls:a.loggingAndRequests.length,functions:Object.keys(a.functions),unchangedClickChangeActions:a.actions.length,existingLabelsPreserved:a.labels.length,testIdsPreserved:a.testIds.length});
}
for(const path of ['App.tsx','components/layout/AppShells.tsx','components/Toast.tsx'])assert.equal(readFileSync(path,'utf8'),execFileSync('git',['show','3144ae86:'+path],{encoding:'utf8'}),path+' unchanged (role gates, modal confirmations, toast behavior)');
console.log(JSON.stringify({baseline:'3144ae86',checks:'Existing effects/dependencies, non-JSX handlers/calculations, click/change payloads, logging/fetch/confirmation calls, test IDs and accessible labels unchanged; App role gates, shared modal and toast source unchanged',files:evidence},null,2));
