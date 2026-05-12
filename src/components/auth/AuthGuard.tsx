import { useEffect, useState, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import type { Session } from '@supabase/supabase-js';
import { getState, mergeState } from '@/lib/store';
import { loadProfileFromDB } from '@/lib/profile-sync';
import { loadEntriesFromDB, loadCostsFromDB } from '@/lib/financial-sync';

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [dataLoaded, setDataLoaded] = useState(false);
  const loadedRef = useRef(false);
  const location = useLocation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session && !loadedRef.current) {
      loadedRef.current = true;
      // Load data from DB if not already loaded
      const currentState = getState();
      if (currentState.entries.length === 0 && currentState.costs.length === 0) {
        Promise.all([loadProfileFromDB(), loadEntriesFromDB(), loadCostsFromDB()])
          .then(([profile, entries, costs]) => {
            const merge: any = { entries, costs };
            if (profile) Object.assign(merge, profile);
            mergeState(merge);
            setDataLoaded(true);
          })
          .catch(() => setDataLoaded(true));
      } else {
        setDataLoaded(true);
      }
    }
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
