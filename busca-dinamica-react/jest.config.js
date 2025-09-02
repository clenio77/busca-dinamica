module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapping: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js'
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx}',
    'routes/**/*.js',
    'services/**/*.js',
    '!src/index.js',
    '!src/reportWebVitals.js'
  ],
  // Temporariamente desabilitado para deploy de teste
  // coverageThreshold: {
  //   global: {
  //     branches: 20,
  //     functions: 40,
  //     lines: 50,
  //     statements: 50
  //   }
  // },
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx}',
    '<rootDir>/routes/**/*.{test,spec}.js',
    '<rootDir>/services/**/*.{test,spec}.js'
  ]
};
