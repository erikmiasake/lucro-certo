import { createRoot } from "react-dom/client";
import { supabase } from "@/integrations/supabase/client";
import App from "./App.tsx";
import "./index.css";

// If user didn't check "remember me", sign out when browser reopens
const sessionOnly = sessionStorage.getItem('lucro-real-session-only');
if (sessionOnly === null && !sessionStorage.getItem('lucro-real-tab-active')) {
  // First load in a new browser session — check if we should clear
  const shouldClear = localStorage.getItem('lucro-real-session-only');
  if (shouldClear === 'true') {
    supabase.auth.signOut();
    localStorage.removeItem('lucro-real-session-only');
  }
}
sessionStorage.setItem('lucro-real-tab-active', 'true');

createRoot(document.getElementById("root")!).render(<App />);
