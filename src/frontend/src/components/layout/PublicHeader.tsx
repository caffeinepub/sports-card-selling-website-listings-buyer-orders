import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { ShieldCheck } from 'lucide-react';
import LoginButton from '../auth/LoginButton';

export default function PublicHeader() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <button
            onClick={() => navigate({ to: '/' })}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <img
              src="/assets/generated/logo-sports-cards.dim_512x512.png"
              alt="Sports Cards"
              className="h-10 w-10 object-contain"
            />
            <span className="text-xl font-bold hidden sm:inline">Sports Cards</span>
          </button>

          <nav className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate({ to: '/' })}>
              Store
            </Button>
            <Button variant="ghost" onClick={() => navigate({ to: '/admin' })}>
              <ShieldCheck className="mr-2 h-4 w-4" />
              Admin
            </Button>
            <LoginButton />
          </nav>
        </div>
      </div>
    </header>
  );
}
