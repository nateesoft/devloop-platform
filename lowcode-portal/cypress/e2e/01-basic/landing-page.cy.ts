/// <reference types="cypress" />

describe('Landing Page', () => {
  beforeEach(() => {
    cy.visit('/')
    cy.waitForPageLoad()
  })

  it('should load the landing page successfully', () => {
    // Check basic page elements
    cy.get('h1').should('be.visible').and('contain.text', 'TON Lowcode Platform')
    cy.get('header').should('be.visible')
    cy.get('main').should('be.visible')
    
    // Check page title
    cy.title().should('include', 'Lowcode Portal')
    
    // Verify the page is responsive
    cy.testResponsive()
  })

  it('should display navigation menu', () => {
    // Desktop navigation
    cy.viewport('macbook-16')
    cy.get('[data-testid="desktop-nav"]').should('be.visible')
    
    // Mobile navigation toggle
    cy.viewport('iphone-6')
    cy.get('[data-testid="mobile-menu-toggle"]').should('be.visible')
  })

  it('should have working links in navigation', () => {
    const navLinks = [
      { text: 'Home', href: '/' },
      { text: 'Dashboard', href: '/dashboard' },
      { text: 'Login', href: '/login' },
    ]

    navLinks.forEach((link) => {
      cy.get(`a[href="${link.href}"]`)
        .should('be.visible')
        .and('contain.text', link.text)
    })
  })

  it('should display hero section with CTA buttons', () => {
    // Hero section
    cy.get('[data-testid="hero-section"]').should('be.visible')
    
    // CTA buttons
    cy.get('[data-testid="get-started-btn"]')
      .should('be.visible')
      .and('contain.text', 'Get Started')
    
    cy.get('[data-testid="learn-more-btn"]')
      .should('be.visible')
      .and('contain.text', 'Learn More')
  })

  it('should navigate to login when Get Started is clicked', () => {
    cy.get('[data-testid="get-started-btn"]').click()
    
    cy.url().should('include', '/login')
    cy.get('[data-testid="login-form"]').should('be.visible')
  })

  it('should display features section', () => {
    cy.get('[data-testid="features-section"]').should('be.visible')
    
    // Check for feature cards
    cy.get('[data-testid="feature-card"]').should('have.length.at.least', 3)
    
    // Verify each feature card has required elements
    cy.get('[data-testid="feature-card"]').each(($card) => {
      cy.wrap($card).find('[data-testid="feature-icon"]').should('be.visible')
      cy.wrap($card).find('[data-testid="feature-title"]').should('be.visible')
      cy.wrap($card).find('[data-testid="feature-description"]').should('be.visible')
    })
  })

  it('should have footer with company information', () => {
    cy.get('footer').should('be.visible')
    
    // Company info
    cy.get('[data-testid="company-info"]').should('be.visible')
    
    // Social links
    cy.get('[data-testid="social-links"]').should('be.visible')
    
    // Copyright notice
    cy.get('[data-testid="copyright"]')
      .should('be.visible')
      .and('contain.text', new Date().getFullYear().toString())
  })

  it('should handle theme switching', () => {
    // Check if theme toggle exists
    cy.get('[data-testid="theme-toggle"]').should('be.visible')
    
    // Test theme switching
    cy.get('[data-testid="theme-toggle"]').click()
    
    // Verify dark theme is applied (example)
    cy.get('body').should('have.class', 'dark')
    
    // Switch back to light theme
    cy.get('[data-testid="theme-toggle"]').click()
    cy.get('body').should('not.have.class', 'dark')
  })

  it('should be accessible', () => {
    // Check basic accessibility
    cy.checkA11y()
    
    // Check keyboard navigation
    cy.get('body').tab()
    cy.focused().should('be.visible')
  })

  it('should handle language switching', () => {
    // Check if language switcher exists
    cy.get('[data-testid="language-switcher"]').should('be.visible')
    
    // Test language switching
    cy.get('[data-testid="language-switcher"]').click()
    cy.get('[data-testid="language-option-th"]').click()
    
    // Verify Thai content is displayed
    cy.get('h1').should('contain.text', 'แพลตฟอร์ม')
    
    // Switch back to English
    cy.get('[data-testid="language-switcher"]').click()
    cy.get('[data-testid="language-option-en"]').click()
    cy.get('h1').should('contain.text', 'Platform')
  })

  it('should load without performance issues', () => {
    // Check for performance metrics
    cy.window().then((win) => {
      const performance = win.performance
      const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart
      expect(loadTime).to.be.lessThan(5000) // Less than 5 seconds
    })
    
    // Check for console errors
    cy.window().then((win) => {
      const consoleErrors = win.console.error.getCalls?.() || []
      expect(consoleErrors.length).to.equal(0)
    })
  })
})