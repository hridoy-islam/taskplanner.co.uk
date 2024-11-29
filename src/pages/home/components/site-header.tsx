import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <img src="/logo.png" alt="Logo" className="w-32" />
        </Link>
        <nav className="hidden items-center space-x-6 md:flex">
          <Link to="#features" className="text-sm font-medium">
            Features
          </Link>
          <Link to="#how-it-works" className="text-sm font-medium">
            How it works
          </Link>
          <Link to="#pricing" className="text-sm font-medium">
            Pricing
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          <Link to="/login" className="text-sm font-medium">
            Login
          </Link>
          <Button className="bg-navy-900 hover:bg-navy-800">
            Request Demo
          </Button>
        </div>
      </div>
    </header>
  );
}
