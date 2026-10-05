import { Link, useRouterState } from "@tanstack/react-router";
import {
  LogOut,
  MapPinned,
  LayoutList,
  Crown,
} from "lucide-react";
import { NAV } from "@/lib/nav";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Header() {
  const { user, signOut, isAdmin } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-50 border-b bg-[var(--header)] text-foreground">
      <div className="mx-auto flex max-w-[1340px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 pb-1.5 pt-2.5">
        <Link to="/" className="flex min-w-0 items-center gap-2.5">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
            <MapPinned className="h-5 w-5" />
          </span>
          <span className="min-w-0 leading-[1.2]">
            <span className="block font-display text-[1.1rem] font-extrabold">
              Conecta Santa Regina
            </span>
            <span className="block text-[0.8rem] text-muted-foreground">
              O ponto de encontro do nosso bairro
            </span>
          </span>
        </Link>

        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden md:inline-flex">
                <Link to="/minhas-publicacoes">
                  <LayoutList className="h-4 w-4" /> Minhas publicações
                </Link>
              </Button>
              {isAdmin && (
                <Button asChild variant="ghost" size="sm">
                  <Link to="/admin">
                    <Crown className="h-4 w-4" /> Admin
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => signOut()}>
                <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Sair</span>
              </Button>
            </>
          ) : (
            <Button asChild size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Link to="/entrar">Entrar ou criar conta</Link>
            </Button>
          )}
        </div>

        <nav aria-label="Seções" className="order-last flex w-full gap-1 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              aria-current={pathname === item.to ? "page" : undefined}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[0.92rem] font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground",
                pathname === item.to && "bg-secondary text-secondary-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
          {user ? (
            <Link to="/minhas-publicacoes" className="shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[0.92rem] font-semibold text-muted-foreground md:hidden">
              Minhas publicações
            </Link>
          ) : null}
        </nav>
      </div>
    </header>
  );
}
