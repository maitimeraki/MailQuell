module.exports = {
  setupFilesAfterEnv: ['./tests/setup.js'],
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js', '**/tests/**/*.spec.js'],
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
};