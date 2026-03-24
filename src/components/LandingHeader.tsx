import React from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const menuItems = [
  { name: 'Como funciona', href: '/como-funciona' },
];

export function LandingHeader({ onCtaClick }: { onCtaClick?: () => void }) {
  const [menuState, setMenuState] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed z-[60] w-full">
      <nav
        className={cn(
          'transition-all duration-300',
          isScrolled
            ? 'bg-background/80 backdrop-blur-lg border-b border-border shadow-sm'
            : 'bg-transparent'
        )}
      >
        <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <span className="text-lg font-bold text-foreground">Lucro Real</span>
          </Link>

          <button
            onClick={() => setMenuState(!menuState)}
            aria-label={menuState ? 'Fechar menu' : 'Abrir menu'}
            className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
          >
            {menuState ? <X className="h-5 w-5 text-foreground" /> : <Menu className="h-5 w-5 text-foreground" />}
          </button>

          <div className="hidden lg:flex lg:items-center lg:gap-6">
            {menuItems.map((item) => (
              <Link key={item.name} to={item.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {item.name}
              </Link>
            ))}
            <Button size="sm" className="rounded-xl" asChild>
              <Link to="/auth?mode=register">Começar agora</Link>
            </Button>
          </div>

          {menuState && (
            <div className="fixed inset-0 z-10 bg-background/95 backdrop-blur-md lg:hidden">
              <div className="flex flex-col items-center justify-center h-full gap-6">
                {menuItems.map((item) => (
                  <Link key={item.name} to={item.href} onClick={() => setMenuState(false)} className="text-lg text-foreground font-medium">
                    {item.name}
                  </Link>
                ))}
                <Button size="lg" className="rounded-xl mt-4" asChild>
                  <Link to="/auth?mode=register" onClick={() => setMenuState(false)}>
                    Começar agora
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
