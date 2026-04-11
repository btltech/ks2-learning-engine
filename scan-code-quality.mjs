#!/usr/bin/env node

/**
 * Code Quality Bug Scan
 * Scans TypeScript/React code for common bug patterns
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const issues = [];
const warnings = [];

// Common bug patterns to check
const patterns = {
  // Missing cleanup in useEffect
  useEffectNoCleanup: /useEffect\(\(\)\s*=>\s*\{[^}]*?(setInterval|setTimeout|addEventListener|onSnapshot|subscribe)[^}]*?\},\s*\[/g,
  
  // Empty catch blocks (silently swallowing errors)
  emptyCatch: /catch\s*\([^)]*\)\s*\{\s*\}/g,
  
  // Missing dependencies in useCallback/useMemo
  missingDeps: /(useCallback|useMemo)\([^,]+,\s*\[\s*\]\)/g,
  
  // Direct state mutation
  stateMutation: /setState\([^()]*\.[^=]+=|setState\([^()]*\.push\(|setState\([^()]*\.pop\(/g,
  
  // Comparing with null/undefined using ==
  looseEquality: /[^=!]={2}[^=].*?(null|undefined)/g,
  
  // Missing error handling in promises
  unhandledPromise: /\.then\([^)]+\)[^.;]*;/g,
  
  // Console statements (should use proper logging)
  consoleStatements: /console\.(log|debug|info)\(/g,
};

function scanFile(filePath) {
  if (!filePath.match(/\.(ts|tsx)$/)) return;
  if (filePath.includes('node_modules')) return;
  if (filePath.includes('.test.')) return;
  if (filePath.includes('public/')) return;
  
  try {
    const content = readFileSync(filePath, 'utf8');
    const fileName = filePath.replace(process.cwd() + '/', '');
    
    // Check for useEffect without cleanup
    const effectMatches = content.match(/useEffect\([^]*?\},\s*\[[^\]]*\]\)/g);
    if (effectMatches) {
      effectMatches.forEach(effect => {
        const hasInterval = effect.includes('setInterval') || effect.includes('setTimeout');
        const hasListener = effect.includes('addEventListener') || effect.includes('onSnapshot') || effect.includes('subscribe');
        const hasCleanup = effect.includes('return ()') || effect.includes('return function');
        
        if ((hasInterval || hasListener) && !hasCleanup) {
          warnings.push(`⚠️  ${fileName}: Potential memory leak - useEffect with ${hasInterval ? 'timer' : 'listener'} missing cleanup`);
        }
      });
    }
    
    // Check for empty catch blocks
    if (patterns.emptyCatch.test(content)) {
      warnings.push(`⚠️  ${fileName}: Empty catch block - errors being silently swallowed`);
    }
    
    // Check for loose equality with null/undefined
    const looseEqMatches = content.match(patterns.looseEquality);
    if (looseEqMatches && looseEqMatches.length > 0) {
      warnings.push(`⚠️  ${fileName}: Using == with null/undefined (use === instead)`);
    }
    
    // Check for excessive console statements
    const consoleMatches = content.match(patterns.consoleStatements);
    if (consoleMatches && consoleMatches.length > 5) {
      warnings.push(`⚠️  ${fileName}: ${consoleMatches.length} console.log statements (consider removing before production)`);
    }
    
    // Check for React anti-patterns
    if (filePath.match(/\.(tsx)$/)) {
      // Check for setState in render
      if (content.includes('return (') || content.includes('return(')) {
        const lines = content.split('\n');
        let inRender = false;
        let braceCount = 0;
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          
          if (line.includes('return (') || line.includes('return(')) {
            inRender = true;
            braceCount = 0;
          }
          
          if (inRender) {
            braceCount += (line.match(/\(/g) || []).length;
            braceCount -= (line.match(/\)/g) || []).length;
            
            if (line.match(/setState|setUser|set[A-Z]/)) {
              issues.push(`❌ ${fileName}:${i+1}: setState called during render - will cause infinite loop`);
            }
            
            if (braceCount === 0 && line.includes(';')) {
              inRender = false;
            }
          }
        }
      }
      
      // Check for missing key in map
      const mapMatches = content.match(/\.map\([^)]*=>/g);
      if (mapMatches) {
        const lines = content.split('\n');
        lines.forEach((line, i) => {
          if (line.includes('.map(') && line.includes('=>') && !line.includes('key=')) {
            const nextLine = lines[i + 1] || '';
            if (!nextLine.includes('key=')) {
              warnings.push(`⚠️  ${fileName}:${i+1}: .map() without key prop`);
            }
          }
        });
      }
    }
    
  } catch (err) {
    // Skip files we can't read
  }
}

function scanDirectory(dir) {
  try {
    const items = readdirSync(dir);
    
    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        if (!item.startsWith('.') && item !== 'node_modules' && item !== 'dist' && item !== 'build') {
          scanDirectory(fullPath);
        }
      } else {
        scanFile(fullPath);
      }
    }
  } catch (err) {
    // Skip directories we can't read
  }
}

console.log('\n🔍 CODE QUALITY BUG SCAN\n');
console.log('='.repeat(70));

const srcDir = join(process.cwd(), 'src');
const componentsDir = join(process.cwd(), 'components');
const servicesDir = join(process.cwd(), 'services');
const contextDir = join(process.cwd(), 'context');
const hooksDir = join(process.cwd(), 'hooks');

console.log('\n📊 Scanning codebase for common bugs...\n');

if (existsSync(srcDir)) scanDirectory(srcDir);
if (existsSync(componentsDir)) scanDirectory(componentsDir);
if (existsSync(servicesDir)) scanDirectory(servicesDir);
if (existsSync(contextDir)) scanDirectory(contextDir);
if (existsSync(hooksDir)) scanDirectory(hooksDir);

// Summary
console.log('\n' + '='.repeat(70));
console.log('\n📊 CODE QUALITY SCAN SUMMARY\n');

console.log(`❌ Critical Issues: ${issues.length}`);
if (issues.length > 0) {
  issues.forEach(issue => console.log(`   ${issue}`));
} else {
  console.log('   ✅ No critical issues found');
}

console.log(`\n⚠️  Warnings: ${warnings.length}`);
if (warnings.length > 0) {
  // Group warnings by type
  const grouped = {};
  warnings.forEach(w => {
    const type = w.split(':')[1]?.split('-')[0]?.trim() || 'Other';
    if (!grouped[type]) grouped[type] = [];
    grouped[type].push(w);
  });
  
  Object.entries(grouped).forEach(([type, items]) => {
    console.log(`\n   ${type} (${items.length}):`);
    items.slice(0, 5).forEach(item => console.log(`   ${item}`));
    if (items.length > 5) {
      console.log(`   ... and ${items.length - 5} more`);
    }
  });
} else {
  console.log('   ✅ No warnings');
}

if (issues.length === 0 && warnings.length === 0) {
  console.log('\n✅ Code quality looks good!');
}

console.log('\n' + '='.repeat(70));
console.log('\n');

function existsSync(path) {
  try {
    statSync(path);
    return true;
  } catch {
    return false;
  }
}

process.exit(issues.length > 0 ? 1 : 0);
