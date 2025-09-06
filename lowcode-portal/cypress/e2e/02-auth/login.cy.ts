/// <reference types="cypress" />

describe('Authentication - Login', () => {
  beforeEach(() => {
    // Clear any existing auth state
    cy.clearCookies()
    cy.clearLocalStorage()
    
    cy.visit('/login')
    cy.waitForPageLoad()
  })

  it('should display login page correctly', () => {
    // Check login form elements
    cy.get('[data-testid="login-form"]').should('be.visible')
    cy.get('[data-testid="login-title"]')
      .should('be.visible')
      .and('contain.text', 'Sign In')
    
    // Check login options
    cy.get('[data-testid="keycloak-login-btn"]')
      .should('be.visible')
      .and('contain.text', 'Sign in with Keycloak')
    
    // Check branding elements
    cy.get('[data-testid="login-logo"]').should('be.visible')
    cy.get('[data-testid="login-description"]').should('be.visible')
  })

  it('should redirect to Keycloak when login button is clicked', () => {
    cy.get('[data-testid="keycloak-login-btn"]').click()
    
    // Should redirect to Keycloak login page
    cy.url().should('include', Cypress.env('keycloakUrl'))
    
    // Check Keycloak login form elements
    cy.origin(Cypress.env('keycloakUrl'), () => {
      cy.get('#username').should('be.visible')
      cy.get('#password').should('be.visible')
      cy.get('#kc-login').should('be.visible')
    })
  })

  it('should handle successful login flow', () => {
    // Use custom login command
    cy.loginKeycloak()
    
    // Should be redirected to dashboard
    cy.url().should('include', '/dashboard')
    cy.get('[data-testid="dashboard-content"]').should('be.visible')
    
    // Check authentication state
    cy.checkAuthState(true)
  })

  it('should handle login with invalid credentials', () => {
    cy.get('[data-testid="keycloak-login-btn"]').click()
    
    cy.origin(Cypress.env('keycloakUrl'), () => {
      // Try invalid credentials
      cy.get('#username').type('invalid@example.com')
      cy.get('#password').type('wrongpassword')
      cy.get('#kc-login').click()
      
      // Should show error message
      cy.get('.alert-error, #input-error, .kc-feedback-text')
        .should('be.visible')
        .and('contain.text', 'Invalid')
    })
  })

  it('should handle logout functionality', () => {
    // Login first
    cy.loginKeycloak()
    
    // Navigate to dashboard and logout
    cy.visit('/dashboard')
    cy.get('[data-testid="user-menu-trigger"]').click()
    cy.get('[data-testid="logout-btn"]').click()
    
    // Confirm logout
    cy.get('[data-testid="confirm-logout-btn"]').click()
    
    // Should be redirected to login page
    cy.url().should('include', '/login')
    cy.checkAuthState(false)
  })

  it('should redirect authenticated users away from login', () => {
    // Login first
    cy.loginKeycloak()
    
    // Try to visit login page
    cy.visit('/login')
    
    // Should be redirected to dashboard
    cy.url().should('include', '/dashboard')
  })

  it('should handle session timeout', () => {
    // Login first
    cy.loginKeycloak()
    
    // Simulate session expiry by clearing auth tokens
    cy.window().then((win) => {
      win.localStorage.removeItem('kc-token')
      win.localStorage.removeItem('kc-refreshToken')
    })
    
    // Try to access protected route
    cy.visit('/dashboard')
    
    // Should be redirected to login
    cy.url().should('include', '/login')
    cy.get('[data-testid="session-expired-message"]').should('be.visible')
  })

  it('should remember login preference', () => {
    // Check "Remember me" functionality if available
    cy.get('[data-testid="remember-me-checkbox"]').then(($checkbox) => {
      if ($checkbox.length) {
        cy.wrap($checkbox).check()
        cy.loginKeycloak()
        
        // Clear session but not persistent storage
        cy.clearCookies()
        cy.visit('/')
        
        // Should still be logged in due to remember me
        cy.checkAuthState(true)
      }
    })
  })

  it('should handle SSO (Single Sign-On)', () => {
    // Test SSO flow if configured
    cy.loginKeycloak()
    
    // Open new tab/window simulation
    cy.window().then((win) => {
      // Simulate opening app in new window
      win.open('/dashboard', '_blank')
    })
    
    // Should be automatically logged in
    cy.visit('/dashboard')
    cy.checkAuthState(true)
  })

  it('should handle different user roles', () => {
    const testUsers = [
      { 
        username: 'admin@lowcode.com', 
        password: 'admin123', 
        role: 'admin',
        expectedRedirect: '/admin'
      },
      { 
        username: 'developer@lowcode.com', 
        password: 'dev123', 
        role: 'developer',
        expectedRedirect: '/dashboard'
      },
      { 
        username: 'viewer@lowcode.com', 
        password: 'view123', 
        role: 'viewer',
        expectedRedirect: '/dashboard'
      }
    ]

    testUsers.forEach((user) => {
      // Login with specific user
      cy.loginKeycloak(user.username, user.password)
      
      // Check role-based redirect
      cy.url().should('include', user.expectedRedirect)
      
      // Check role-specific UI elements
      if (user.role === 'admin') {
        cy.get('[data-testid="admin-panel-link"]').should('be.visible')
      }
      
      // Logout for next user
      cy.get('[data-testid="user-menu-trigger"]').click()
      cy.get('[data-testid="logout-btn"]').click()
      cy.get('[data-testid="confirm-logout-btn"]').click()
    })
  })

  it('should be accessible', () => {
    // Check accessibility of login page
    cy.checkA11y()
    
    // Test keyboard navigation
    cy.get('[data-testid="keycloak-login-btn"]').tab().should('be.focused')
    
    // Test screen reader labels
    cy.get('[data-testid="login-form"]').should('have.attr', 'aria-label')
  })

  it('should handle network errors gracefully', () => {
    // Simulate network error
    cy.intercept('GET', '**/auth/**', { forceNetworkError: true }).as('authError')
    
    cy.get('[data-testid="keycloak-login-btn"]').click()
    
    // Should show network error message
    cy.get('[data-testid="network-error-message"]')
      .should('be.visible')
      .and('contain.text', 'Network Error')
    
    // Should provide retry option
    cy.get('[data-testid="retry-login-btn"]').should('be.visible')
  })

  it('should support multiple authentication methods', () => {
    // Check if multiple auth methods are available
    cy.get('[data-testid="auth-methods"]').should('be.visible')
    
    // Test different auth providers if available
    const authProviders = ['keycloak', 'google', 'github']
    
    authProviders.forEach((provider) => {
      cy.get(`[data-testid="${provider}-login-btn"]`).then(($btn) => {
        if ($btn.length) {
          cy.wrap($btn).should('be.visible').and('contain.text', provider)
        }
      })
    })
  })
})