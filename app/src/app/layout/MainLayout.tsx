import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/features/auth/stores/authStore'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  Upload,
  Tag,
  List,
  Clock,
  Menu,
  LogOut,
  Wallet,
} from 'lucide-react'
import { useState } from 'react'

const NAV_ITEMS = [
  { to: '/app', label: 'Tableau de bord', icon: LayoutDashboard, exact: true },
  { to: '/app/import', label: 'Importer', icon: Upload },
  { to: '/app/categorize', label: 'Catégoriser', icon: Tag },
  { to: '/app/transactions', label: 'Transactions', icon: List },
  { to: '/app/pending', label: 'En attente', icon: Clock },
]

export function MainLayout() {
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isActive = (to: string, exact?: boolean) =>
    exact ? location.pathname === to : location.pathname.startsWith(to)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const NavLink = ({
    to,
    label,
    icon: Icon,
    exact,
    mobile = false,
  }: {
    to: string
    label: string
    icon: React.ElementType
    exact?: boolean
    mobile?: boolean
  }) => {
    const active = isActive(to, exact)
    return (
      <Link
        to={to}
        onClick={() => mobile && setMobileOpen(false)}
        className={cn(
          'flex items-center gap-2 text-sm font-medium transition-colors px-3 py-2 rounded-md',
          mobile ? 'w-full text-base py-3' : '',
          active
            ? 'text-primary bg-accent'
            : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'
        )}
      >
        <Icon className={cn('shrink-0', mobile ? 'h-5 w-5' : 'h-4 w-4')} />
        {label}
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-card/80 backdrop-blur-sm">
        <div className="container flex h-14 items-center justify-between gap-4">
          {/* Logo */}
          <Link
            to="/app"
            className="flex items-center gap-2 font-semibold text-foreground"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
              <Wallet className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-base font-semibold tracking-tight">
              Finzeo
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink key={item.to} {...item} />
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* User info — desktop */}
            {user?.email && (
              <span className="hidden lg:block text-xs text-muted-foreground max-w-[160px] truncate">
                {user.email}
              </span>
            )}

            {/* Sign out — desktop */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSignOut}
              className="hidden md:flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:inline">Déconnexion</span>
            </Button>

            {/* Mobile menu */}
            <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Menu"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 p-0">
                <div className="flex flex-col h-full">
                  {/* Sheet header */}
                  <div className="flex items-center gap-2 px-4 py-4 border-b border-border">
                    <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                      <Wallet className="h-4 w-4 text-primary-foreground" />
                    </div>
                    <span className="font-semibold">Finzeo</span>
                  </div>

                  {/* Sheet nav */}
                  <nav className="flex flex-col gap-1 p-3 flex-1">
                    {NAV_ITEMS.map((item) => (
                      <NavLink key={item.to} {...item} mobile />
                    ))}
                  </nav>

                  {/* Sheet footer */}
                  <div className="p-3 border-t border-border">
                    {user?.email && (
                      <p className="text-xs text-muted-foreground px-3 mb-2 truncate">
                        {user.email}
                      </p>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setMobileOpen(false)
                        handleSignOut()
                      }}
                      className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
                    >
                      <LogOut className="h-4 w-4" />
                      Déconnexion
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container py-6">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  )
}
