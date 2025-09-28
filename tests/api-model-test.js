/**
 * Test script for the Control AI API model selection feature
 * 
 * This script tests the ability to specify different AI models in API requests
 */

const fetch = require('node-fetch');
const assert = require('assert');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3000/api/ai';
const API_KEY = process.env.TEST_API_KEY || 'ctrl-testkeyxxxxxxxx'; // Replace with a valid test API key

// Test cases
const testCases = [
  {
    name: 'Top-level model parameter',
    body: {
      api_key: API_KEY,
      prompt: 'Say hello',
      model: 'openai/gpt-3.5-turbo'
    },
    expectedModel: 'openai/gpt-3.5-turbo'
  },
  {
    name: 'Options-level model parameter',
    body: {
      api_key: API_KEY,
      prompt: 'Say hello',
      options: {
        model: 'openai/gpt-4'
      }
    },
    expectedModel: 'openai/gpt-4'
  },
  {
    name: 'Both model parameters (top-level should take precedence)',
    body: {
      api_key: API_KEY,
      prompt: 'Say hello',
      model: 'anthropic/claude-2',
      options: {
        model: 'openai/gpt-4'
      }
    },
    expectedModel: 'anthropic/claude-2'
  },
  {
    name: 'No model parameter (should use default from tier)',
    body: {
      api_key: API_KEY,
      prompt: 'Say hello'
    },
    expectedModel: null // Will be filled in with the default model from the tier
  }
];

// Run tests
async function runTests() {
  console.log('Starting API model selection tests...');
  console.log(`API URL: ${API_URL}`);
  console.log(`API Key: ${API_KEY.substring(0, 8)}...`);
  console.log('-----------------------------------');

  let passedTests = 0;
  let failedTests = 0;

  for (const test of testCases) {
    try {
      console.log(`Running test: ${test.name}`);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(test.body)
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error(`  ❌ Test failed with status ${response.status}: ${data.error || 'Unknown error'}`);
        failedTests++;
        continue;
      }

      // Check if the response contains the expected model
      if (test.expectedModel === null) {
        console.log(`  ✅ Test passed: Default model used (${data.model})`);
        passedTests++;
      } else if (data.model === test.expectedModel) {
        console.log(`  ✅ Test passed: Model ${data.model} matches expected model`);
        passedTests++;
      } else {
        console.error(`  ❌ Test failed: Expected model ${test.expectedModel}, got ${data.model}`);
        failedTests++;
      }
    } catch (error) {
      console.error(`  ❌ Test failed with error: ${error.message}`);
      failedTests++;
    }
    
    console.log('-----------------------------------');
  }

  console.log(`Test summary: ${passedTests} passed, ${failedTests} failed`);
  
  if (failedTests > 0) {
    process.exit(1);
  }
}

// Run the tests
runTests().catch(error => {
  console.error(`Error running tests: ${error.message}`);
  process.exit(1);
});