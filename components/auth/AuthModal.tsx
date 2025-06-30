"use client";

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, Lock, Eye, EyeOff, AlertTriangle, CheckCircle, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { signIn, signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError(null);
    setSuccess(null);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await signIn(formData.email, formData.password);
    
    if (error) {
      setError(error.message);
    } else {
      onClose();
    }
    
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const { error } = await signUp(formData.email, formData.password);
    
    if (error) {
      setError(error.message);
    } else {
      setSuccess('Account created successfully! You can now sign in.');
    }
    
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="modal-sketch sm:max-w-lg bg-background">
        <DialogHeader className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 border-3 border-current flex items-center justify-center magnetic relative">
              <div className="w-10 h-10 border-2 border-dashed border-current transform rotate-12 animate-pulse-enhanced"></div>
              <Sparkles className="absolute -top-2 -right-2 w-6 h-6 text-accent animate-float" />
            </div>
          </div>
          <DialogTitle className="text-3xl font-bold font-mono glitch-text" data-text="Welcome to ChronoBlock">
            Welcome to ChronoBlock
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-lg">
            Sign in to your account or create a new one to start mastering your time
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="signin" className="w-full mt-8">
          <TabsList className="grid w-full grid-cols-2 border-3 border-current bg-transparent p-0 h-auto">
            <TabsTrigger 
              value="signin" 
              className="data-[state=active]:bg-foreground data-[state=active]:text-background border-r-2 border-current py-4 text-base font-semibold magnetic"
            >
              Sign In
            </TabsTrigger>
            <TabsTrigger 
              value="signup"
              className="data-[state=active]:bg-foreground data-[state=active]:text-background py-4 text-base font-semibold magnetic"
            >
              Sign Up
            </TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-8 mt-8">
            <form onSubmit={handleSignIn} className="form-sketch space-y-6">
              <div className="space-y-3">
                <Label htmlFor="signin-email" className="text-base font-semibold">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                  <Input
                    id="signin-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-12 h-12 text-base"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="signin-password" className="text-base font-semibold">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                  <Input
                    id="signin-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-12 pr-12 h-12 text-base"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors magnetic"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {error && (
                <Alert className="notification-sketch border-red-500 bg-red-50 dark:bg-red-950">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <AlertDescription className="text-red-700 dark:text-red-300 font-medium">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="btn-sketch liquid-button w-full py-4 text-lg font-bold magnetic-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="loader-sketch w-5 h-5 mr-3"></div>
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-8 mt-8">
            <form onSubmit={handleSignUp} className="form-sketch space-y-6">
              <div className="space-y-3">
                <Label htmlFor="signup-email" className="text-base font-semibold">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                  <Input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="pl-12 h-12 text-base"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="signup-password" className="text-base font-semibold">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                  <Input
                    id="signup-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="pl-12 pr-12 h-12 text-base"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors magnetic"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="confirm-password" className="text-base font-semibold">Confirm Password</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                  <Input
                    id="confirm-password"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="pl-12 h-12 text-base"
                    required
                  />
                </div>
              </div>

              {error && (
                <Alert className="notification-sketch border-red-500 bg-red-50 dark:bg-red-950">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  <AlertDescription className="text-red-700 dark:text-red-300 font-medium">
                    {error}
                  </AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="notification-sketch border-green-500 bg-green-50 dark:bg-green-950">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <AlertDescription className="text-green-700 dark:text-green-300 font-medium">
                    {success}
                  </AlertDescription>
                </Alert>
              )}

              <Button 
                type="submit" 
                className="btn-sketch liquid-button w-full py-4 text-lg font-bold magnetic-button"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="loader-sketch w-5 h-5 mr-3"></div>
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}