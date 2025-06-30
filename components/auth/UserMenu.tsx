"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, LogOut, Settings, Crown, Sparkles } from 'lucide-react';

export default function UserMenu() {
  const { user, signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    await signOut();
    setLoading(false);
  };

  if (!user) return null;

  const userInitials = user.email?.charAt(0).toUpperCase() || 'U';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-12 w-12 p-0 magnetic">
          <div className="w-12 h-12 border-3 border-current flex items-center justify-center font-bold text-lg hover:bg-muted transition-all duration-300 relative overflow-hidden">
            {userInitials}
            <div className="absolute inset-0 shimmer opacity-0 hover:opacity-100 transition-opacity"></div>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="modal-sketch w-64 bg-background" align="end" forceMount>
        <DropdownMenuLabel className="font-normal p-4">
          <div className="flex flex-col space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              <p className="text-base font-bold leading-none">Account</p>
            </div>
            <p className="text-sm leading-none text-muted-foreground font-mono">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-current opacity-20 h-0.5" />
        <DropdownMenuItem className="cursor-pointer hover:bg-muted p-4 magnetic">
          <User className="mr-3 h-5 w-5" />
          <span className="font-medium">Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer hover:bg-muted p-4 magnetic">
          <Settings className="mr-3 h-5 w-5" />
          <span className="font-medium">Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="cursor-pointer hover:bg-muted p-4 magnetic">
          <Crown className="mr-3 h-5 w-5 text-accent" />
          <span className="font-medium">Upgrade to Pro</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-current opacity-20 h-0.5" />
        <DropdownMenuItem 
          className="cursor-pointer text-red-600 focus:text-red-600 hover:bg-red-50 dark:hover:bg-red-950 p-4 magnetic"
          onClick={handleSignOut}
          disabled={loading}
        >
          <LogOut className="mr-3 h-5 w-5" />
          <span className="font-medium">{loading ? 'Signing out...' : 'Sign out'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}