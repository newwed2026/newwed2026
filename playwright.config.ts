import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  timeout: 45_000,
  expect: { timeout: 10_000 },
  workers: 1,
  reporter: [["list"]],
  use: { browserName: "chromium", colorScheme: "light", locale: "pt-BR", timezoneId: "America/Recife" },
  webServer: process.env.UPDATE_BASELINES ? undefined : {
    command: "npm run dev -- --port 4173",
    url: "http://localhost:4173",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
