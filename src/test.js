/**
 * Test file for index.js functions
 * 
 * This file contains simple tests for the functions defined in index.js.
 */

const { greetUser, add } = require('./index');

// Test greetUser function
console.log('Testing greetUser function:');
const greeting = greetUser('Tester');
const expectedGreeting = 'Hello, Tester! Welcome to the Test Repository.';
console.log(`Actual: "${greeting}"`);
console.log(`Expected: "${expectedGreeting}"`);
console.log(`Test ${greeting === expectedGreeting ? 'PASSED' : 'FAILED'}`);

// Test add function
console.log('\nTesting add function:');
const sum = add(3, 7);
const expectedSum = 10;
console.log(`Actual: ${sum}`);
console.log(`Expected: ${expectedSum}`);
console.log(`Test ${sum === expectedSum ? 'PASSED' : 'FAILED'}`);

console.log('\nAll tests completed.');