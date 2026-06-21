import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'https://carbonwise-ai-273526189948.europe-west1.run.app',
    specPattern: 'cypress/e2e/**/*.cy.{ts,tsx}',
    supportFile: false,
    video: false,
    screenshotOnRunFailure: false,
  },
});
