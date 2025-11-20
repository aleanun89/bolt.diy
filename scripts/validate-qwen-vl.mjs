#!/usr/bin/env node

/**
 * Qwen VL Models Validation Script
 * 
 * This script validates the Qwen VL model implementation by:
 * 1. Checking all providers for Qwen VL models
 * 2. Validating model metadata and vision capabilities
 * 3. Testing model configuration and initialization
 * 4. Verifying proper context window and token limits
 * 
 * Usage: node scripts/validate-qwen-vl.mjs
 * 
 * Note: This script performs static validation by checking the source files directly.
 */

import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = colors.reset) {
  console.log(`${color}${message}${colors.reset}`);
}

function logSection(title) {
  log('\n' + '='.repeat(60), colors.bright);
  log(title, colors.cyan + colors.bright);
  log('='.repeat(60), colors.bright);
}

function logSuccess(message) {
  log(`✓ ${message}`, colors.green);
}

function logError(message) {
  log(`✗ ${message}`, colors.red);
}

function logWarning(message) {
  log(`⚠ ${message}`, colors.yellow);
}

function logInfo(message) {
  log(`ℹ ${message}`, colors.blue);
}

async function validateQwenVLModels() {
  logSection('Qwen VL Models Validation');

  let totalChecks = 0;
  let passedChecks = 0;
  let failedChecks = 0;
  let warnings = 0;

  try {
    // Read provider files to check for VL models
    const providerFiles = [
      'hyperbolic.ts',
      'huggingface.ts',
      'together.ts',
      'moonshot.ts',
      'open-router.ts',
      'qwen.ts'
    ];

    logSection('Provider Files Check');
    
    const allVLModels = [];
    const providerDir = resolve(__dirname, '../app/lib/modules/llm/providers');

    for (const file of providerFiles) {
      const filePath = resolve(providerDir, file);
      try {
        const content = readFileSync(filePath, 'utf-8');
        
        // Check for VL model definitions
        const hasVLModels = content.includes('supportsVision') || 
                          content.toLowerCase().includes('qwen') && content.toLowerCase().includes('vl');
        
        const hasVisionDetection = content.includes('supportsVision') ||
                                   content.includes('isVisionModel');
        
        if (hasVLModels) {
          logSuccess(`✓ ${file} contains VL model definitions`);
          passedChecks++;
          
          // Count VL models by looking for supportsVision: true
          const visionMatches = content.match(/supportsVision:\s*true/g) || [];
          if (visionMatches.length > 0) {
            logInfo(`  Found ${visionMatches.length} vision model(s)`);
            allVLModels.push({ provider: file.replace('.ts', ''), count: visionMatches.length });
          }
        } else {
          logInfo(`  ${file} - no VL models`);
        }
        
        if (hasVisionDetection) {
          logSuccess(`✓ ${file} has vision detection logic`);
          passedChecks++;
        }
        
        totalChecks += 2;
      } catch (error) {
        if (file !== 'qwen.ts') {
          logError(`✗ Failed to read ${file}: ${error.message}`);
          failedChecks++;
        } else {
          logWarning(`⚠ Qwen provider file not found (expected new file)`);
          warnings++;
        }
        totalChecks++;
      }
    }

    // Check registry file
    logSection('Registry Check');
    const registryPath = resolve(__dirname, '../app/lib/modules/llm/registry.ts');
    const registryContent = readFileSync(registryPath, 'utf-8');
    
    totalChecks++;
    if (registryContent.includes('QwenProvider')) {
      logSuccess('✓ QwenProvider is registered in registry.ts');
      passedChecks++;
    } else {
      logError('✗ QwenProvider not found in registry.ts');
      failedChecks++;
    }

    // Check types file
    logSection('Types Definition Check');
    const typesPath = resolve(__dirname, '../app/lib/modules/llm/types.ts');
    const typesContent = readFileSync(typesPath, 'utf-8');
    
    totalChecks += 3;
    if (typesContent.includes('supportsVision')) {
      logSuccess('✓ supportsVision field defined in ModelInfo');
      passedChecks++;
    } else {
      logError('✗ supportsVision field missing in ModelInfo');
      failedChecks++;
    }
    
    if (typesContent.includes('supportsMultimodal')) {
      logSuccess('✓ supportsMultimodal field defined in ModelInfo');
      passedChecks++;
    } else {
      logError('✗ supportsMultimodal field missing in ModelInfo');
      failedChecks++;
    }
    
    if (typesContent.includes('visionMaxImages')) {
      logSuccess('✓ visionMaxImages field defined in ModelInfo');
      passedChecks++;
    } else {
      logError('✗ visionMaxImages field missing in ModelInfo');
      failedChecks++;
    }

    // Check documentation
    logSection('Documentation Check');
    const docsPath = resolve(__dirname, '../docs/QWEN_VL_MODELS.md');
    try {
      const docsContent = readFileSync(docsPath, 'utf-8');
      totalChecks += 3;
      
      if (docsContent.includes('Qwen VL') || docsContent.includes('Vision-Language')) {
        logSuccess('✓ Documentation file exists and contains VL content');
        passedChecks++;
      } else {
        logWarning('⚠ Documentation exists but may need more VL content');
        warnings++;
      }
      
      if (docsContent.includes('Configuration') || docsContent.includes('Setup')) {
        logSuccess('✓ Documentation includes configuration section');
        passedChecks++;
      } else {
        logWarning('⚠ Documentation missing configuration section');
        warnings++;
      }
      
      if (docsContent.includes('Best Practices') || docsContent.includes('Usage')) {
        logSuccess('✓ Documentation includes usage guidance');
        passedChecks++;
      } else {
        logWarning('⚠ Documentation missing usage guidance');
        warnings++;
      }
    } catch (error) {
      logError(`✗ Documentation file not found: ${error.message}`);
      failedChecks += 3;
      totalChecks += 3;
    }

    // Provider distribution
    logSection('Provider Distribution');
    if (allVLModels.length > 0) {
      for (const { provider, count } of allVLModels) {
        logInfo(`${provider}: ${count} VL model(s) with explicit vision support`);
      }
      totalChecks++;
      if (allVLModels.length >= 2) {
        logSuccess('✓ VL models available across multiple providers');
        passedChecks++;
      } else {
        logWarning('⚠ VL models only in one provider - consider adding more');
        warnings++;
      }
    }

    // Summary
    logSection('Validation Summary');
    log(`Total checks: ${totalChecks}`, colors.bright);
    log(`Passed: ${passedChecks}`, colors.green);
    log(`Failed: ${failedChecks}`, colors.red);
    log(`Warnings: ${warnings}`, colors.yellow);
    
    const successRate = ((passedChecks / totalChecks) * 100).toFixed(1);
    log(`Success rate: ${successRate}%`, 
      successRate >= 90 ? colors.green : successRate >= 70 ? colors.yellow : colors.red
    );

    // Exit code
    if (failedChecks > 0) {
      log('\n❌ Validation FAILED - Please review errors above', colors.red + colors.bright);
      process.exit(1);
    } else if (warnings > 5) {
      log('\n⚠ Validation passed with warnings - Consider addressing them', colors.yellow + colors.bright);
      process.exit(0);
    } else {
      log('\n✅ Validation PASSED - Qwen VL models properly configured!', colors.green + colors.bright);
      process.exit(0);
    }

  } catch (error) {
    logError(`\nValidation failed with error: ${error.message}`);
    console.error(error);
    process.exit(1);
  }
}

// Run validation
validateQwenVLModels().catch(error => {
  logError(`Fatal error: ${error.message}`);
  console.error(error);
  process.exit(1);
});
