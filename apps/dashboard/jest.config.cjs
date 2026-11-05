module.exports = {
  preset: 'jest-expo',
  testMatch: ['<rootDir>/tests/**/*.test.ts', '<rootDir>/src/ui/**/*.test.tsx'],
  transformIgnorePatterns: ['node_modules/(?!((?:\\.pnpm/)?(?:react-native|@react-native|expo|@expo|@odyssey|@tanstack|react-test-renderer|@testing-library)))'],
  clearMocks: true,
};
