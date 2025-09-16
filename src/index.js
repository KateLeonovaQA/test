/**
 * Sample JavaScript file demonstrating basic functionality
 * 
 * This file contains a simple example of JavaScript code that can be used
 * as a starting point for development.
 */

// Simple function to greet a user
function greetUser(name) {
  return `Hello, ${name}! Welcome to the Test Repository.`;
}

// Function to calculate the sum of two numbers
function add(a, b) {
  return a + b;
}

// Example of using the functions
function runExample() {
  const userName = 'Developer';
  const greeting = greetUser(userName);
  console.log(greeting);
  
  const num1 = 5;
  const num2 = 10;
  const sum = add(num1, num2);
  console.log(`The sum of ${num1} and ${num2} is ${sum}`);
}

// Export functions for use in other files
module.exports = {
  greetUser,
  add,
  runExample
};