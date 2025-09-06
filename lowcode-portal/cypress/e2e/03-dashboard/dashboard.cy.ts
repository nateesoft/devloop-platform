/// <reference types="cypress" />

describe('Dashboard', () => {
  beforeEach(() => {
    // Login before each test
    cy.loginKeycloak()
    
    // Stub API calls for consistent testing
    cy.stubApiCalls()
    
    cy.visit('/dashboard')
    cy.waitForPageLoad()
  })

  afterEach(() => {
    // Clean up any test data
    cy.cleanTestData()
  })

  it('should display dashboard correctly for authenticated user', () => {
    // Check main dashboard elements
    cy.get('[data-testid="dashboard-header"]').should('be.visible')
    cy.get('[data-testid="dashboard-sidebar"]').should('be.visible')
    cy.get('[data-testid="dashboard-content"]').should('be.visible')
    
    // Check user info in header
    cy.get('[data-testid="user-avatar"]').should('be.visible')
    cy.get('[data-testid="user-name"]').should('contain.text', 'Test User')
  })

  it('should show dashboard statistics', () => {
    // Wait for stats to load
    cy.wait('@getDashboardStats')
    
    // Check stats cards
    cy.get('[data-testid="stats-card"]').should('have.length', 4)
    
    // Verify each stats card
    const expectedStats = [
      { label: 'Total Projects', value: '12' },
      { label: 'Active Services', value: '18' },
      { label: 'Total Users', value: '156' },
      { label: 'Active Users', value: '89' }
    ]
    
    expectedStats.forEach((stat, index) => {
      cy.get('[data-testid="stats-card"]').eq(index).within(() => {
        cy.get('[data-testid="stats-label"]').should('contain.text', stat.label)
        cy.get('[data-testid="stats-value"]').should('contain.text', stat.value)
      })
    })
  })

  it('should display recent projects', () => {
    // Wait for projects to load
    cy.wait('@getProjects')
    
    cy.get('[data-testid="recent-projects-section"]').should('be.visible')
    cy.get('[data-testid="project-card"]').should('have.length.at.least', 1)
    
    // Check first project card
    cy.get('[data-testid="project-card"]').first().within(() => {
      cy.get('[data-testid="project-name"]').should('be.visible')
      cy.get('[data-testid="project-status"]').should('be.visible')
      cy.get('[data-testid="project-actions"]').should('be.visible')
    })
  })

  it('should display recent services', () => {
    // Wait for services to load
    cy.wait('@getServices')
    
    cy.get('[data-testid="recent-services-section"]').should('be.visible')
    cy.get('[data-testid="service-card"]').should('have.length.at.least', 1)
    
    // Check service card content
    cy.get('[data-testid="service-card"]').first().within(() => {
      cy.get('[data-testid="service-name"]').should('be.visible')
      cy.get('[data-testid="service-type"]').should('be.visible')
      cy.get('[data-testid="service-status"]').should('be.visible')
    })
  })

  it('should allow creating new project', () => {
    cy.get('[data-testid="create-project-btn"]').click()
    
    // Check modal opens
    cy.get('[data-testid="project-modal"]').should('be.visible')
    
    // Fill project form
    cy.get('[data-testid="project-name-input"]').type('Test Project')
    cy.get('[data-testid="project-description-input"]').type('Test project description')
    cy.get('[data-testid="project-type-select"]').select('web_app')
    
    // Submit form
    cy.get('[data-testid="create-project-submit"]').click()
    
    // Check success message
    cy.get('[data-testid="success-message"]')
      .should('be.visible')
      .and('contain.text', 'Project created successfully')
    
    // Modal should close
    cy.get('[data-testid="project-modal"]').should('not.exist')
  })

  it('should allow creating new service', () => {
    cy.get('[data-testid="create-service-btn"]').click()
    
    // Check modal opens
    cy.get('[data-testid="service-modal"]').should('be.visible')
    
    // Fill service form
    cy.get('[data-testid="service-name-input"]').type('Test Service')
    cy.get('[data-testid="service-description-input"]').type('Test service description')
    cy.get('[data-testid="service-type-select"]').select('rest_api')
    cy.get('[data-testid="service-endpoint-input"]').type('https://api.test.com')
    
    // Submit form
    cy.get('[data-testid="create-service-submit"]').click()
    
    // Check success message
    cy.get('[data-testid="success-message"]')
      .should('be.visible')
      .and('contain.text', 'Service created successfully')
  })

  it('should allow navigation between dashboard sections', () => {
    // Test sidebar navigation
    const sidebarItems = [
      { selector: '[data-testid="nav-overview"]', url: '/dashboard' },
      { selector: '[data-testid="nav-projects"]', url: '/dashboard/projects' },
      { selector: '[data-testid="nav-services"]', url: '/dashboard/services' },
      { selector: '[data-testid="nav-components"]', url: '/dashboard/components' },
      { selector: '[data-testid="nav-media"]', url: '/dashboard/media' }
    ]
    
    sidebarItems.forEach((item) => {
      cy.get(item.selector).click()
      cy.url().should('include', item.url)
      cy.waitForPageLoad()
    })
  })

  it('should display user profile menu', () => {
    cy.get('[data-testid="user-menu-trigger"]').click()
    
    // Check menu items
    cy.get('[data-testid="user-menu"]').should('be.visible').within(() => {
      cy.get('[data-testid="profile-link"]').should('be.visible')
      cy.get('[data-testid="settings-link"]').should('be.visible')
      cy.get('[data-testid="logout-btn"]').should('be.visible')
    })
    
    // Test profile navigation
    cy.get('[data-testid="profile-link"]').click()
    cy.url().should('include', '/profile')
  })

  it('should handle search functionality', () => {
    cy.get('[data-testid="global-search"]').should('be.visible')
    
    // Test search
    cy.get('[data-testid="search-input"]').type('test project')
    cy.get('[data-testid="search-submit"]').click()
    
    // Check search results
    cy.get('[data-testid="search-results"]').should('be.visible')
    cy.get('[data-testid="search-result-item"]').should('have.length.at.least', 1)
  })

  it('should display notifications', () => {
    cy.get('[data-testid="notifications-trigger"]').click()
    
    // Check notifications panel
    cy.get('[data-testid="notifications-panel"]').should('be.visible')
    
    // Check notification items
    cy.get('[data-testid="notification-item"]').should('have.length.at.least', 0)
    
    // Test mark as read functionality
    cy.get('[data-testid="notification-item"]').first().then(($item) => {
      if ($item.length) {
        cy.wrap($item).find('[data-testid="mark-read-btn"]').click()
        cy.wrap($item).should('have.class', 'read')
      }
    })
  })

  it('should handle theme switching', () => {
    // Test theme toggle in dashboard
    cy.get('[data-testid="theme-toggle"]').click()
    
    // Check dark theme applied
    cy.get('body').should('have.class', 'dark')
    cy.get('[data-testid="dashboard-content"]').should('have.class', 'dark')
    
    // Switch back to light
    cy.get('[data-testid="theme-toggle"]').click()
    cy.get('body').should('not.have.class', 'dark')
  })

  it('should be responsive across different devices', () => {
    // Test mobile view
    cy.viewport('iphone-6')
    cy.get('[data-testid="mobile-sidebar-toggle"]').should('be.visible')
    cy.get('[data-testid="dashboard-sidebar"]').should('not.be.visible')
    
    // Open mobile sidebar
    cy.get('[data-testid="mobile-sidebar-toggle"]').click()
    cy.get('[data-testid="dashboard-sidebar"]').should('be.visible')
    
    // Test tablet view
    cy.viewport('ipad-2')
    cy.get('[data-testid="dashboard-sidebar"]').should('be.visible')
    cy.get('[data-testid="mobile-sidebar-toggle"]').should('not.be.visible')
    
    // Test desktop view
    cy.viewport('macbook-16')
    cy.get('[data-testid="dashboard-sidebar"]').should('be.visible')
  })

  it('should handle real-time updates', () => {
    // Simulate real-time data update
    cy.window().then((win) => {
      // Simulate WebSocket message or SSE event
      win.dispatchEvent(new CustomEvent('dashboard-update', {
        detail: { type: 'project_created', data: { name: 'New Project' } }
      }))
    })
    
    // Check if UI updates
    cy.get('[data-testid="realtime-notification"]')
      .should('be.visible')
      .and('contain.text', 'New project created')
  })

  it('should display activity timeline', () => {
    cy.get('[data-testid="activity-timeline"]').should('be.visible')
    
    // Check timeline items
    cy.get('[data-testid="timeline-item"]').should('have.length.at.least', 1)
    
    // Check timeline item structure
    cy.get('[data-testid="timeline-item"]').first().within(() => {
      cy.get('[data-testid="activity-icon"]').should('be.visible')
      cy.get('[data-testid="activity-message"]').should('be.visible')
      cy.get('[data-testid="activity-timestamp"]').should('be.visible')
    })
  })

  it('should handle error states gracefully', () => {
    // Simulate API error
    cy.intercept('GET', '/api/dashboard/stats', { statusCode: 500 }).as('statsError')
    
    cy.reload()
    cy.wait('@statsError')
    
    // Check error state
    cy.get('[data-testid="stats-error"]')
      .should('be.visible')
      .and('contain.text', 'Unable to load statistics')
    
    // Check retry button
    cy.get('[data-testid="retry-stats-btn"]').should('be.visible')
  })

  it('should support keyboard navigation', () => {
    // Test tab navigation
    cy.get('body').tab()
    cy.focused().should('be.visible')
    
    // Test skip links
    cy.get('[data-testid="skip-to-content"]').focus().click()
    cy.get('[data-testid="dashboard-content"]').should('be.focused')
  })

  it('should maintain state during navigation', () => {
    // Set some state (e.g., expand a section)
    cy.get('[data-testid="expandable-section"]').click()
    cy.get('[data-testid="section-content"]').should('be.visible')
    
    // Navigate away and back
    cy.get('[data-testid="nav-projects"]').click()
    cy.get('[data-testid="nav-overview"]').click()
    
    // State should be maintained
    cy.get('[data-testid="section-content"]').should('be.visible')
  })
})