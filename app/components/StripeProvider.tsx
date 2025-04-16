import React from 'react';

interface StripeProviderProps {
  children: React.ReactNode;
}

// This is a simplified version of the StripeProvider that doesn't rely on the Stripe SDK
// We're using this to avoid issues with the React Native dependencies
const StripeProvider: React.FC<StripeProviderProps> = ({ children }) => {
  // Simply render the children without any Stripe integration
  // This allows the app to run without errors
  return <>{children}</>;
};

export default StripeProvider;
