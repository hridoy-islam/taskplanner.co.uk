'use client';

import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle
} from '@/components/ui/navigation-menu';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
  SheetClose
} from '@/components/ui/sheet';
import { ChevronRight, Menu } from 'lucide-react';
import { useState } from 'react';
import tlogo from '@/assets/imges/home/resource.png';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

const features = [
  {
    title: 'Team Collaboration',
    href: 'team-collaboration',
    description:
      'Work seamlessly with your team members on shared tasks and projects'
  },
  {
    title: 'Group Project',
    href: 'group-project',
    description: 'Manage complex projects with multiple team members and tasks'
  },
  {
    title: 'Note',
    href: 'note',
    description: 'Keep all your important notes organized and accessible'
  },
  {
    title: 'Planner',
    href: 'planner',
    description: 'Plan your day, week, or month with our intuitive planner'
  },
  {
    title: 'Automation',
    href: 'automation',
    description:
      'Automate repetitive tasks to save time and increase productivity'
  },
  {
    title: 'Reminder',
    href: 'reminder',
    description: 'Never miss important deadlines with our smart reminder system'
  }
];

const solutions = [
  {
    title: 'Task Management',
    href: 'task-management',
    description: 'Efficiently manage your daily tasks and to-dos'
  },
  {
    title: 'Project Management',
    href: 'project-management',
    description: 'Complete project management solution for teams of all sizes'
  },
  {
    title: 'Personal',
    href: 'personal',
    description: 'Tools to organize your personal life and daily routines'
  },
  {
    title: 'Education',
    href: 'education',
    description: 'Specialized tools for students and educators'
  },
  {
    title: 'Marketing & Sales',
    href: 'marketing-sales',
    description: 'Streamline your marketing and sales processes'
  },
  {
    title: 'Customer Support',
    href: 'customer-support',
    description: 'Manage customer queries and support tickets efficiently'
  }
];

const resources = [
  {
    title: 'Task Planner Guide',
    href: 'guide',
    description: 'Learn how to get the most out of our task planner'
  },
  {
    title: 'Customer Stories',
    href: 'customer-stories',
    description: 'See how our customers are using our product'
  },
  {
    title: 'Help Resource',
    href: 'help',
    description: 'Get help with any questions or issues you might have'
  }
];

export function Header() {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const navigate = useNavigate();

  const { user } = useSelector((state: RootState) => state.auth);
  
  const toggleSubmenu = (menu: string) => {
    setOpenSubmenu(openSubmenu === menu ? null : menu);
  };

const handleRoute = () => {
    // 1. If not logged in, go to Signup/Getting Started
    if (!user) {
      navigate('/signup');
      return;
    }

    // 2. If logged in, route based on Role
    if (user.role === 'admin') {
      navigate('/dashboard/admin');
    } 
    else if (user.role === 'company') {
      navigate(`/company/${user._id}`);
    } 
    else {
      // Regular user / Employee
      navigate(`/company/${user.company}/user/${user._id}`);
    }
  };

  return (
    <div className="container z-20 flex w-full flex-row items-center justify-between py-0">
      {/* Logo */}
      <div className="flex flex-row items-center justify-start gap-2">
        <div>
          <Link to="/" className="flex items-center space-x-2">
            <img src="/logo.png" alt="Logo" className="w-28 md:w-32" />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden justify-center md:flex">
          <NavigationMenu>
            <NavigationMenuList>
              {/* Features Menu */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="font-semibold">
                  Features
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-6 lg:grid-cols-2">
                    {features.map((feature) => (
                      <ListItem
                        key={feature.title}
                        title={feature.title}
                        href={feature.href}
                      >
                        {feature.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Solutions Menu */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="font-semibold">
                  Solutions
                </NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-6 lg:grid-cols-2">
                    {solutions.map((solution) => (
                      <ListItem
                        key={solution.title}
                        title={solution.title}
                        href={solution.href}
                      >
                        {solution.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              {/* Resources Menu */}
              <NavigationMenuItem>
                <NavigationMenuTrigger className="font-semibold">
                  Resources
                </NavigationMenuTrigger>
                <NavigationMenuContent className="flex w-[800px] flex-row items-start gap-6 p-4">
                  <ul className="grid w-2/3 gap-4">
                    {resources.map((resource) => (
                      <ListItem
                        key={resource.title}
                        title={resource.title}
                        href={resource.href}
                      >
                        {resource.description}
                      </ListItem>
                    ))}
                  </ul>
                  <div className="flex h-full w-1/3 items-center justify-center">
                    <img
                      src={tlogo}
                      alt="Resources Illustration"
                      className="h-64 rounded-lg object-cover shadow-md "
                    />
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>

      {/* Auth buttons */}
      <div className="hidden h-full items-center space-x-4 md:flex">
        {!user && (
          <div className="">
            <Link to="/login" className="text-md font-semibold">
              Login
            </Link>
          </div>
        )}

        <Button 
          className="rounded-none bg-taskplanner/85 p-8 font-bold text-white hover:bg-taskplanner/95" 
          onClick={handleRoute}
        >
          {user ? 'Dashboard' : 'Getting Started'}
        </Button>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[90vw] max-w-sm">
            <SheetHeader>
              <SheetTitle className="text-left text-lg">Menu</SheetTitle>
            </SheetHeader>
            <div className="mt-6 flex flex-col space-y-2">
              {/* Home Link */}
              <SheetClose asChild>
                <Link
                  to="/"
                  className="flex items-center justify-between rounded-lg px-4 py-3 hover:bg-accent hover:text-white"
                >
                  <span className="text-base font-medium">Home</span>
                </Link>
              </SheetClose>

              {/* Features */}
              <div className="flex flex-col">
                <button
                  onClick={() => toggleSubmenu('features')}
                  className="flex items-center justify-between rounded-lg px-4 py-3 hover:bg-accent hover:text-white"
                >
                  <span className="text-base font-medium">Features</span>
                  <ChevronRight
                    className={`h-4 w-4 transition-transform ${openSubmenu === 'features' ? 'rotate-90' : ''}`}
                  />
                </button>

                {openSubmenu === 'features' && (
                  <div className="ml-4 mt-1 space-y-1">
                    {features.map((feature) => (
                      <SheetClose key={feature.title} asChild>
                        <Link
                          to={feature.href}
                          className="block rounded-lg px-4 py-2 text-sm hover:bg-accent/50"
                        >
                          {feature.title}
                        </Link>
                      </SheetClose>
                    ))}
                  </div>
                )}
              </div>

              {/* Solutions */}
              <div className="flex flex-col">
                <button
                  onClick={() => toggleSubmenu('solutions')}
                  className="flex items-center justify-between rounded-lg px-4 py-3 hover:bg-accent hover:text-white"
                >
                  <span className="text-base font-medium">Solutions</span>
                  <ChevronRight
                    className={`h-4 w-4 transition-transform ${openSubmenu === 'solutions' ? 'rotate-90' : ''}`}
                  />
                </button>

                {openSubmenu === 'solutions' && (
                  <div className="ml-4 mt-1 space-y-1">
                    {solutions.map((solution) => (
                      <SheetClose key={solution.title} asChild>
                        <Link
                          to={solution.href}
                          className="block rounded-lg px-4 py-2 text-sm hover:bg-accent/50"
                        >
                          {solution.title}
                        </Link>
                      </SheetClose>
                    ))}
                  </div>
                )}
              </div>

              {/* Resources */}
              <div className="flex flex-col">
                <button
                  onClick={() => toggleSubmenu('resources')}
                  className="flex items-center justify-between rounded-lg px-4 py-3 hover:bg-accent hover:text-white"
                >
                  <span className="text-base font-medium">Resources</span>
                  <ChevronRight
                    className={`h-4 w-4 transition-transform ${openSubmenu === 'resources' ? 'rotate-90' : ''}`}
                  />
                </button>

                {openSubmenu === 'resources' && (
                  <div className="ml-4 mt-1 space-y-1">
                    {resources.map((resource) => (
                      <SheetClose key={resource.title} asChild>
                        <Link
                          to={resource.href}
                          className="block rounded-lg px-4 py-2 text-sm hover:bg-accent/50"
                        >
                          {resource.title}
                        </Link>
                      </SheetClose>
                    ))}
                  </div>
                )}
              </div>

              {/* Login - only show when user is not logged in */}
              {!user && (
                <SheetClose asChild>
                  <Link
                    to="/login"
                    className="flex items-center justify-between rounded-lg px-4 py-3 hover:bg-accent hover:text-white"
                  >
                    <span className="text-base font-medium">Login</span>
                  </Link>
                </SheetClose>
              )}

              {/* Request Demo Button */}
              <SheetClose asChild>
                <Button 
                  className="bg-navy-900 hover:bg-navy-800 mt-4 w-full" 
                  onClick={handleRoute}
                >
                  {user ? 'Dashboard' : 'Getting Started'}
                </Button>
              </SheetClose>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}


const ListItem = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<'a'> & { title: string; href: string }
>(({ className, title, children, href, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref as any} // Cast ref to `any` because `Link` doesn't directly accept a ref of type `HTMLAnchorElement`
          to={href} // Use `to` prop instead of `href` for `Link`
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-taskplanner hover:text-white focus:bg-taskplanner focus:text-white',
            className
          )}
          {...props}
        >
          <div className="text-sm font-semibold leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug">{children}</p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = 'ListItem';