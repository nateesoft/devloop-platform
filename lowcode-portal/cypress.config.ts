import { defineConfig } from 'cypress'

export default defineConfig({
  // E2E Testing Configuration
  e2e: {
    // Base URL of your application
    baseUrl: 'http://localhost:3000',
    
    // Viewport settings
    viewportWidth: 1280,
    viewportHeight: 720,
    
    // Test files location
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    
    // Support file
    supportFile: 'cypress/support/e2e.ts',
    
    // Fixtures folder
    fixturesFolder: 'cypress/fixtures',
    
    // Screenshots and videos
    screenshotsFolder: 'cypress/screenshots',
    videosFolder: 'cypress/videos',
    
    // Video recording
    video: true,
    videoCompression: 32,
    
    // Screenshot settings
    screenshotOnRunFailure: true,
    
    // Test timeout settings
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 30000,
    pageLoadTimeout: 60000,
    
    // Test retry settings
    retries: {
      runMode: 2,
      openMode: 0,
    },
    
    // Environment variables
    env: {
      // Backend API URL
      apiUrl: 'http://localhost:8888',
      
      // Test user credentials
      testUsername: 'testuser@lowcode.com',
      testPassword: 'testpassword123',
      
      // Keycloak configuration
      keycloakUrl: 'http://localhost:8090',
      keycloakRealm: 'lowcode',
      keycloakClientId: 'lowcode-portal',
      
      // Feature flags for conditional testing
      enableAuth: true,
      enablePayments: false,
      enableCollaboration: true,
      
      // Test data
      testProjectName: 'Cypress Test Project',
      testServiceName: 'Cypress Test Service',
    },
    
    // Browser settings
    chromeWebSecurity: false,
    
    // Node events setup
    setupNodeEvents(on, config) {
      // Task plugins
      on('task', {
        log(message) {
          console.log(message)
          return null
        },
        
        // Custom task for database seeding
        seedDatabase() {
          // Implementation would connect to your test database
          // and insert necessary test data
          console.log('Seeding test database...')
          return null
        },
        
        // Custom task for cleaning up test data
        cleanDatabase() {
          console.log('Cleaning test database...')
          return null
        },
      })
      
      // File preprocessing
      on('file:preprocessor', (file) => {
        // Add custom preprocessing if needed
        return file
      })
      
      // Browser launch options
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'chrome') {
          launchOptions.args.push('--disable-dev-shm-usage')
          launchOptions.args.push('--no-sandbox')
          launchOptions.args.push('--disable-gpu')
        }
        
        return launchOptions
      })
      
      // Dynamic configuration based on environment
      if (config.env.CI) {
        config.video = false
        config.screenshotOnRunFailure = false
      }
      
      return config
    },
  },

  // Component Testing Configuration
  component: {
    devServer: {
      framework: 'next',
      bundler: 'webpack',
    },
    
    specPattern: 'src/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.ts',
    
    viewportWidth: 1000,
    viewportHeight: 660,
    
    video: false,
    screenshotOnRunFailure: true,
    
    // Component testing specific timeouts
    defaultCommandTimeout: 5000,
    requestTimeout: 5000,
    responseTimeout: 10000,
  },

  // Global configuration
  watchForFileChanges: true,
  
  // Experimental features
  experimentalStudio: true,
  experimentalWebKitSupport: false,
  
  // User agent override
  userAgent: 'TON Lowcode Platform E2E Tests',
  
  // Custom reporters
  reporter: 'cypress-multi-reporters',
  reporterOptions: {
    configFile: 'cypress/reporter-config.json',
  },
  
  // Download settings
  downloadsFolder: 'cypress/downloads',
  
  // Trash assets before runs
  trashAssetsBeforeRuns: true,
  
  // Exclude files from being watched
  excludeSpecPattern: [
    '**/__tests__/**',
    '**/*.test.*',
    '**/*.spec.*',
  ],
  
  // Include shadow DOM
  includeShadowDom: true,
  
  // Scroll behavior
  scrollBehavior: 'center',
  
  // Animation settings
  animationDistanceThreshold: 5,
  waitForAnimations: true,
  
  // Modifying obstruct action center
  blockHosts: [
    // Block analytics and tracking
    '*.google-analytics.com',
    '*.googletagmanager.com',
    '*.facebook.com',
    '*.twitter.com',
  ],
})