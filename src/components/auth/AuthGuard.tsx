import { useEffect, useState, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * AuthGuard intentionally does NOT statically import the financial store,
 * profile-sync, or financial-sync modules. Those pull in ~50KB of code and
 * are NOT needed on public pages (Landing, Login). Since AuthGuard itself
 * is eagerly imported by App.tsx (to keep route definitions sync), we
 * dynamically import the heavy data-layer modules only when a real session
 * exists. This cuts the landing-page critical path significantly on mobile.
 */
export default function AuthGuard({ children }: AuthGuardProps) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const hydratedUserId = useRef<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (event === 'SIGNED_OUT') {
          // Wipe local cache so the next user (or next login) doesn't inherit stale data.
          import('@/lib/store').then(({ clearLocalState }) => clearLocalState());
          hydratedUserId.current = null;
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session?.user) return;
    // Re-hydrate when the user changes (account switch) or on first login.
    if (hydratedUserId.current === session.user.id) return;
    hydratedUserId.current = session.user.id;

    (async () => {
      const [
        { hydrateFromDB, enableDBSync, disableDBSync },
        { loadProfileFromDB },
        { loadEntriesFromDB, loadCostsFromDB },
      ] = await Promise.all([
        import('@/lib/store'),
        import('@/lib/profile-sync'),
        import('@/lib/financial-sync'),
      ]);

      // Block any DB writes until hydration finishes — prevents stale local cache
      // from overwriting the user's real data in the backend.
      disableDBSync();
      try {
        const [profile, entries, costs] = await Promise.all([
          loadProfileFromDB(),
          loadEntriesFromDB(),
          loadCostsFromDB(),
        ]);
        const merge: any = { entries, costs };
        if (profile) Object.assign(merge, profile);
        hydrateFromDB(merge);
      } catch (e) {
        console.error('AuthGuard hydration error:', e);
      } finally {
        enableDBSync();
      }
    })();
  }, [session]);

  if (session === undefined) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Block access until email is verified (skip for OAuth providers which auto-confirm)
  if (!session.user.email_confirmed_at && location.pathname !== '/verify-email') {
    return <Navigate to={`/verify-email?email=${encodeURIComponent(session.user.email || '')}`} replace />;
  }

  return <>{children}</>;
}
