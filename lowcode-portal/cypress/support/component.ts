// ***********************************************************
// This example support/component.ts is processed and
// loaded automatically before your component test files.
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

// Import component testing utilities
import { mount } from 'cypress/react18'

// Augment the Cypress namespace to include type definitions for
// your custom command.
declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof mount
    }
  }
}

Cypress.Commands.add('mount', mount)

// Component testing specific configuration
beforeEach(() => {
  // Mock Next.js router for component tests
  cy.window().then((win) => {
    (win as any).__NEXT_ROUTER_MOCK__ = {
      push: cy.stub(),
      replace: cy.stub(),
      back: cy.stub(),
      forward: cy.stub(),
      reload: cy.stub(),
      prefetch: cy.stub().resolves(),
      pathname: '/',
      route: '/',
      query: {},
      asPath: '/',
      events: {
        on: cy.stub(),
        off: cy.stub(),
        emit: cy.stub(),
      },
    }
  })
})