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
        <div className="container-custom py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-10">
              <div className="flex items-center space-x-4 group">
                <div className="w-10 h-10 border-3 border-current flex items-center justify-center magnetic">
                  <div className="w-5 h-5 border-2 border-dashed border-current transform rotate-12 animate-pulse-enhanced"></div>
                </div>
                <h1 className="text-2xl font-bold font-mono tracking-tight glitch-text" data-text="ChronoBlock">
                  ChronoBlock
                </h1>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center">
                <ViewSwitcher currentView={currentView} setCurrentView={setCurrentView} />
              </div>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-8">
              <button 
                onClick={toggleTheme}
                className="p-3 hover:bg-muted transition-all duration-300 magnetic border-2 border-transparent hover:border-current"
                title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>
              
              <div className="text-muted-foreground font-mono border-l-2 border-current pl-6">
                <div className="text-sm font-semibold">{format(new Date(), 'MMM d, yyyy')}</div>
                <div className="text-xs opacity-70">{format(new Date(), 'EEEE')}</div>
              </div>

              {/* Auth Section */}
              {loading ? (
                <div className="w-12 h-12 border-3 border-current animate-pulse-enhanced magnetic"></div>
              ) : user ? (
                <UserMenu />
              ) : (
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="btn-sketch liquid-button px-6 py-3 flex items-center gap-3 magnetic-button"
                >
                  <LogIn size={18} />
                  <span className="font-semibold">Sign In</span>
                </button>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-3 hover:bg-muted transition-all duration-300 magnetic border-2 border-transparent hover:border-current"
              >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-8 pt-8 border-t-3 border-current space-y-8 animate-float">
              <ViewSwitcher currentView={currentView} setCurrentView={setCurrentView} />
              
              <div className="flex items-center justify-between">
                <button 
                  onClick={toggleTheme}
                  className="flex items-center gap-3 text-sm magnetic"
                >
                  {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                  <span className="font-semibold">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                </button>
                
                <div className="text-muted-foreground text-sm font-mono">
                  <div>{format(new Date(), 'MMM d')}</div>
                </div>
              </div>
              
              {/* Mobile Auth Section */}
              <div className="pt-6 border-t-2 border-current">
                {loading ? (
                  <div className="w-full h-14 border-3 border-current animate-pulse-enhanced"></div>
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
                    className="btn-sketch liquid-button w-full py-4 flex items-center justify-center gap-3"
                  >
                    <LogIn size={18} />
                    <span className="font-semibold">Sign In</span>
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
    <div className="flex border-3 border-current overflow-hidden">
      <button
        onClick={() => setCurrentView('calendar')}
        className={cn(
          "px-6 py-3 flex items-center gap-3 text-sm font-semibold transition-all duration-300 relative overflow-hidden",
          currentView === 'calendar' 
            ? "bg-foreground text-background" 
            : "bg-transparent hover:bg-muted magnetic"
        )}
      >
        <CalendarIcon size={18} />
        <span>Calendar</span>
        {currentView === 'calendar' && (
          <div className="absolute inset-0 shimmer"></div>
        )}
      </button>
    </div>
  );
}