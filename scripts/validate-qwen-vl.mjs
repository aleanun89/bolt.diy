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
 */

import { LLMManager } from '../app/lib/modules/llm/manager.ts';

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
    // Initialize LLM Manager
    logInfo('Initializing LLM Manager...');
    const manager = LLMManager.getInstance({});
    totalChecks++;
    passedChecks++;
    logSuccess('LLM Manager initialized successfully');

    // Get all providers
    logSection('Provider Registry Check');
    const providers = manager.getAllProviders();
    logInfo(`Found ${providers.length} registered providers`);
    totalChecks++;
    passedChecks++;

    // Check for Qwen provider
    const qwenProvider = providers.find(p => p.name === 'Qwen');
    if (qwenProvider) {
      logSuccess('Qwen provider is registered');
      totalChecks++;
      passedChecks++;
    } else {
      logWarning('Qwen provider not found - check registry.ts');
      totalChecks++;
      warnings++;
    }

    // Get all static models
    logSection('Qwen VL Models Discovery');
    const allModels = manager.getStaticModelList();
    logInfo(`Total static models: ${allModels.length}`);

    // Filter Qwen models
    const qwenModels = allModels.filter(m => 
      m.name.toLowerCase().includes('qwen') || m.provider === 'Qwen'
    );
    logInfo(`Found ${qwenModels.length} Qwen models across all providers`);
    totalChecks++;
    if (qwenModels.length > 0) {
      passedChecks++;
    } else {
      logError('No Qwen models found!');
      failedChecks++;
    }

    // Filter VL models
    const vlModels = qwenModels.filter(m => 
      m.supportsVision === true || 
      m.name.toLowerCase().includes('vl') || 
      m.name.toLowerCase().includes('vision')
    );
    logInfo(`Found ${vlModels.length} Qwen VL models`);
    totalChecks++;
    if (vlModels.length > 0) {
      passedChecks++;
    } else {
      logError('No Qwen VL models found!');
      failedChecks++;
    }

    // Validate each VL model
    logSection('VL Model Validation');
    for (const model of vlModels) {
      log(`\n${colors.bright}Model: ${model.label}${colors.reset}`);
      logInfo(`  Provider: ${model.provider}`);
      logInfo(`  Name: ${model.name}`);
      
      // Check vision support flag
      totalChecks++;
      if (model.supportsVision === true) {
        logSuccess('  ✓ supportsVision: true');
        passedChecks++;
      } else {
        logWarning('  ⚠ supportsVision not explicitly set to true');
        warnings++;
      }

      // Check multimodal support
      totalChecks++;
      if (model.supportsMultimodal === true) {
        logSuccess('  ✓ supportsMultimodal: true');
        passedChecks++;
      } else {
        logWarning('  ⚠ supportsMultimodal not set');
        warnings++;
      }

      // Check vision max images
      totalChecks++;
      if (model.visionMaxImages && model.visionMaxImages > 0) {
        logSuccess(`  ✓ visionMaxImages: ${model.visionMaxImages}`);
        passedChecks++;
      } else {
        logWarning('  ⚠ visionMaxImages not set');
        warnings++;
      }

      // Check context window
      totalChecks++;
      if (model.maxTokenAllowed >= 8000) {
        logSuccess(`  ✓ maxTokenAllowed: ${model.maxTokenAllowed.toLocaleString()}`);
        passedChecks++;
      } else {
        logError(`  ✗ maxTokenAllowed too small: ${model.maxTokenAllowed}`);
        failedChecks++;
      }

      // Check completion tokens
      totalChecks++;
      if (model.maxCompletionTokens && model.maxCompletionTokens >= 2048) {
        logSuccess(`  ✓ maxCompletionTokens: ${model.maxCompletionTokens.toLocaleString()}`);
        passedChecks++;
      } else if (model.maxCompletionTokens) {
        logWarning(`  ⚠ maxCompletionTokens: ${model.maxCompletionTokens} (might be low)`);
        warnings++;
      } else {
        logWarning('  ⚠ maxCompletionTokens not set');
        warnings++;
      }
    }

    // Validate model naming conventions
    logSection('Naming Convention Check');
    for (const model of vlModels) {
      totalChecks++;
      const hasVisionIndicator = 
        model.label.toLowerCase().includes('vision') || 
        model.label.toLowerCase().includes('vl') ||
        model.label.includes('(Vision)');
      
      if (hasVisionIndicator) {
        logSuccess(`✓ ${model.label} has vision indicator in label`);
        passedChecks++;
      } else {
        logWarning(`⚠ ${model.label} missing vision indicator in label`);
        warnings++;
      }
    }

    // Check provider distribution
    logSection('Provider Distribution');
    const providerCounts = {};
    for (const model of vlModels) {
      providerCounts[model.provider] = (providerCounts[model.provider] || 0) + 1;
    }
    
    for (const [provider, count] of Object.entries(providerCounts)) {
      logInfo(`${provider}: ${count} VL model(s)`);
    }
    totalChecks++;
    if (Object.keys(providerCounts).length >= 2) {
      logSuccess('VL models available across multiple providers');
      passedChecks++;
    } else {
      logWarning('VL models only in one provider - consider adding more');
      warnings++;
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
