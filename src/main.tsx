import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { safeGetItem, safeRemoveItem, safeSetItem } from "@/lib/safe-storage";
import App from "./App.tsx";
import "./index.css";

// If user didn't check "remember me", sign out when browser reopens
const sessionOnly = safeGetItem('lucro-real-session-only', 'sessionStorage');
if (sessionOnly === null && !safeGetItem('lucro-real-tab-active', 'sessionStorage')) {
  // First load in a new browser session — check if we should clear
  const shouldClear = safeGetItem('lucro-real-session-only');
  if (shouldClear === 'true') {
    supabase.auth.signOut();
    safeRemoveItem('lucro-real-session-only');
  }
}
safeSetItem('lucro-real-tab-active', 'true', 'sessionStorage');

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
