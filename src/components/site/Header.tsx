import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Menu,
  X,
  LogOut,
  MapPinned,
  LayoutList,
  Crown,
  Home,
  ShoppingBag,
  Building2,
  Briefcase,
  Newspaper,
  Lightbulb,
  HeartHandshake,
  MessageCircle,
  LogIn,
  ChevronRight,
} from "lucide-react";
import { NAV } from "@/lib/nav";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ReactNode> = {
  "/": <Home className="h-5 w-5" />,
  "/comercio": <ShoppingBag className="h-5 w-5" />,
  "/saude": <Building2 className="h-5 w-5" />,
  "/empregos": <Briefcase className="h-5 w-5" />,
  "/imoveis": <Home className="h-5 w-5" />,
  "/novidades": <Newspaper className="h-5 w-5" />,
  "/melhorias": <Lightbulb className="h-5 w-5" />,
  "/acoes": <HeartHandshake className="h-5 w-5" />,
  "/contato": <MessageCircle className="h-5 w-5" />,
};

export function Header() {
  const [open, setOpen] = useState(false);
  const { user, signOut, isAdmin } = useAuth();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/90 backdrop-blur">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-4 px-4 py-3 lg:flex lg:justify-between">
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <MapPinned className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate font-display text-base font-extrabold leading-tight">
              Conecta Santa Regina
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              O ponto de encontro do nosso bairro
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 xl:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                pathname === item.to && "bg-accent text-accent-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                <Link to="/minhas-publicacoes">
                  <LayoutList className="mr-1.5 h-4 w-4" /> Minhas publicações
                </Link>
              </Button>
              {isAdmin && (
                <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
                  <Link to="/admin">
                    <Crown className="mr-1.5 h-4 w-4" /> Admin
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => signOut()} className="hidden sm:inline-flex">
                <LogOut className="mr-1.5 h-4 w-4" /> Sair
              </Button>
            </>
          ) : (
            <Button asChild size="sm" className="hidden sm:inline-flex">
              <Link to="/entrar">Entrar</Link>
            </Button>
          )}

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 xl:hidden"
                aria-label="Abrir menu"
              >
                <Menu className="h-5 w-5" />
                <span className="text-sm font-medium">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="flex w-full flex-col sm:max-w-sm">
              <SheetHeader className="pb-2 text-left">
                <SheetTitle className="font-display text-lg font-extrabold">
                  Conecta Santa Regina
                </SheetTitle>
                <p className="text-sm text-muted-foreground">Escolha uma categoria</p>
              </SheetHeader>

              <nav className="flex-1 overflow-y-auto py-4">
                <div className="grid gap-1">
                  {NAV.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                        pathname === item.to
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                      )}
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-background/10">
                        {ICONS[item.to]}
                      </span>
                      <span className="flex-1">{item.label}</span>
                      <ChevronRight className="h-4 w-4 shrink-0 opacity-60" />
                    </Link>
                  ))}
                </div>
              </nav>

              <div className="border-t border-border pt-4">
                {user ? (
                  <div className="grid gap-2">
                    <p className="px-3 text-xs font-medium text-muted-foreground">Sua conta</p>
                    <Button asChild variant="ghost" className="justify-start gap-3 px-3">
                      <Link to="/minhas-publicacoes" onClick={() => setOpen(false)}>
                        <LayoutList className="h-5 w-5" /> Minhas publicações
                      </Link>
                    </Button>
                    {isAdmin && (
                      <Button asChild variant="ghost" className="justify-start gap-3 px-3">
                        <Link to="/admin" onClick={() => setOpen(false)}>
                          <Crown className="h-5 w-5" /> Painel do administrador
                        </Link>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      className="justify-start gap-3 px-3 text-destructive hover:text-destructive"
                      onClick={() => {
                        setOpen(false);
                        signOut();
                      }}
                    >
                      <LogOut className="h-5 w-5" /> Sair
                    </Button>
                  </div>
                ) : (
                  <Button asChild className="w-full gap-2">
                    <Link to="/entrar" onClick={() => setOpen(false)}>
                      <LogIn className="h-5 w-5" /> Entrar / Criar conta
                    </Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
