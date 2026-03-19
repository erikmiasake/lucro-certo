import { LayoutDashboard, ArrowLeftRight, Wallet, TrendingUp, Settings, LogOut } from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useStore } from '@/hooks/use-store';
import { businessConfigs } from '@/lib/business-config';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar';

const items = [
  { title: 'Visão geral', url: '/', icon: LayoutDashboard },
  { title: 'Movimentações', url: '/movimentacoes', icon: ArrowLeftRight },
  { title: 'Custos', url: '/custos', icon: Wallet },
  { title: 'Desempenho', url: '/desempenho', icon: TrendingUp },
  { title: 'Configurações', url: '/configuracoes', icon: Settings },
];

export function AppSidebar() {
  const { state: sidebarState } = useSidebar();
  const collapsed = sidebarState === 'collapsed';
  const appState = useStore();
  const config = appState.businessType ? businessConfigs[appState.businessType] : null;

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="flex flex-col justify-between h-full">
        <div>
          {/* Logo area */}
          <div className="px-4 py-6 border-b border-sidebar-border">
            {!collapsed ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-lg shadow-lg">
                  💰
                </div>
                <div>
                  <p className="text-sm font-bold text-sidebar-accent-foreground tracking-tight">Lucro Real</p>
                  {config && (
                    <p className="text-[11px] text-sidebar-foreground">{config.icon} {config.label}</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex justify-center">
                <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-lg shadow-lg">
                  💰
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <SidebarGroup className="mt-2">
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end
                        className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200"
                        activeClassName="bg-sidebar-accent text-primary font-semibold glow-primary"
                      >
                        <item.icon className="h-[18px] w-[18px] shrink-0" />
                        {!collapsed && <span className="text-sm">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        {/* Bottom section */}
        {!collapsed && (
          <div className="px-4 pb-5">
            <div className="rounded-xl bg-sidebar-accent/50 border border-sidebar-border p-3">
              <p className="text-[11px] text-sidebar-foreground leading-relaxed">
                Seus dados ficam salvos neste dispositivo.
              </p>
            </div>
          </div>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
