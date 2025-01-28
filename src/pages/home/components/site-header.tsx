import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export function SiteHeader() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <img src="/logo.png" alt="Logo" className="w-32" />
        </Link>
        <nav className="hidden items-center space-x-6 md:flex">
          <a href="#features" className="text-sm font-medium">
            Features
          </a>
          <a href="#how-it-works" className="text-sm font-medium">
            How it works
          </a>
          <a href="#pricing" className="text-sm font-medium">
            Pricing
          </a>
        </nav>
        <div className="hidden items-center space-x-4 md:flex">
          <Link to="/login" className="text-sm font-medium">
            Login
          </Link>
          <Button className="bg-navy-900 hover:bg-navy-800">
            Request Demo
          </Button>
        </div>
        <div className="block md:hidden" onClick={toggleSidebar}>
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

      {/* Sidebar */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50">
          <div className="fixed right-0 top-0 z-50 h-full w-64 bg-white shadow-lg">
            <div className="flex justify-end p-4">
              <button
                className="text-gray-600 hover:text-gray-900"
                onClick={toggleSidebar}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="flex w-full flex-col items-start space-y-4 p-6">
              <a
                href="#features"
                className="text-md w-full  px-2 py-2  font-medium hover:bg-black hover:text-white"
                onClick={toggleSidebar}
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-md w-full  px-2 py-2  font-medium hover:bg-black hover:text-white"
                onClick={toggleSidebar}
              >
                How it works
              </a>
              <a
                href="#pricing"
                className="text-md w-full  px-2 py-2  font-medium hover:bg-black hover:text-white"
                onClick={toggleSidebar}
              >
                Pricing
              </a>
              <Link
                to="/login"
                className="text-md w-full  px-2 py-2  font-medium hover:bg-black hover:text-white"
                onClick={toggleSidebar}
              >
                Login
              </Link>

              <button
                className="text-md  rounded-lg border border-gray-400 px-2 py-3 font-medium shadow-lg  hover:bg-black hover:text-white"
                onClick={toggleSidebar}
              >
                Request Demo
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
