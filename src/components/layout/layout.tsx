import React, { ReactNode, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { Header } from '../shared/header';
import SiteFooter from '../shared/site-footer';

interface LayoutProps {
  children?: ReactNode;
}
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' }); // Instant scroll
  }, [location.pathname]);


  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main>
        {children} 
        {/* <Outlet /> Render nested route components */}
      </main>
      <SiteFooter />{' '}
    </div>
  );
};

export default Layout;
