import React, { useState, createContext, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { LayoutDashboard, ArrowLeftRight, Wallet, TrendingUp, Settings, Menu, X, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useStore } from "@/hooks/use-store";
import { businessConfigs } from "@/lib/business-config";

interface SidebarLink {
  label: string;
  href: string;
  icon: React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(undefined);

const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (!context) throw new Error("useSidebar must be used within SidebarProvider");
  return context;
};

const links: SidebarLink[] = [
  { label: "Visão geral", href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5 shrink-0" /> },
  { label: "Movimentações", href: "/movimentacoes", icon: <ArrowLeftRight className="h-5 w-5 shrink-0" /> },
  { label: "Custos", href: "/custos", icon: <Wallet className="h-5 w-5 shrink-0" /> },
  { label: "Desempenho", href: "/desempenho", icon: <TrendingUp className="h-5 w-5 shrink-0" /> },
  { label: "Meu Negócio", href: "/configuracoes", icon: <Settings className="h-5 w-5 shrink-0" /> },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate: true }}>
      <div className="min-h-screen flex w-full bg-background">
        <DesktopSidebar />
        <MobileSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 overflow-auto pt-16 md:pt-0">
            {children}
          </main>
        </div>
      </div>
    </SidebarContext.Provider>
  );
}

function DesktopSidebar() {
  const { open, setOpen, animate } = useSidebarContext();
  const location = useLocation();
  const appState = useStore();
  const config = appState.businessType ? businessConfigs[appState.businessType] : null;

  return (
    <motion.div
      className={cn(
        "hidden md:flex h-screen flex-col py-4 px-3 border-r border-border/50 bg-sidebar-background shrink-0 sticky top-0"
      )}
      animate={{ width: open ? 220 : 60 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-1 mb-8">
        <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center shrink-0">
          <Activity className="h-4.5 w-4.5 text-primary-foreground" />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={{ opacity: 0, width: 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <p className="text-sm font-bold text-foreground tracking-tight">{appState.businessProfile?.name || 'Lucro Real'}</p>
              {config && (
                <p className="text-[11px] text-muted-foreground">{config.label}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav links */}
      <nav className="flex flex-col gap-1 flex-1">
        {links.map((link) => {
          const isActive = location.pathname === link.href;
          return (
            <Link
              key={link.href}
              to={link.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-2.5 py-2.5 transition-all duration-200 group",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <span className={cn(isActive && "[&>svg]:text-primary")}>{link.icon}</span>
              <AnimatePresence>
                {open && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    className={cn(
                      "text-sm whitespace-nowrap overflow-hidden",
                      isActive && "font-semibold"
                    )}
                  >
                    {link.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* Bottom info */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-auto px-1"
          >
            <div className="rounded-xl bg-muted/50 border border-border p-3">
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                Dados armazenados localmente.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function MobileSidebar() {
  const { open, setOpen } = useSidebarContext();
  const location = useLocation();
  const appState = useStore();
  const config = appState.businessType ? businessConfigs[appState.businessType] : null;

  return (
    <div className="md:hidden">
      {/* Top bar with logo */}
      <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 h-14 bg-background/80 backdrop-blur-2xl border-b border-border/10">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-xl bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 transition-all"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg gradient-primary flex items-center justify-center shadow-md shadow-primary/30">
              <Activity className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-extrabold text-foreground tracking-tight">
              Lucro<span className="text-primary">Real</span>
            </span>
          </div>
        </div>
        <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-sm shadow-primary/50" />
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setOpen(false)}
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="fixed top-0 left-0 bottom-0 z-50 w-[280px] bg-sidebar-background border-r border-border/50 p-4 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
                    <Activity className="h-4.5 w-4.5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{appState.businessProfile?.name || 'Lucro Real'}</p>
                    {config && (
                      <p className="text-[11px] text-muted-foreground">{config.label}</p>
                    )}
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="p-2 text-muted-foreground hover:text-foreground">
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex flex-col gap-1 flex-1">
                {links.map((link) => {
                  const isActive = location.pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-200",
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <span className={cn(isActive && "[&>svg]:text-primary")}>{link.icon}</span>
                      <span className={cn("text-sm", isActive && "font-semibold")}>{link.label}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="mt-auto">
                <div className="rounded-xl bg-muted/50 border border-border p-3">
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    Dados armazenados localmente.
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
