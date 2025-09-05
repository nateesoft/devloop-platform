/**
 * Application Configuration
 * Controls various features and display options
 */

export interface AppConfig {
  // Pricing & Billing Configuration
  pricing: {
    enabled: boolean;
    showPricingSection: boolean;
    showUpgradeButtons: boolean;
    showCurrencySwitcher: boolean;
    allowCheckout: boolean;
  };
  
  // Feature flags
  features: {
    planUpgradeModal: boolean;
    billingToggle: boolean;
    paymentGateway: boolean;
  };
}

// Default configuration - set pricing.enabled to false to hide all pricing
const defaultConfig: AppConfig = {
  pricing: {
    enabled: false, // Default: false to hide pricing until company is established
    showPricingSection: false,
    showUpgradeButtons: false,
    showCurrencySwitcher: false,
    allowCheckout: false,
  },
  features: {
    planUpgradeModal: false,
    billingToggle: false,
    paymentGateway: false,
  }
};

// Environment-based configuration override
const getConfig = (): AppConfig => {
  // Check if pricing should be enabled via environment variable
  const pricingEnabled = process.env.NEXT_PUBLIC_ENABLE_PRICING === 'true';
  
  if (pricingEnabled) {
    return {
      pricing: {
        enabled: true,
        showPricingSection: true,
        showUpgradeButtons: true,
        showCurrencySwitcher: true,
        allowCheckout: true,
      },
      features: {
        planUpgradeModal: true,
        billingToggle: true,
        paymentGateway: true,
      }
    };
  }
  
  return defaultConfig;
};

export const appConfig = getConfig();

// Convenience functions for checking pricing features
export const isPricingEnabled = () => appConfig.pricing.enabled;
export const shouldShowPricingSection = () => appConfig.pricing.showPricingSection;
export const shouldShowUpgradeButtons = () => appConfig.pricing.showUpgradeButtons;
export const shouldShowCurrencySwitcher = () => appConfig.pricing.showCurrencySwitcher;
export const shouldAllowCheckout = () => appConfig.pricing.allowCheckout;

// Feature flag checks
export const shouldShowPlanUpgradeModal = () => appConfig.features.planUpgradeModal;
export const shouldShowBillingToggle = () => appConfig.features.billingToggle;
export const shouldEnablePaymentGateway = () => appConfig.features.paymentGateway;