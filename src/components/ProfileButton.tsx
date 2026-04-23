"use client";
import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { User, LogIn, LogOut, Settings, Shield, Sun, Moon } from 'lucide-react';
import { useTheme } from './ThemeProvider';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string;
}

interface ProfileButtonProps {
  inNavbar?: boolean;
}

const ProfileButton: React.FC<ProfileButtonProps> = ({ inNavbar = false }) => {
  const { theme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUser(data.user);
          }
        }
      } catch (error) {
        console.error('Session check failed:', error);
      }
    };
    checkSession();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleLogin = async (email: string, password: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setShowLogin(false);
        setIsOpen(false);
      } else {
        alert('Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setIsOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <>
      <div className={inNavbar ? "relative z-[80]" : "fixed top-6 md:top-8 right-6 z-50"} ref={dropdownRef}>
        {/* Profile Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={inNavbar
            ? "flex items-center gap-1.5 p-1.5  bg-[#0000ff]/6 hover:bg-[#0000ff]/12 border border-[#0000ff]/30 transition-all duration-200 group"
            : "flex items-center gap-1.5 p-1.5  bg-foreground/5 hover:bg-foreground/10 border border-foreground/15 transition-all duration-200 group backdrop-blur-xl shadow-lg hover:shadow-xl"
          }
          aria-label="Open profile menu"
        >
          <div className="w-7 h-7  bg-accent-primary/20 border border-accent-primary/35 flex items-center justify-center overflow-hidden group-hover:border-accent-primary/50 transition-all">
            {user?.avatar ? (
              <Image src={user.avatar} alt={user.name} width={28} height={28} className="w-full h-full object-cover" />
            ) : (
              <User size={14} className="text-accent-primary" />
            )}
          </div>
        </button>

        <AnimatePresence>
          {/* Dropdown Menu */}
          {isOpen && (
            <motion.div
              className={inNavbar
                ? "absolute right-0 mt-2 w-56 bg-black border border-white/20  shadow-2xl overflow-hidden z-[100]"
                : "absolute right-0 mt-2 w-56 bg-black/85 border border-white/10  shadow-2xl overflow-hidden backdrop-blur-xl z-[60]"
              }
              initial={{ opacity: 0, y: -10, scaleX: 0.92, scaleY: 0.75, filter: 'blur(4px)' }}
              animate={{ opacity: 1, y: 0, scaleX: 1, scaleY: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -6, scaleX: 0.96, scaleY: 0.9, filter: 'blur(2px)' }}
              transition={{ duration: 0.32, ease: 'easeOut' }}
              style={{ transformOrigin: 'top right' }}
            >
            {user ? (
              <>
                <div className="p-4 border-b border-foreground/5 bg-foreground/5">
                  <p className="text-sm font-medium text-foreground">{user.name}</p>
                  <p className="text-xs text-foreground/60 mt-1">{user.email}</p>
                  {user.role === 'admin' && (
                    <div className="flex items-center gap-1 mt-2">
                      <Shield size={12} className="text-accent-primary" />
                      <span className="text-xs uppercase tracking-wide text-accent-primary font-bold">
                        Admin
                      </span>
                    </div>
                  )}
                </div>
                <div className="py-1">
                  <button
                    onClick={() => {
                      toggleTheme();
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-foreground/5 flex items-center gap-2 transition-colors"
                  >
                    {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                    <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                  </button>
                  {user.role === 'admin' && (
                    <button
                      onClick={() => {
                        window.location.href = '/admin';
                        setIsOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-foreground/5 flex items-center gap-2 transition-colors"
                    >
                      <Settings size={16} />
                      <span>Admin Panel</span>
                    </button>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-foreground/5 flex items-center gap-2 transition-colors"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="py-1">
                <button
                  onClick={() => {
                    toggleTheme();
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-foreground/5 flex items-center gap-2 transition-colors"
                >
                  {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
                  <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                </button>
                <button
                  onClick={() => {
                    setShowLogin(true);
                    setIsOpen(false);
                  }}
                  className="w-full px-4 py-2 text-left text-sm text-foreground hover:bg-foreground/5 flex items-center gap-2 transition-colors"
                >
                  <LogIn size={16} />
                  <span>Admin Login</span>
                </button>
              </div>
            )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {/* Login Modal */}
        {showLogin && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={() => setShowLogin(false)}
          />
          
          <motion.div
            className="relative w-full max-w-md bg-background border border-foreground/10  shadow-2xl overflow-hidden"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-light tracking-tight text-foreground">Admin Login</h2>
                <button
                  onClick={() => setShowLogin(false)}
                  className="p-2 hover:bg-foreground/10  transition-colors"
                >
                  <User size={20} className="text-foreground" />
                </button>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleLogin(
                    formData.get('email') as string,
                    formData.get('password') as string
                  );
                }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full bg-foreground/5 border border-foreground/10  py-3 px-4 text-sm text-foreground focus:outline-none focus:border-accent-primary/50 transition-all"
                    placeholder="admin@sitedotmoss.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    required
                    className="w-full bg-foreground/5 border border-foreground/10  py-3 px-4 text-sm text-foreground focus:outline-none focus:border-accent-primary/50 transition-all"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-accent-primary/20 hover:bg-accent-primary/30 disabled:opacity-50 text-accent-primary font-medium py-3 px-4  transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-accent-primary/30 border-t-accent-primary  animate-spin" />
                      <span>Logging in...</span>
                    </>
                  ) : (
                    <>
                      <LogIn size={18} />
                      <span>Login</span>
                    </>
                  )}
                </button>
              </form>

              <p className="text-xs text-foreground/40 text-center mt-4">
                Only admins can login
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
};

export default ProfileButton;
