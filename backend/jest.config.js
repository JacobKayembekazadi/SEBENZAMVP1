module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  // Automatically clear mock calls and instances between every test
  clearMocks: true,
  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,
  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',
  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: ['<rootDir>/api/**/*.ts', '!<rootDir>/api/**/*.d.ts'],
  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: ['json', 'text', 'lcov', 'clover'],
  // An object that configures minimum threshold enforcement for coverage results
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: -10, // Allows 10 statements to be uncovered
    },
  },
  // A path to a module which exports an async function that is triggered once before all test suites
  // globalSetup: undefined,
  // A path to a module which exports an async function that is triggered once after all test suites
  // globalTeardown: undefined,
  // The maximum amount of workers used to run your tests. Can be specified as % or a number. E.g. maxWorkers: 10% will use 10% of your CPU amount + 1 as the max worker number. maxWorkers: 2 will use a maximum of 2 workers.
  // maxWorkers: '50%',
  // An array of directory names to be searched recursively up from the requiring module's location
  moduleDirectories: ['node_modules', 'src'],
  // An array of file extensions your modules use
  moduleFileExtensions: ['js', 'json', 'jsx', 'ts', 'tsx', 'node'],
  // A map from regular expressions to module names that allow to stub out resources with a single module
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1', // If you have path aliases in tsconfig for backend
  },
  // The root directory that Jest should scan for tests and modules within
  rootDir: '.', // Or wherever your backend source code is, adjust if backend is not root
  // A list of paths to directories that Jest should use to search for files in
  roots: ['<rootDir>'], // Adjust if your tests are not at the root of `backend` dir
  // The paths to modules that run some code to configure or set up the testing environment before each test
  // setupFilesAfterEnv: ['./jest.setup.js'], // if you have a setup file
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
};
