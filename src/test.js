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
console.log();
console.log();
console.log();

// Test add function
console.log('Testing add function:');
const sum = add(3, 7);
const expectedSum = 10;
console.log();
console.log();
console.log();

console.log('All tests completed.');

