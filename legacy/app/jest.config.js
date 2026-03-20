module.exports = {
  preset: "ts-jest",
  testEnvironment: "node", // OCRテストはブラウザ環境に依存しないのでnodeを使用
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/$1",
  },
  testMatch: ["**/__tests__/**/*.ts?(x)", "**/?(*.)+(spec|test).ts?(x)"],
  // テスト環境でprocess.env.MISTRAL_API_KEYを使用できるようにする
  setupFiles: ["<rootDir>/jest.setup.js"],
};
