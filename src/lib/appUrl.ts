// Returns the canonical app URL to use in auth email redirects.
// On Lovable preview/sandbox hosts, window.location.origin points to a
// sandbox URL that renders the Lovable editor wrapper when opened from
// an email link. We always redirect to the published production domain.
const PRODUCTION_URL = 'https://www.lucroreal.live';

export function getAppUrl(): string {
  if (typeof window === 'undefined') return PRODUCTION_URL;
  const host = window.location.hostname;
  const isLovableHost =
    host.endsWith('.lovable.app') ||
    host.endsWith('.lovableproject.com') ||
    host.endsWith('.lovable.dev');
  if (isLovableHost) return PRODUCTION_URL;
  return window.location.origin;
}
