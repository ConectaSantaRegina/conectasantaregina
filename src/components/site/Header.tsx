import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Menu, X, LogOut, MapPinned } from "lucide-react";
import { NAV } from "@/lib/nav";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Header() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
      <div className="mx-auto grid max-w-[1180px] grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-5 py-3.5 lg:flex lg:justify-between">
        <Link to="/" className="flex min-w-0 items-center gap-3">
          <span className="brand-mark grid h-[42px] w-[42px] shrink-0 place-items-center rounded-xl text-primary-foreground">
            <MapPinned className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-[1.28rem] font-bold leading-tight">
              Santa Regina
            </span>
            <span className="block truncate font-mono text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              bairro em rede
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 xl:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "group relative py-1 text-[0.92rem] font-semibold text-muted-foreground transition-colors hover:text-foreground",
                pathname === item.to && "text-foreground",
              )}
            >
              {item.label}
              <span
                className={cn(
                  "absolute -bottom-0.5 left-0 h-0.5 w-0 bg-mango transition-all duration-200 group-hover:w-full",
                  pathname === item.to && "w-full",
                )}
              />
            </Link>
          ))}
        </nav>


        <div className="flex items-center gap-2">
          {user ? (
            <Button variant="outline" size="sm" onClick={() => signOut()}>
              <LogOut className="mr-1.5 h-4 w-4" /> Sair
            </Button>
          ) : (
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link to="/entrar">Entrar</Link>
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="xl:hidden"
            aria-label="Abrir menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-border bg-background px-4 pb-4 pt-2 xl:hidden">
          <div className="grid gap-1">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  pathname === item.to && "bg-accent text-accent-foreground",
                )}
              >
                {item.label}
              </Link>
            ))}
            {!user && (
              <Link
                to="/entrar"
                onClick={() => setOpen(false)}
                className="rounded-xl bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground"
              >
                Entrar / Criar conta
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
