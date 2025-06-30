"use client";

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import { useAuth } from '@/contexts/AuthContext';
import { CalendarIcon, Menu, X, LogIn, Sun, Moon } from 'lucide-react';
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
      <header className="nav-sketch sticky top-0 z-50">
        <div className="container-custom py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 border-2 border-current flex items-center justify-center">
                  <div className="w-4 h-4 border border-dashed border-current transform rotate-12"></div>
                </div>
                <h1 className="text-xl font-bold font-mono tracking-tight">
                  ChronoBlock
                </h1>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center">
                <ViewSwitcher currentView={currentView} setCurrentView={setCurrentView} />
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-6">
              <button 
                onClick={toggleTheme}
                className="p-2 hover:bg-muted rounded-none transition-colors"
                title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
              </button>
              
              <div className="text-muted-foreground text-sm font-mono">
                {format(new Date(), 'MMM d, yyyy')}
              </div>

              {/* Auth Section */}
              {loading ? (
                <div className="w-10 h-10 border-2 border-current animate-pulse-sketch"></div>
              ) : user ? (
                <UserMenu />
              ) : (
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="btn-sketch px-4 py-2 flex items-center gap-2"
                >
                  <LogIn size={16} />
                  <span>Sign In</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 hover:bg-muted transition-colors"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-6 pt-6 border-t-2 border-current space-y-6">
              <ViewSwitcher currentView={currentView} setCurrentView={setCurrentView} />
              
              <div className="flex items-center justify-between">
                <button 
                  onClick={toggleTheme}
                  className="flex items-center gap-2 text-sm"
                >
                  {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                  <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                </button>
                
                <div className="text-muted-foreground text-sm font-mono">
                  {format(new Date(), 'MMM d')}
                </div>
              </div>
              
              {/* Mobile Auth Section */}
              <div className="pt-4 border-t border-current">
                {loading ? (
                  <div className="w-full h-12 border-2 border-current animate-pulse-sketch"></div>
                ) : user ? (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground font-mono">
                      {user.email}
                    </span>
                    <UserMenu />
                  </div>
                ) : (
                  <button 
                    onClick={() => setShowAuthModal(true)}
                    className="btn-sketch w-full py-3 flex items-center justify-center gap-2"
                  >
                    <LogIn size={16} />
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
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
    <div className="flex border-2 border-current">
      <button
        onClick={() => setCurrentView('calendar')}
        className={cn(
          "px-4 py-2 flex items-center gap-2 text-sm font-medium transition-all",
          currentView === 'calendar' 
            ? "bg-foreground text-background" 
            : "bg-transparent hover:bg-muted"
        )}
      >
        <CalendarIcon size={16} />
        <span>Calendar</span>
      </button>
    </div>
  );
}