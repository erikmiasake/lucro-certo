import { LayoutDashboard, ArrowLeftRight, Wallet, TrendingUp, Settings } from 'lucide-react';
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
      <SidebarContent>
        <div className="px-4 py-5">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <span className="text-lg font-bold text-foreground">Lucro Real</span>
            </div>
          )}
          {collapsed && <span className="text-2xl block text-center">💰</span>}
          {!collapsed && config && (
            <p className="text-xs text-muted-foreground mt-1">{config.icon} {config.label}</p>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end
                      className="hover:bg-sidebar-accent/50"
                      activeClassName="bg-sidebar-accent text-primary font-semibold"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
