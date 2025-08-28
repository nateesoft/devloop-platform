/// <reference types="cypress" />

// Custom commands for TON Lowcode Platform testing

/**
 * Check if element is in viewport
 */
Cypress.Commands.add('isInViewport', { prevSubject: true }, (subject) => {
  cy.get(subject).should(($el) => {
    const rect = $el[0].getBoundingClientRect()
    const windowHeight = Cypress.config('viewportHeight')
    const windowWidth = Cypress.config('viewportWidth')
    
    expect(rect.top).to.be.at.least(0)
    expect(rect.left).to.be.at.least(0)
    expect(rect.bottom).to.be.at.most(windowHeight)
    expect(rect.right).to.be.at.most(windowWidth)
  })
})

/**
 * Wait for page to fully load
 */
Cypress.Commands.add('waitForPageLoad', () => {
  cy.window().should('have.property', 'document.readyState', 'complete')
  
  // Wait for React to hydrate
  cy.window().should('have.property', 'React')
  
  // Wait for any loading spinners to disappear
  cy.get('[data-testid="loading"]', { timeout: 10000 }).should('not.exist')
  cy.get('.loading', { timeout: 10000 }).should('not.exist')
  cy.get('[class*="spinner"]', { timeout: 10000 }).should('not.exist')
  
  // Ensure no pending network requests
  cy.window().its('fetch').should('not.exist')
})

/**
 * Login via Keycloak
 */
Cypress.Commands.add('loginKeycloak', (username = Cypress.env('testUsername'), password = Cypress.env('testPassword')) => {
  cy.session([username, password], () => {
    cy.visit('/login')
    
    // Check if already logged in
    cy.url().then((url) => {
      if (url.includes('/dashboard')) {
        return // Already logged in
      }
      
      // Click login button
      cy.get('[data-testid="login-button"]').click()
      
      // Handle Keycloak login form
      cy.origin(Cypress.env('keycloakUrl'), { args: { username, password } }, ({ username, password }) => {
        cy.get('#username').type(username)
        cy.get('#password').type(password)
        cy.get('#kc-login').click()
      })
      
      // Wait for redirect to dashboard
      cy.url().should('include', '/dashboard')
      cy.get('[data-testid="dashboard-content"]').should('be.visible')
    })
  })
})

/**
 * Seed test data
 */
Cypress.Commands.add('seedTestData', () => {
  cy.task('seedDatabase')
  
  // Create test project via API
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/api/projects`,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      name: Cypress.env('testProjectName'),
      description: 'Automated test project',
      status: 'active',
    },
  }).then((response) => {
    expect(response.status).to.eq(201)
    Cypress.env('testProjectId', response.body.id)
  })
  
  // Create test service via API
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/api/services`,
    headers: {
      'Content-Type': 'application/json',
    },
    body: {
      name: Cypress.env('testServiceName'),
      description: 'Automated test service',
      type: 'rest_api',
    },
  }).then((response) => {
    expect(response.status).to.eq(201)
    Cypress.env('testServiceId', response.body.id)
  })
})

/**
 * Clean test data
 */
Cypress.Commands.add('cleanTestData', () => {
  // Clean up test project
  if (Cypress.env('testProjectId')) {
    cy.request({
      method: 'DELETE',
      url: `${Cypress.env('apiUrl')}/api/projects/${Cypress.env('testProjectId')}`,
      failOnStatusCode: false,
    })
  }
  
  // Clean up test service
  if (Cypress.env('testServiceId')) {
    cy.request({
      method: 'DELETE',
      url: `${Cypress.env('apiUrl')}/api/services/${Cypress.env('testServiceId')}`,
      failOnStatusCode: false,
    })
  }
  
  cy.task('cleanDatabase')
})

/**
 * Stub common API calls
 */
Cypress.Commands.add('stubApiCalls', () => {
  // Stub user profile API
  cy.intercept('GET', '/api/users/profile', {
    fixture: 'user-profile.json'
  }).as('getUserProfile')
  
  // Stub projects API
  cy.intercept('GET', '/api/projects', {
    fixture: 'projects.json'
  }).as('getProjects')
  
  // Stub services API
  cy.intercept('GET', '/api/services', {
    fixture: 'services.json'
  }).as('getServices')
  
  // Stub dashboard stats
  cy.intercept('GET', '/api/dashboard/stats', {
    fixture: 'dashboard-stats.json'
  }).as('getDashboardStats')
})

/**
 * Check accessibility (requires cypress-axe)
 */
Cypress.Commands.add('checkA11y', () => {
  cy.injectAxe()
  cy.checkA11y(null, null, (violations) => {
    violations.forEach((violation) => {
      cy.log(`Accessibility violation: ${violation.description}`)
      violation.nodes.forEach((node) => {
        cy.log(`Element: ${node.target}`)
      })
    })
  })
})

/**
 * Test responsive design across different viewports
 */
Cypress.Commands.add('testResponsive', () => {
  const viewports = [
    { width: 320, height: 568, name: 'mobile' },
    { width: 768, height: 1024, name: 'tablet' },
    { width: 1024, height: 768, name: 'desktop-small' },
    { width: 1440, height: 900, name: 'desktop-large' },
  ]
  
  viewports.forEach((viewport) => {
    cy.viewport(viewport.width, viewport.height)
    cy.log(`Testing ${viewport.name} viewport: ${viewport.width}x${viewport.height}`)
    
    // Basic visibility checks
    cy.get('header').should('be.visible')
    cy.get('main').should('be.visible')
    
    // Check for responsive navigation
    if (viewport.width < 768) {
      cy.get('[data-testid="mobile-menu-toggle"]').should('be.visible')
    } else {
      cy.get('[data-testid="desktop-nav"]').should('be.visible')
    }
  })
})

/**
 * Handle file uploads
 */
Cypress.Commands.add('uploadFile', (fileName, selector = 'input[type="file"]') => {
  cy.get(selector).selectFile(`cypress/fixtures/${fileName}`, { force: true })
  
  // Wait for upload to complete
  cy.get('[data-testid="upload-progress"]', { timeout: 30000 }).should('not.exist')
  cy.get('[data-testid="upload-success"]').should('be.visible')
})

/**
 * Drag and drop functionality
 */
Cypress.Commands.add('dragAndDrop', (source, target) => {
  cy.get(source).trigger('mousedown', { button: 0 })
  cy.get(target).trigger('mousemove').trigger('mouseup')
  
  // Alternative using dataTransfer (more reliable)
  const dataTransfer = new DataTransfer()
  
  cy.get(source).trigger('dragstart', { dataTransfer })
  cy.get(target).trigger('drop', { dataTransfer })
  cy.get(source).trigger('dragend')
})

/**
 * Wait for React components to fully load
 */
Cypress.Commands.add('waitForReact', () => {
  cy.window().should('have.property', '__REACT_DEVTOOLS_GLOBAL_HOOK__')
  
  // Wait for React Router if present
  cy.window().then((win) => {
    if (win.history && win.history.location) {
      cy.wrap(win.history.location).should('have.property', 'pathname')
    }
  })
  
  // Wait for Next.js router if present
  cy.window().should('have.property', 'next')
})

// Custom command for handling Next.js specific functionality
Cypress.Commands.add('waitForNextJS', () => {
  cy.window().should('have.property', '__NEXT_DATA__')
  cy.get('#__next').should('exist')
})

// Custom command for handling authentication state
Cypress.Commands.add('checkAuthState', (shouldBeAuthenticated = true) => {
  if (shouldBeAuthenticated) {
    cy.window().its('localStorage').invoke('getItem', 'kc-token').should('exist')
    cy.get('[data-testid="user-avatar"]').should('be.visible')
  } else {
    cy.window().its('localStorage').invoke('getItem', 'kc-token').should('not.exist')
    cy.get('[data-testid="login-button"]').should('be.visible')
  }
})

// Custom command for handling loading states
Cypress.Commands.add('waitForLoadingToComplete', () => {
  // Multiple selectors for different loading indicators
  const loadingSelectors = [
    '[data-testid="loading"]',
    '[data-testid="spinner"]', 
    '[data-testid="skeleton"]',
    '.loading',
    '.spinner',
    '[class*="loading"]',
    '[class*="spinner"]',
  ]
  
  loadingSelectors.forEach(selector => {
    cy.get(selector).should('not.exist')
  })
})

// Add support for custom data attributes
declare global {
  namespace Cypress {
    interface Chainable {
      waitForNextJS(): Chainable<void>
      checkAuthState(shouldBeAuthenticated?: boolean): Chainable<void>
      waitForLoadingToComplete(): Chainable<void>
    }
  }
}