/**
 * Pluggable, lightweight telemetry & route tracker utility.
 * Safe against ad-blockers and missing browser APIs.
 */

class EventTracker {
  constructor() {
    this.initialized = false;
    this.queue = [];
  }

  init() {
    this.initialized = true;
    while (this.queue.length > 0) {
      const event = this.queue.shift();
      this.trackEvent(event.name, event.props);
    }
  }

  /**
   * Track a page view safely
   * @param {string} path - URL path
   * @param {string} [title] - Optional page title
   */
  trackPageView(path, title = document.title) {
    try {
      const payload = {
        type: "pageview",
        path: path || window.location.pathname,
        title: title || document.title,
        timestamp: new Date().toISOString(),
        referrer: document.referrer || "direct",
      };

      if (process.env.NODE_ENV === "development") {
        console.debug("[EventTracker] Page View:", payload);
      }

      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("config", window.GA_MEASUREMENT_ID, {
          page_path: payload.path,
          page_title: payload.title,
        });
      }
    } catch (err) {
      // Fail silently
    }
  }

  /**
   * Track critical CTA and user interaction events
   * @param {string} eventName - Name of the action
   * @param {Object} [properties] - Optional event metadata
   */
  trackEvent(eventName, properties = {}) {
    try {
      const payload = {
        event: eventName,
        ...properties,
        timestamp: new Date().toISOString(),
      };

      if (process.env.NODE_ENV === "development") {
        console.debug(`[EventTracker] Event [${eventName}]:`, payload);
      }

      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", eventName, properties);
      }
    } catch (err) {
      // Fail silently
    }
  }
}

export const eventTracker = new EventTracker();
export default eventTracker;
