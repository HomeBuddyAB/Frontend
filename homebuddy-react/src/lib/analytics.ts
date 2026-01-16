// Type declarations
declare global {
  interface Window {
    gtag?: (
      command: 'event' | 'config' | 'set',
      targetId: string,
      config?: Record<string, any>
    ) => void;
  }
}

const isProduction = process.env.NODE_ENV === 'production';

// Base tracking function
export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
    
    // Log in development
    if (!isProduction) {
      console.log('GA Event:', eventName, eventParams);
    }
  }
};

export const analytics = {
  // Product interactions
  viewProduct: (product: { id: string; name: string; price: number; category?: string }) => {
    trackEvent('view_item', {
      currency: 'USD',
      value: product.price,
      items: [{
        item_id: product.id,
        item_name: product.name,
        item_category: product.category,
        price: product.price,
      }]
    });
  },

  // Cart interactions
  viewCart: (totalValue: number, itemCount: number) => {
    trackEvent('view_cart', {
      currency: 'USD',
      value: totalValue,
      items_count: itemCount,
    });
  },
  
  addToCart: (product: { sku: string; name: string; price: number; quantity: number; variant?: string }) => {
    trackEvent('add_to_cart', {
      currency: 'USD',
      value: product.price * product.quantity,
      items: [{
        item_sku: product.sku,
        item_name: product.name,
        item_variant: product.variant,
        price: product.price,
        quantity: product.quantity,
      }]
    });
 },

  removeFromCart: (product: { sku: string; name: string; price: number; quantity: number }) => {
    trackEvent('remove_from_cart', {
      currency: 'USD',
      value: product.price * product.quantity,
      items: [{
        item_sku: product.sku,
        item_name: product.name,
        price: product.price,
        quantity: product.quantity,
      }]
    });
  },

  adjustItemQuantity: (product: { sku: string; name: string; price: number; quantity: number }) => {
    trackEvent('adjust_item_quantity', {
      currency: 'USD',
        value: product.price * product.quantity,
      items: [{
        item_sku: product.sku,
        item_name: product.name,
        price: product.price,
        quantity: product.quantity,
      }]
    });
  },
  
  clearCart: () => {
    trackEvent('clear_cart');
  },
  
  // Filters (for shop page)
  applyFilter: (filterType: string, filterValue: string) => {
    trackEvent('filter_applied', {
      filter_type: filterType,
      filter_value: filterValue,
    });
  },

  // User engagement
  login: (method: string) => {
    trackEvent('login', { method });
  },

  signUp: (method: string) => {
    trackEvent('sign_up', { method });
  },

};