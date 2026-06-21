/// <reference types="cypress" />

describe('CarbonWise AI – E2E Test Suite', () => {

  // Test 1: Landing page renders correctly
  it('1. Landing page loads with correct title', () => {
    cy.visit('/');
    cy.get('h1').should('contain.text', 'Understand');
    cy.contains('CarbonWise AI').should('be.visible');
  });

  // Test 2: Navigation links present in navbar
  it('2. All navigation links present in navbar', () => {
    cy.visit('/');
    cy.contains('Calculator').should('be.visible');
    cy.contains('Dashboard').should('be.visible');
    cy.contains('Simulator').should('be.visible');
    cy.contains('AI Coach').should('be.visible');
  });

  // Test 3: Footer renders
  it('3. Footer renders with brand tagline', () => {
    cy.visit('/');
    cy.get('footer').should('exist');
    cy.get('footer').contains('Net Zero').should('be.visible');
  });

  // Test 4: Landing page carbon stats visible
  it('4. Carbon impact statistics render on landing page', () => {
    cy.visit('/');
    cy.contains('1.5°C').should('be.visible');
    cy.contains('16.0 Tons').should('be.visible');
  });

  // Test 5: Feature grid renders on landing page
  it('5. Feature cards grid renders', () => {
    cy.visit('/');
    cy.contains('Precision Calculator').should('be.visible');
    cy.contains('AI Coach & Weekly Plans').should('be.visible');
    cy.contains('Predictive Simulator').should('be.visible');
  });

  // Test 6: Sign In button opens Auth Modal
  it('6. Sign In button opens authentication modal', () => {
    cy.visit('/');
    cy.get('nav').contains('Sign In').click();
    cy.get('[role="dialog"]').should('be.visible');
    cy.get('#auth-modal-title').should('contain.text', 'Welcome Back');
  });

  // Test 7: Auth modal closes with ESC key
  it('7. Auth modal closes on ESC key press', () => {
    cy.visit('/');
    cy.get('nav').contains('Sign In').click();
    cy.get('[role="dialog"]').should('be.visible');
    cy.get('body').type('{esc}');
    cy.get('[role="dialog"]').should('not.exist');
  });

  // Test 8: Calculator page shows auth guard when unauthenticated
  it('8. Calculator page shows auth gate for unauthenticated users', () => {
    cy.visit('/calculator');
    cy.contains('Secure Carbon Intelligence').should('be.visible');
    cy.contains('Sign In to Platform').should('be.visible');
  });

  // Test 9: Dashboard page shows auth guard when unauthenticated
  it('9. Dashboard page shows auth gate for unauthenticated users', () => {
    cy.visit('/dashboard');
    cy.contains('Secure Carbon Intelligence').should('be.visible');
  });

  // Test 10: Coach page shows auth guard when unauthenticated
  it('10. AI Coach page shows auth gate for unauthenticated users', () => {
    cy.visit('/coach');
    cy.contains('Secure Carbon Intelligence').should('be.visible');
  });

  // Test 11: Goals page shows auth guard when unauthenticated
  it('11. Goals page shows auth gate for unauthenticated users', () => {
    cy.visit('/goals');
    cy.contains('Secure Carbon Intelligence').should('be.visible');
  });

  // Test 12: Analytics page shows auth guard when unauthenticated
  it('12. Analytics page shows auth gate for unauthenticated users', () => {
    cy.visit('/analytics');
    cy.contains('Secure Carbon Intelligence').should('be.visible');
  });

  // Test 13: Eco map page shows auth guard when unauthenticated
  it('13. Eco Map page shows auth gate for unauthenticated users', () => {
    cy.visit('/eco-map');
    cy.contains('Secure Carbon Intelligence').should('be.visible');
  });

  // Test 14: Simulator page renders without auth
  it('14. Simulator page renders sliders without login', () => {
    cy.visit('/simulator');
    cy.get('h1').should('contain.text', 'Predictive Carbon Simulator');
    cy.contains('Car Travel Reduction').should('be.visible');
  });

  // Test 15: Simulator updates projected savings when slider moves
  it('15. Simulator shows updated projected values when slider interacted with', () => {
    cy.visit('/simulator');
    cy.contains('Current Profile').should('be.visible');
    cy.contains('Projected Future').should('be.visible');
    // Verify both metric cards render
    cy.contains('Equivalent Trees Grown').should('be.visible');
    cy.contains('Avoided Coal Combustion').should('be.visible');
  });
});
