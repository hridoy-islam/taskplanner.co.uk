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
        <div className="hidden items-center space-x-4 md:flex">
          <Link to="/login" className="text-sm font-medium">
            Login
          </Link>
          <Button className="bg-navy-900 hover:bg-navy-800">
            Request Demo
          </Button>
        </div>
        <div className="block md:hidden">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="size-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
            />
          </svg>
        </div>
      </div>
    </header>
  );
}
