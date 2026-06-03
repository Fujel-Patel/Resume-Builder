/**
 * Analytics service for PostHog and Google Analytics
 * Provides a unified interface for tracking events
 */

let posthogInitialized = false;
let gaInitialized = false;

/**
 * Initialize PostHog
 * @param apiKey - PostHog API key
 * @param options - PostHog initialization options
 */
export function initializePostHog(apiKey: string, options: {
  apiHost?: string;
  personProperties?: Record<string, any>;
  featureFlags?: boolean;
  capturePageview?: boolean;
  capturePageleave?: boolean;
  loaded: (posthog: any) => void;
} = {}) {
  if (typeof window === 'undefined') return;

  try {
    // Dynamically import posthog-js to avoid SSR issues
    const posthog = require('posthog-js');

    posthog.init(apiKey, {
      api_host: options.apiHost || 'https://app.posthog.com',
      person_properties: options.personProperties,
      feature_flags: options.featureFlags ?? false,
      capture_pageview: options.capturePageview ?? true,
      capture_pageleave: options.capturePageleave ?? true,
      ...options,
    });

    posthogInitialized = true;
    options.loaded(posthog);
  } catch (error) {
    console.error('Failed to initialize PostHog:', error);
  }
}

/**
 * Initialize Google Analytics (gtag.js)
 * @param measurementId - GA4 measurement ID
 */
export function initializeGA(measurementId: string) {
  if (typeof window === 'undefined') return;

  try {
    // Initialize gtag if not already present
    if (window.gtag === undefined) {
      window.dataLayer = window.dataLayer || [];
      function gtag() {
        window.dataLayer.push(arguments);
      }
      window.gtag = gtag;

      // Load gtag.js script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
      document.head.appendChild(script);

      // Initialize GA
      window.gtag('js', new Date());
      window.gtag('config', measurementId);
    }

    gaInitialized = true;
  } catch (error) {
    console.error('Failed to initialize Google Analytics:', error);
  }
}

/**
 * Track an event in PostHog
 * @param event - Event name
 * @param properties - Event properties
 */
export function capturePostHogEvent(event: string, properties?: Record<string, any>) {
  if (!posthogInitialized || typeof window === 'undefined') return;

  try {
    const posthog = require('posthog-js');
    posthog.capture(event, properties);
  } catch (error) {
    console.error('Failed to capture PostHog event:', error);
  }
}

/**
 * Track an event in Google Analytics
 * @param action - Event action
 * @param category - Event category (optional for GA4)
 * @param label - Event label (optional for GA4)
 * @param value - Event value (optional for GA4)
 */
export function trackGAEvent(
  action: string,
  category?: string,
  label?: string,
  value?: number
) {
  if (!gaInitialized || typeof window === 'undefined') return;

  try {
    // For GA4, we use the new event structure
    if (category || label !== undefined || value !== undefined) {
      // Universal Analytics style
      window.gtag('event', action, {
        event_category: category,
        event_label: label,
        value: value,
      });
    } else {
      // GA4 simple event
      window.gtag('event', action);
    }
  } catch (error) {
    console.error('Failed to track GA event:', error);
  }
}

/**
 * Track a page view in both analytics services
 * @param url - Current URL path
 * @param title - Page title (optional)
 */
export function trackPageView(url: string, title?: string) {
  // Track in PostHog
  if (posthogInitialized && typeof window !== 'undefined') {
    try {
      const posthog = require('posthog-js');
      posthog.capture('$pageview', {
        $current_url: url,
        $title: title,
      });
    } catch (error) {
      console.error('Failed to track PostHog pageview:', error);
    }
  }

  // Track in GA
  if (gaInitialized && typeof window !== 'undefined') {
    try {
      window.gtag('event', 'page_view', {
        page_path: url,
        page_title: title,
      });
    } catch (error) {
      console.error('Failed to track GA pageview:', error);
    }
  }
}

/**
 * Identify a user in both analytics services
 * @param userId - Unique user identifier
 * @param properties - User properties (email, name, etc.)
 */
export function identifyUser(
  userId: string,
  properties?: Record<string, any>
) {
  // Identify in PostHog
  if (posthogInitialized && typeof window !== 'undefined') {
    try {
      const posthog = require('posthog-js');
      posthog.identify(userId, properties);
    } catch (error) {
      console.error('Failed to identify PostHog user:', error);
    }
  }

  // Identify in GA (using User-ID feature)
  if (gaInitialized && typeof window !== 'undefined') {
    try {
      window.gtag('set', { user_id: userId });

      // Set user properties if provided
      if (properties) {
        Object.entries(properties).forEach(([key, value]) => {
          window.gtag('set', key, value);
        });
      }
    } catch (error) {
      console.error('Failed to set GA user ID:', error);
    }
  }
}

export default {
  initializePostHog,
  initializeGA,
  capturePostHogEvent,
  trackGAEvent,
  trackPageView,
  identifyUser,
};