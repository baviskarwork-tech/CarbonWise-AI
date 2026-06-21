import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'https://carbonwise-ai-273526189948.europe-west1.run.app',
    specPattern: 'cypress/e2e/**/*.cy.{ts,tsx}',
    supportFile: false,
    video: false,
    screenshotOnRunFailure: false,
    setupNodeEvents(on, config) {
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.family === 'chromium') {
          // Disable GPU acceleration and sandbox to prevent Electron crashes in virtual environments
          launchOptions.args.push('--disable-gpu');
          launchOptions.args.push('--disable-software-rasterizer');
          launchOptions.args.push('--no-sandbox');
          launchOptions.args.push('--disable-dev-shm-usage');
        }
        return launchOptions;
      });
    },
  },
});
