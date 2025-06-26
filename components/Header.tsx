"use client";

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { useAuth } from '@/contexts/AuthContext';
import { CalendarIcon, Menu, X, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from 'next-themes';
import { format } from 'date-fns';
import AuthModal from '@/components/auth/AuthModal';
import UserMenu from '@/components/auth/UserMenu';

export default function Header() {
  const { currentView, setCurrentView } = useStore();
  const { user, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <>
      <header className="border-b border-border sticky top-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400"
                style={{ fontFamily: "'Courier New', monospace" }}>
              ChronoBlock
            </h1>
            <div className="hidden md:flex items-center ml-6">
              <ViewSwitcher currentView={currentView} setCurrentView={setCurrentView} />
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={toggleTheme} 
              className="text-muted-foreground hover:text-foreground"
            >
              {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
            </Button>
            
            <div className="text-muted-foreground text-sm">
              {format(new Date(), 'MMMM d, yyyy')}
            </div>

            {/* Auth Section */}
            {loading ? (
              <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
            ) : user ? (
              <UserMenu />
            ) : (
              <Button 
                onClick={() => setShowAuthModal(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Button>
            )}
          </div>

          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-foreground"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-3 px-4 space-y-4 border-t border-border bg-background">
            <ViewSwitcher currentView={currentView} setCurrentView={setCurrentView} />
            <div className="flex items-center justify-between">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={toggleTheme}
                className="text-muted-foreground hover:text-foreground"
              >
                {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
              </Button>
              <div className="text-muted-foreground text-sm">
                {format(new Date(), 'MMMM d, yyyy')}
              </div>
            </div>
            
            {/* Mobile Auth Section */}
            <div className="pt-2 border-t border-border">
              {loading ? (
                <div className="w-full h-10 rounded bg-muted animate-pulse" />
              ) : user ? (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Signed in as {user.email}
                  </span>
                  <UserMenu />
                </div>
              ) : (
                <Button 
                  onClick={() => setShowAuthModal(true)}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        )}
      </header>

      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </>
  );
}

interface ViewSwitcherProps {
  currentView: string;
  setCurrentView: (view: any) => void;
}

function ViewSwitcher({ currentView, setCurrentView }: ViewSwitcherProps) {
  return (
    <div className="flex bg-muted rounded-md p-0.5">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setCurrentView('calendar')}
        className={cn(
          "rounded-sm h-8",
          currentView === 'calendar' && "bg-white dark:bg-gray-800 shadow-sm"
        )}
      >
        <CalendarIcon size={16} className="mr-2" />
        Calendar
      </Button>
    </div>
  );
}