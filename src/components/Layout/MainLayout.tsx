import { ReactNode } from 'react';

import Footer from './Footer';
import Header from './Header';

interface MainLayoutProps {
  children: ReactNode;
  isAuthenticated?: boolean;
  username?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  isAuthenticated = false,
  username = '',
}) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header isAuthenticated={isAuthenticated} username={username} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
};

export default MainLayout;
