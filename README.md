# Test Repository

Welcome to the **Test Repository** - a collaborative space for testing and development experiments.

## 🚀 Testing Instructions

### Prerequisites
Before running tests, ensure you have the following installed:
- Node.js (v18 or higher recommended)
- npm (comes with Node.js)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/KateLeonovaQA/test.git
   cd test
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

### Running Tests

#### Run All Tests
```bash
npm test
```

#### Run Tests with Coverage
```bash
npm run test:coverage
```

#### Run Tests in Watch Mode
```bash
npm run test:watch
```

#### Run Specific Test File
```bash
npm test -- path/to/test-file.js
```

### Test Structure

The test suite is organized as follows:

```
src/
├── index.js          # Main source code
└── test.js           # Test file

tests/
├── unit/            # Unit tests
├── integration/     # Integration tests
└── e2e/             # End-to-end tests
```

### Writing New Tests

1. **Create a test file** in the appropriate directory
2. **Follow the naming convention**: `*.test.js` or `*.spec.js`
3. **Use Jest testing framework** (already configured)

#### Example Test

```javascript
// tests/unit/example.test.js

describe('Example Test Suite', () => {
  test('should return correct value', () => {
    const result = greetUser('Test User');
    expect(result).toBe('Hello, Test User! Welcome to the Test Repository.');
  });

  test('should handle empty input', () => {
    const result = greetUser('');
    expect(result).toBe('Hello, ! Welcome to the Test Repository.');
  });
});
```

### CI/CD Testing

This repository uses GitHub Actions for continuous integration. Tests automatically run on:
- Every push to any branch
- Every pull request

To check CI/CD status, visit the [Actions](https://github.com/KateLeonovaQA/test/actions) tab.

### Debugging Tests

#### Run Tests in Debug Mode
```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

#### Console Output in Tests
```bash
npm test -- --verbose
```

### Test Coverage Requirements

- **Minimum Coverage**: 80%
- **Critical Paths**: 100%
- **Branch Coverage**: 75%

View the coverage report:
```bash
npm run test:coverage
# Open coverage/lcov-report/index.html in your browser
```

### Common Testing Issues & Solutions

| Issue | Solution |
|-------|----------|
| Tests timeout | Increase timeout: `jest.setTimeout(10000)` |
| Import errors | Check file paths and ensure proper exports |
| Mock failures | Verify mock implementation and return values |
| Async test issues | Use `async/await` properly and ensure assertions are awaited |

## 📁 Repository Structure

```
test/
├── README.md              # This file - repository documentation
├── .github/
│   ├── ISSUE_TEMPLATE/   # Templates for standardized issue reporting
│   └── workflows/
│       └── ci.yml        # GitHub Actions workflow for continuous integration
├── .gitignore            # Specifies files that Git should ignore
├── CODE_OF_CONDUCT.md    # Guidelines for community behavior and standards
├── CONTRIBUTING.md       # Guidelines for how others can contribute
├── LICENSE               # MIT License
├── package.json          # Project dependencies and scripts
└── src/
    ├── index.js          # Main source code
    └── test.js           # Test file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. **Write/update tests** for your changes
5. Run tests to ensure everything passes (`npm test`)
6. Commit your changes (`git commit -m 'Add some amazing feature'`)
7. Push to the branch (`git push origin feature/amazing-feature`)
8. Open a Pull Request

## 🎯 Test Guidelines

- All new features must include tests
- Tests should be clear and descriptive
- Use meaningful test names
- Test both happy paths and edge cases
- Mock external dependencies appropriately
- Ensure tests are independent and can run in any order

## 📞 Contact & Support

- **Repository Owner**: Kate Leonova
- **GitHub Profile**: [KateLeonovaQA](https://github.com/KateLeonovaQA)
- **Issues**: Please use the [Issues](https://github.com/KateLeonovaQA/test/issues) tab for bug reports and questions

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

*Last updated: 2025* (Updated with comprehensive testing instructions)