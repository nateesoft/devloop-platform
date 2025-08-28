// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands'

// Import Cypress plugins
import 'cypress-real-events/support'

// Global configuration
Cypress.config('defaultCommandTimeout', 10000)

// Global hooks
beforeEach(() => {
  // Clear cookies and local storage before each test
  cy.clearCookies()
  cy.clearLocalStorage()
  
  // Set viewport for consistent testing
  cy.viewport(1280, 720)
  
  // Intercept common API calls
  cy.intercept('GET', '/api/**', { fixture: 'api-responses.json' }).as('apiCall')
  
  // Handle uncaught exceptions
  Cypress.on('uncaught:exception', (err, runnable) => {
    // Ignore specific errors that don't affect functionality
    if (err.message.includes('ResizeObserver loop limit exceeded')) {
      return false
    }
    if (err.message.includes('Non-Error promise rejection captured')) {
      return false
    }
    // Return true to fail the test on other uncaught exceptions
    return true
  })
})

// Global after hooks
afterEach(() => {
  // Clean up test data if test failed
  cy.then(() => {
    if (Cypress.currentTest.state === 'failed') {
      cy.task('log', `Test failed: ${Cypress.currentTest.title}`)
      // Additional cleanup can be added here
    }
  })
})

// Network failure handling
Cypress.on('fail', (error, runnable) => {
  if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
    throw new Error(`
      🚫 Network Error: Unable to connect to the application.
      
      Please ensure that:
      1. The frontend server is running on http://localhost:3000
      2. The backend server is running on http://localhost:8080
      3. All required services are up and running
      
      Original error: ${error.message}
    `)
  }
  throw error
})

// Custom assertions
declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to check if element is in viewport
       */
      isInViewport(): Chainable<void>
      
      /**
       * Custom command to wait for loading to complete
       */
      waitForPageLoad(): Chainable<void>
      
      /**
       * Custom command to login via Keycloak
       */
      loginKeycloak(username?: string, password?: string): Chainable<void>
      
      /**
       * Custom command to create test data
       */
      seedTestData(): Chainable<void>
      
      /**
       * Custom command to clean test data
       */
      cleanTestData(): Chainable<void>
      
      /**
       * Custom command to intercept and stub API calls
       */
      stubApiCalls(): Chainable<void>
      
      /**
       * Custom command to check accessibility
       */
      checkA11y(): Chainable<void>
      
      /**
       * Custom command to test responsive design
       */
      testResponsive(): Chainable<void>
      
      /**
       * Custom command to handle file uploads
       */
      uploadFile(fileName: string, selector?: string): Chainable<void>
      
      /**
       * Custom command to drag and drop elements
       */
      dragAndDrop(source: string, target: string): Chainable<void>
      
      /**
       * Custom command to wait for React component to load
       */
      waitForReact(): Chainable<void>
    }
  }
}