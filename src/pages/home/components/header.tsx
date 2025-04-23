'use client';

import * as React from 'react';
import { Link } from 'react-router-dom';
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

const components = [
  {
    title: 'Alert Dialog',
    href: '/docs/primitives/alert-dialog',
    description:
      'A modal dialog that interrupts the user with important content and expects a response.'
  },
  {
    title: 'Hover Card',
    href: '/docs/primitives/hover-card',
    description: 'For sighted users to preview content available behind a link.'
  },
  {
    title: 'Progress',
    href: '/docs/primitives/progress',
    description:
      'Displays an indicator showing the completion progress of a task, typically displayed as a progress bar.'
  },
  {
    title: 'Scroll-area',
    href: '/docs/primitives/scroll-area',
    description: 'Visually or semantically separates content.'
  },
  {
    title: 'Tabs',
    href: '/docs/primitives/tabs',
    description:
      'A set of layered sections of content—known as tab panels—that are displayed one at a time.'
  },
  {
    title: 'Tooltip',
    href: '/docs/primitives/tooltip',
    description:
      'A popup that displays information related to an element when the element receives keyboard focus or the mouse hovers over it.'
  }
];

export function Header() {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const toggleSubmenu = (menu: string) => {
    setOpenSubmenu(openSubmenu === menu ? null : menu);
  };

  return (
    <div className="container py-0  z-20 flex w-full flex-row items-center   justify-between">
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
              <NavigationMenuItem >
                <NavigationMenuTrigger className='font-semibold'>Getting started</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-6 lg:grid-cols-[.75fr_1fr]">
                    {/* <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                          href="/"
                        >
                          <div className="mb-2 mt-4 text-lg font-medium">
                            shadcn/ui
                          </div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Beautifully designed components that you can copy
                            and paste into your apps. Accessible. Customizable.
                            Open Source.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li> */}
                    <ListItem href="/docs" title="Introduction">
                      Re-usable components built using Radix UI and Tailwind
                      CSS.
                    </ListItem>
                    <ListItem href="/docs/installation" title="Installation">
                      How to install dependencies and structure your app.
                    </ListItem>
                    <ListItem
                      href="/docs/primitives/typography"
                      title="Typography"
                    >
                      Styles for headings, paragraphs, lists...etc
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuTrigger  className='font-semibold'>Components</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {components.map((component) => (
                      <ListItem
                        key={component.title}
                        title={component.title}
                        href={component.href}
                      >
                        {component.description}
                      </ListItem>
                    ))}
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem className="rounded-sm hover:bg-taskplanner ">
                <Link to="/docs">
                  <NavigationMenuLink className={navigationMenuTriggerStyle()} >
                    Documentation
                  </NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
      </div>

      {/* Auth buttons */}
      <div className="hidden h-full items-center  space-x-4 md:flex">
        <div className=" ">
          <Link to="/login" className="text-md font-semibold ">
            Login
          </Link>
        </div>
        

        <Button className="bg-blue-400 p-8 rounded-none text-white hover:bg-blue-500">
          Request Demo
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
                  className="flex items-center justify-between rounded-lg px-4 py-3 hover:bg-accent  hover:text-white"
                >
                  <span className="text-base font-medium">Home</span>
                </Link>
              </SheetClose>

              {/* Getting Started */}
              <div className="flex flex-col">
                <button
                  onClick={() => toggleSubmenu('getting-started')}
                  className="flex items-center justify-between rounded-lg px-4 py-3 hover:bg-accent  hover:text-white"
                >
                  <span className="text-base font-medium">Getting Started</span>
                  <ChevronRight
                    className={`h-4 w-4 transition-transform ${openSubmenu === 'getting-started' ? 'rotate-90' : ''}`}
                  />
                </button>

                {openSubmenu === 'getting-started' && (
                  <div className="ml-4 mt-1 space-y-1 ">
                    <SheetClose asChild>
                      <Link
                        to="/docs"
                        className="block rounded-lg px-4 py-2 text-sm hover:bg-accent/50"
                      >
                        Introduction
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        to="/docs/installation"
                        className="block rounded-lg px-4 py-2 text-sm hover:bg-accent/50"
                      >
                        Installation
                      </Link>
                    </SheetClose>
                    <SheetClose asChild>
                      <Link
                        to="/docs/primitives/typography"
                        className="block rounded-lg px-4 py-2 text-sm hover:bg-accent/50"
                      >
                        Typography
                      </Link>
                    </SheetClose>
                  </div>
                )}
              </div>

              {/* Components */}
              <div className="flex flex-col">
                <button
                  onClick={() => toggleSubmenu('components')}
                  className="flex items-center justify-between rounded-lg px-4 py-3 hover:bg-accent hover:text-white"
                >
                  <span className="text-base font-medium">Components</span>
                  <ChevronRight
                    className={`h-4 w-4 transition-transform ${openSubmenu === 'components' ? 'rotate-90' : ''}`}
                  />
                </button>

                {openSubmenu === 'components' && (
                  <div className="ml-4 mt-1 space-y-1">
                    {components.map((component) => (
                      <SheetClose key={component.title} asChild>
                        <Link
                          to={component.href}
                          className="block rounded-lg px-4 py-2 text-sm hover:bg-accent/50"
                        >
                          {component.title}
                        </Link>
                      </SheetClose>
                    ))}
                  </div>
                )}
              </div>

              {/* Documentation */}
              <SheetClose asChild>
                <Link
                  to="/docs"
                  className="flex items-center justify-between rounded-lg px-4 py-3 hover:bg-accent  hover:text-white"
                >
                  <span className="text-base font-medium">Documentation</span>
                </Link>
              </SheetClose>

              {/* Login */}
              <SheetClose asChild>
                <Link
                  to="/login"
                  className="flex items-center justify-between rounded-lg px-4 py-3 hover:bg-accent  hover:text-white"
                >
                  <span className="text-base font-medium">Login</span>
                </Link>
              </SheetClose>

              {/* Request Demo Button */}
              <SheetClose asChild>
                <Button className="bg-navy-900 hover:bg-navy-800 mt-4 w-full">
                  Request Demo
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
  React.ComponentPropsWithoutRef<'a'>
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            'block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-taskplanner hover:text-white focus:bg-taskplanner focus:text-white',
            className
          )}
          {...props}
        >
          <div className="text-sm font-semibold leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = 'ListItem';
