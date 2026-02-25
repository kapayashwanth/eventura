"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Menu, X, User, LogOut, Calendar } from "lucide-react";

interface NavbarProps {
  onLoginClick?: () => void;
  onSignupClick?: () => void;
  onAboutClick?: () => void;
  onPastEventsClick?: () => void;
  onUpcomingEventsClick?: () => void;
  onContactClick?: () => void;
  onHomeClick?: () => void;
  onProfileClick?: () => void;
  onRegisteredEventsClick?: () => void;
  onAdminClick?: () => void;
  isAuthenticated?: boolean;
  isAdmin?: boolean;
  onLogout?: () => void;
  userName?: string;
}

export function Navbar({ 
  onLoginClick, 
  onSignupClick, 
  onAboutClick,
  onPastEventsClick,
  onUpcomingEventsClick,
  onContactClick,
  onHomeClick,
  onProfileClick,
  onRegisteredEventsClick,
  onAdminClick,
  isAuthenticated, 
  isAdmin,
  onLogout, 
  userName 
}: NavbarProps) {
  const [isHovered, setIsHovered] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Home", href: "#home", onClick: onHomeClick },
    { name: "About", href: "#about", onClick: onAboutClick },
    { name: "Past Events", href: "#past-events", onClick: onPastEventsClick },
    { name: "Upcoming Events", href: "#upcoming-events", onClick: onUpcomingEventsClick },
    { name: "Contact", href: "#contact", onClick: onContactClick },
    ...(isAuthenticated && isAdmin ? [{ name: "Admin", href: "#admin", onClick: onAdminClick }] : []),
  ];

  const handleNavClick = (onClick?: () => void) => {
    if (onClick) onClick();
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-black/95 backdrop-blur-md border-b border-white/10">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-shrink-0"
          >
            <button onClick={() => handleNavClick(onHomeClick)} className="hover:opacity-80 transition-opacity flex items-center gap-3">
              <img 
                src="/logo.svg" 
                alt="Amrita Vishwa Vidyapeetham" 
                className="h-7 sm:h-9 w-auto object-contain"
              />
              <div className="h-6 sm:h-8 w-px bg-white/30 -mr-4" />
              <img 
                src="/logo2.png" 
                alt="Eventura" 
                className="h-10 sm:h-12 w-auto object-contain scale-[4] origin-left -ml-3"
              />
            </button>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6">
            {navItems.map((item, index) => (
              <motion.button
                key={item.name}
                onClick={item.onClick}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 * (index + 1) }}
                onMouseEnter={() => setIsHovered(item.name)}
                onMouseLeave={() => setIsHovered(null)}
                className="relative text-sm font-medium transition-all duration-300 bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80 hover:from-white hover:to-white"
              >
                {item.name}
                {isHovered === item.name && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-300 via-white to-rose-300"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
              </motion.button>
            ))}
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative">
                <button 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-rose-500 text-white rounded-full text-sm font-medium hover:from-indigo-600 hover:to-rose-600 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  Hello, {userName || 'User'}
                  <svg 
                    className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-black/90 backdrop-blur-md border border-white/10 rounded-xl shadow-xl overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-white/10">
                      <p className="text-sm text-white/90 font-medium">{userName || 'User'}</p>
                      <p className="text-xs text-white/50 mt-0.5">Member</p>
                    </div>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onProfileClick?.();
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-white/80 hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onRegisteredEventsClick?.();
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-white/80 hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      Registered Events
                    </button>
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout?.();
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-white/80 hover:bg-white/10 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              <>
                <button 
                  onClick={onLoginClick}
                  className="px-6 py-2 text-sm font-medium transition-all duration-300 text-white hover:text-white/80 border border-white/20 rounded-full hover:border-white/40"
                >
                  Login
                </button>
                <button 
                  onClick={onSignupClick}
                  className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-rose-500 text-white rounded-full text-sm font-medium hover:from-indigo-600 hover:to-rose-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  Signup
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden"
            >
              <div className="pt-4 pb-3 space-y-1">
                {/* Navigation Links */}
                {navItems.map((item, index) => (
                  <motion.button
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    onClick={() => handleNavClick(item.onClick)}
                    className="block w-full text-left px-4 py-3 text-base font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  >
                    {item.name}
                  </motion.button>
                ))}

                {/* Auth Buttons in Mobile Menu */}
                <div className="pt-4 border-t border-white/10 space-y-2">
                  {isAuthenticated ? (
                    <>
                      <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        onClick={() => handleNavClick(onProfileClick)}
                        className="block w-full text-left px-4 py-3 text-base font-medium text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <User className="w-5 h-5" />
                        My Profile ({userName || 'User'})
                      </motion.button>
                      <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.35 }}
                        onClick={() => handleNavClick(onLogout)}
                        className="block w-full text-left px-4 py-3 text-base font-medium text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <LogOut className="w-5 h-5" />
                        Logout
                      </motion.button>
                    </>
                  ) : (
                    <>
                      <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        onClick={() => handleNavClick(onLoginClick)}
                        className="block w-full px-4 py-3 text-center text-base font-medium text-white border border-white/20 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        Login
                      </motion.button>
                      <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.35 }}
                        onClick={() => handleNavClick(onSignupClick)}
                        className="block w-full px-4 py-3 text-center text-base font-medium bg-white text-black rounded-lg hover:bg-white/90 transition-colors shadow-lg"
                      >
                        Signup
                      </motion.button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
