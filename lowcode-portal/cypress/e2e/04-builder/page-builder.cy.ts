/// <reference types="cypress" />

describe('Page Builder', () => {
  beforeEach(() => {
    // Login and navigate to builder
    cy.loginKeycloak()
    cy.seedTestData()
    
    cy.visit('/builder')
    cy.waitForPageLoad()
  })

  afterEach(() => {
    cy.cleanTestData()
  })

  it('should load page builder interface', () => {
    // Check main builder components
    cy.get('[data-testid="builder-canvas"]').should('be.visible')
    cy.get('[data-testid="element-palette"]').should('be.visible')
    cy.get('[data-testid="properties-panel"]').should('be.visible')
    cy.get('[data-testid="builder-toolbar"]').should('be.visible')
  })

  it('should display component palette', () => {
    // Check component categories
    const componentCategories = ['Layout', 'Forms', 'Content', 'Navigation', 'Media']
    
    componentCategories.forEach((category) => {
      cy.get('[data-testid="palette-category"]')
        .contains(category)
        .should('be.visible')
    })
    
    // Check individual components
    cy.get('[data-testid="palette-component"]').should('have.length.at.least', 5)
    
    // Test component preview
    cy.get('[data-testid="palette-component"]').first().trigger('mouseenter')
    cy.get('[data-testid="component-preview"]').should('be.visible')
  })

  it('should allow dragging components to canvas', () => {
    // Drag a button component to canvas
    cy.dragAndDrop(
      '[data-testid="palette-component"][data-component="button"]',
      '[data-testid="builder-canvas"]'
    )
    
    // Check component is added to canvas
    cy.get('[data-testid="canvas-component"][data-type="button"]').should('be.visible')
    
    // Check properties panel updates
    cy.get('[data-testid="properties-panel"]').should('be.visible')
    cy.get('[data-testid="property-text"]').should('be.visible')
  })

  it('should allow editing component properties', () => {
    // Add a button component
    cy.dragAndDrop(
      '[data-testid="palette-component"][data-component="button"]',
      '[data-testid="builder-canvas"]'
    )
    
    // Select the component
    cy.get('[data-testid="canvas-component"][data-type="button"]').click()
    
    // Edit button text
    cy.get('[data-testid="property-text"]').clear().type('Custom Button')
    
    // Edit button color
    cy.get('[data-testid="property-color"]').select('primary')
    
    // Edit button size
    cy.get('[data-testid="property-size"]').select('large')
    
    // Check changes are reflected in canvas
    cy.get('[data-testid="canvas-component"][data-type="button"]')
      .should('contain.text', 'Custom Button')
      .should('have.class', 'btn-primary')
      .should('have.class', 'btn-lg')
  })

  it('should support component layering and selection', () => {
    // Add multiple components
    cy.dragAndDrop(
      '[data-testid="palette-component"][data-component="container"]',
      '[data-testid="builder-canvas"]'
    )
    
    cy.dragAndDrop(
      '[data-testid="palette-component"][data-component="button"]',
      '[data-testid="canvas-component"][data-type="container"]'
    )
    
    // Test selection hierarchy
    cy.get('[data-testid="canvas-component"][data-type="button"]').click()
    cy.get('[data-testid="breadcrumb"]').should('contain.text', 'Container > Button')
    
    // Test layer panel
    cy.get('[data-testid="layers-panel"]').should('be.visible')
    cy.get('[data-testid="layer-item"]').should('have.length', 2)
  })

  it('should allow component duplication and deletion', () => {
    // Add a component
    cy.dragAndDrop(
      '[data-testid="palette-component"][data-component="text"]',
      '[data-testid="builder-canvas"]'
    )
    
    // Select and duplicate
    cy.get('[data-testid="canvas-component"][data-type="text"]').rightclick()
    cy.get('[data-testid="context-menu"]').should('be.visible')
    cy.get('[data-testid="duplicate-btn"]').click()
    
    // Should have 2 text components
    cy.get('[data-testid="canvas-component"][data-type="text"]').should('have.length', 2)
    
    // Delete one component
    cy.get('[data-testid="canvas-component"][data-type="text"]').first().click()
    cy.get('[data-testid="delete-component-btn"]').click()
    
    // Confirm deletion
    cy.get('[data-testid="confirm-delete-btn"]').click()
    
    // Should have 1 text component left
    cy.get('[data-testid="canvas-component"][data-type="text"]').should('have.length', 1)
  })

  it('should support undo/redo functionality', () => {
    // Add a component
    cy.dragAndDrop(
      '[data-testid="palette-component"][data-component="heading"]',
      '[data-testid="builder-canvas"]'
    )
    
    // Edit heading text
    cy.get('[data-testid="canvas-component"][data-type="heading"]').dblclick()
    cy.get('[data-testid="inline-editor"]').clear().type('New Heading')
    cy.get('[data-testid="inline-editor"]').blur()
    
    // Test undo
    cy.get('[data-testid="undo-btn"]').click()
    cy.get('[data-testid="canvas-component"][data-type="heading"]')
      .should('not.contain.text', 'New Heading')
    
    // Test redo
    cy.get('[data-testid="redo-btn"]').click()
    cy.get('[data-testid="canvas-component"][data-type="heading"]')
      .should('contain.text', 'New Heading')
  })

  it('should allow saving and loading pages', () => {
    // Add some components
    cy.dragAndDrop(
      '[data-testid="palette-component"][data-component="heading"]',
      '[data-testid="builder-canvas"]'
    )
    cy.dragAndDrop(
      '[data-testid="palette-component"][data-component="text"]',
      '[data-testid="builder-canvas"]'
    )
    
    // Save page
    cy.get('[data-testid="save-page-btn"]').click()
    cy.get('[data-testid="page-name-input"]').type('Test Page')
    cy.get('[data-testid="save-confirm-btn"]').click()
    
    // Check success message
    cy.get('[data-testid="success-message"]')
      .should('be.visible')
      .and('contain.text', 'Page saved successfully')
    
    // Clear canvas
    cy.get('[data-testid="clear-canvas-btn"]').click()
    cy.get('[data-testid="confirm-clear-btn"]').click()
    
    // Load saved page
    cy.get('[data-testid="load-page-btn"]').click()
    cy.get('[data-testid="page-list-item"]').contains('Test Page').click()
    cy.get('[data-testid="load-confirm-btn"]').click()
    
    // Check components are restored
    cy.get('[data-testid="canvas-component"][data-type="heading"]').should('be.visible')
    cy.get('[data-testid="canvas-component"][data-type="text"]').should('be.visible')
  })

  it('should support responsive design preview', () => {
    // Add responsive container
    cy.dragAndDrop(
      '[data-testid="palette-component"][data-component="responsive-container"]',
      '[data-testid="builder-canvas"]'
    )
    
    // Test different device previews
    const devices = ['mobile', 'tablet', 'desktop']
    
    devices.forEach((device) => {
      cy.get(`[data-testid="preview-${device}"]`).click()
      
      // Check canvas adjusts to device size
      cy.get('[data-testid="builder-canvas"]').should('have.class', `preview-${device}`)
      
      // Check responsive controls are available
      cy.get('[data-testid="responsive-controls"]').should('be.visible')
    })
  })

  it('should allow custom CSS styling', () => {
    // Add a component
    cy.dragAndDrop(
      '[data-testid="palette-component"][data-component="div"]',
      '[data-testid="builder-canvas"]'
    )
    
    // Select component and open styles
    cy.get('[data-testid="canvas-component"][data-type="div"]').click()
    cy.get('[data-testid="styles-tab"]').click()
    
    // Add custom CSS
    cy.get('[data-testid="css-editor"]').type('background-color: #ff0000; padding: 20px;')
    cy.get('[data-testid="apply-styles-btn"]').click()
    
    // Check styles are applied
    cy.get('[data-testid="canvas-component"][data-type="div"]')
      .should('have.css', 'background-color', 'rgb(255, 0, 0)')
      .should('have.css', 'padding', '20px')
  })

  it('should support component templates', () => {
    // Check template gallery
    cy.get('[data-testid="templates-btn"]').click()
    cy.get('[data-testid="template-gallery"]').should('be.visible')
    
    // Check template categories
    cy.get('[data-testid="template-category"]').should('have.length.at.least', 3)
    
    // Use a template
    cy.get('[data-testid="template-item"]').first().click()
    cy.get('[data-testid="use-template-btn"]').click()
    
    // Check template components are added
    cy.get('[data-testid="canvas-component"]').should('have.length.at.least', 2)
  })

  it('should support real-time collaboration', () => {
    // Simulate another user joining
    cy.window().then((win) => {
      win.dispatchEvent(new CustomEvent('user-joined', {
        detail: { userId: 'user-2', name: 'Collaborator' }
      }))
    })
    
    // Check collaboration indicator
    cy.get('[data-testid="collaborators-panel"]').should('be.visible')
    cy.get('[data-testid="collaborator-avatar"]').should('have.length', 2)
    
    // Simulate collaborator cursor
    cy.get('[data-testid="collaborative-cursor"]').should('be.visible')
  })

  it('should validate component constraints', () => {
    // Try to drop invalid component
    cy.dragAndDrop(
      '[data-testid="palette-component"][data-component="form-input"]',
      '[data-testid="builder-canvas"]'
    )
    
    // Should show validation error
    cy.get('[data-testid="validation-error"]')
      .should('be.visible')
      .and('contain.text', 'Form input must be inside a form container')
    
    // Add form container first
    cy.dragAndDrop(
      '[data-testid="palette-component"][data-component="form"]',
      '[data-testid="builder-canvas"]'
    )
    
    // Now input should work
    cy.dragAndDrop(
      '[data-testid="palette-component"][data-component="form-input"]',
      '[data-testid="canvas-component"][data-type="form"]'
    )
    
    cy.get('[data-testid="canvas-component"][data-type="form-input"]').should('be.visible')
  })

  it('should support keyboard shortcuts', () => {
    // Add a component
    cy.dragAndDrop(
      '[data-testid="palette-component"][data-component="text"]',
      '[data-testid="builder-canvas"]'
    )
    
    // Test keyboard shortcuts
    cy.get('[data-testid="canvas-component"][data-type="text"]').click()
    
    // Copy with Ctrl+C
    cy.get('body').type('{ctrl+c}')
    
    // Paste with Ctrl+V
    cy.get('body').type('{ctrl+v}')
    cy.get('[data-testid="canvas-component"][data-type="text"]').should('have.length', 2)
    
    // Delete with Delete key
    cy.get('[data-testid="canvas-component"][data-type="text"]').first().click()
    cy.get('body').type('{del}')
    cy.get('[data-testid="canvas-component"][data-type="text"]').should('have.length', 1)
    
    // Undo with Ctrl+Z
    cy.get('body').type('{ctrl+z}')
    cy.get('[data-testid="canvas-component"][data-type="text"]').should('have.length', 2)
  })

  it('should export page as code', () => {
    // Add components
    cy.dragAndDrop(
      '[data-testid="palette-component"][data-component="heading"]',
      '[data-testid="builder-canvas"]'
    )
    cy.dragAndDrop(
      '[data-testid="palette-component"][data-component="button"]',
      '[data-testid="builder-canvas"]'
    )
    
    // Export as HTML
    cy.get('[data-testid="export-btn"]').click()
    cy.get('[data-testid="export-format"]').select('HTML')
    cy.get('[data-testid="export-confirm-btn"]').click()
    
    // Check export modal
    cy.get('[data-testid="export-result"]').should('be.visible')
    cy.get('[data-testid="export-code"]').should('contain', '<h1>')
    cy.get('[data-testid="export-code"]').should('contain', '<button>')
    
    // Test copy to clipboard
    cy.get('[data-testid="copy-code-btn"]').click()
    cy.get('[data-testid="copy-success"]').should('be.visible')
  })
})