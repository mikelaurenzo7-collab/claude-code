/**
 * Analytics - PostHog integration
 * Tracks user behavior for product insights
 */
import posthog from "posthog-js";

// Initialize PostHog (call this once in your app)
export function initAnalytics() {
  if (typeof window === "undefined") return;
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;

  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
    // Capture pageviews automatically
    capture_pageview: true,
    // Capture page leaves for session duration
    capture_pageleave: true,
    // Don't autocapture clicks (we'll do custom events)
    autocapture: false,
    // Disable in development
    loaded: (posthog) => {
      if (process.env.NODE_ENV === "development") {
        posthog.opt_out_capturing();
      }
    },
  });
}

// Identify user after login
export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  posthog.identify(userId, properties);
}

// Reset on logout
export function resetAnalytics() {
  if (typeof window === "undefined") return;
  posthog.reset();
}

// Custom event tracking
export function trackEvent(event: string, properties?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  posthog.capture(event, properties);
}

// =============================================================================
// Pre-defined Events for Creator Studio
// =============================================================================

export const analytics = {
  // Auth events
  signUp: () => trackEvent("user_signed_up"),
  login: () => trackEvent("user_logged_in"),
  logout: () => trackEvent("user_logged_out"),

  // Brand events
  brandCreated: (brandId: string) => trackEvent("brand_created", { brand_id: brandId }),
  voiceLearned: (brandId: string, samplesCount: number) =>
    trackEvent("voice_learned", { brand_id: brandId, samples_count: samplesCount }),

  // Content pipeline
  transcriptUploaded: (transcriptId: string, sourceType: "audio" | "paste") =>
    trackEvent("transcript_uploaded", { transcript_id: transcriptId, source_type: sourceType }),
  clipsDetected: (transcriptId: string, clipCount: number) =>
    trackEvent("clips_detected", { transcript_id: transcriptId, clip_count: clipCount }),
  clipApproved: (clipId: string) => trackEvent("clip_approved", { clip_id: clipId }),
  clipRejected: (clipId: string) => trackEvent("clip_rejected", { clip_id: clipId }),

  // Draft events
  draftGenerated: (draftId: string, platform: string) =>
    trackEvent("draft_generated", { draft_id: draftId, platform }),
  draftEdited: (draftId: string) => trackEvent("draft_edited", { draft_id: draftId }),
  draftApproved: (draftId: string) => trackEvent("draft_approved", { draft_id: draftId }),
  draftRegenerated: (draftId: string) => trackEvent("draft_regenerated", { draft_id: draftId }),

  // Billing events
  upgradeClicked: (plan: string) => trackEvent("upgrade_clicked", { plan }),
  checkoutStarted: (plan: string) => trackEvent("checkout_started", { plan }),
  subscriptionUpgraded: (plan: string) => trackEvent("subscription_upgraded", { plan }),

  // Feature usage
  featureUsed: (feature: string) => trackEvent("feature_used", { feature }),

  // Onboarding
  onboardingStarted: () => trackEvent("onboarding_started"),
  onboardingStepCompleted: (step: number, stepName: string) =>
    trackEvent("onboarding_step_completed", { step, step_name: stepName }),
  onboardingCompleted: () => trackEvent("onboarding_completed"),
  onboardingSkipped: (step: number) => trackEvent("onboarding_skipped", { step }),
};
