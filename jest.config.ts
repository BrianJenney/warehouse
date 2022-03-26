module.exports = {
    transform: {
        '^.+\\.tsx?$': 'ts-jest',
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.tsx?$',
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    preset: '@shelf/jest-mongodb',
    setupFilesAfterEnv: ['./jest.setup.ts', './jest.setup.redis-mock.ts'],
    globalTeardown: './jest.tearDown.ts',
};
