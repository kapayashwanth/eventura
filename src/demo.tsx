import { useState, useEffect } from "react";
import { HeroGeometric } from "@/components/ui/shape-landing-hero";
import { Navbar } from "@/components/ui/navbar";
import { AboutUs } from "@/components/ui/about-us";
import { EventsSection } from "@/components/ui/events-section";
import { Login } from "@/components/ui/login";
import { Signup } from "@/components/ui/signup";
import { AdminLogin } from "@/components/ui/admin-login";
import { AdminDashboard } from "@/components/ui/admin-dashboard";
import { AboutUsPage } from "@/components/ui/about-us-page";
import { PastEventsPage } from "@/components/ui/past-events-page";
import { UpcomingEventsPage } from "@/components/ui/upcoming-events-page";
import { ContactUsPage } from "@/components/ui/contact-us-page";
import { AccessDenied } from "@/components/ui/access-denied";
import { ProfilePage } from "@/components/ui/profile-page";
import { Footer } from "@/components/ui/footer";
import { supabase } from "@/lib/supabase";

function DemoHeroGeometric() {
  const [currentPage, setCurrentPage] = useState<'home' | 'login' | 'signup' | 'admin' | 'about' | 'past-events' | 'upcoming-events' | 'contact' | 'profile'>('home');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [profileComplete, setProfileComplete] = useState(true);

  const checkAuth = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    
    const { data: { session } } = await supabase.auth.getSession();
    setIsAuthenticated(!!session);
    
    // Get user's name and check admin role from metadata
    if (session?.user) {
      const fullName = session.user.user_metadata?.full_name || 
                      session.user.email?.split('@')[0] || 
                      'User';
      setUserName(fullName);
      
      // Check if user has admin role
      const userRole = session.user.user_metadata?.role || '';
      setIsAdmin(userRole === 'admin');

      // Check if profile is complete (has mobile, department, year)
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('mobile_number, department, year_of_study')
        .eq('id', session.user.id)
        .single();

      if (profile) {
        const isComplete = !!(profile.mobile_number && profile.department && profile.year_of_study);
        setProfileComplete(isComplete);
        
        // Only redirect to profile if incomplete AND not already on profile/admin pages
        if (!isComplete && currentPage !== 'profile' && currentPage !== 'admin') {
          console.log("Profile incomplete, redirecting to profile page");
          setCurrentPage('profile');
        }
      } else if (profileError) {
        // No profile exists or error fetching it
        console.log("Profile not found, user should complete profile");
        setProfileComplete(false);
        // Don't force redirect, let user navigate naturally
      }
    } else {
      setIsAdmin(false);
      setProfileComplete(true);
    }
    
    setLoading(false);
  };

  useEffect(() => {
    // Check URL for admin access
    const path = window.location.hash.slice(1); // Remove # from hash
    if (path === 'admin') {
      setCurrentPage('admin');
    }

    // Check if user is already logged in
    checkAuth();

    // Listen for auth changes
    if (supabase) {
      const { data: authListener } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
        console.log("Auth state changed:", session ? "logged in" : "logged out");
        setIsAuthenticated(!!session);
        
        // Get user's name and check admin role from metadata
        if (session?.user) {
          const fullName = session.user.user_metadata?.full_name || 
                          session.user.email?.split('@')[0] || 
                          'User';
          setUserName(fullName);
          
          // Check if user has admin role
          const userRole = session.user.user_metadata?.role || '';
          setIsAdmin(userRole === 'admin');
        } else {
          setUserName("");
          setIsAdmin(false);
        }
        
        // If user just logged in, redirect to home (unless on admin page)
        if (session) {
          setCurrentPage((prevPage) => {
            console.log("Previous page:", prevPage);
            if (prevPage === 'login' || prevPage === 'signup') {
              console.log("Redirecting to home");
              return 'home';
            }
            return prevPage;
          });
        }
      });

      return () => {
        authListener?.subscription.unsubscribe();
      };
    }
  }, []); // Empty dependency array - only run once

  // Listen for hash changes (for admin URL access)
  useEffect(() => {
    const handleHashChange = () => {
      const path = window.location.hash.slice(1);
      if (path === 'admin') {
        setCurrentPage('admin');
      } else {
        setCurrentPage('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleAdminLogin = () => {
    setIsAuthenticated(true);
  };

  const handleUserLogin = () => {
    console.log("handleUserLogin called - Setting page to home");
    setCurrentPage('home');
    // Force a small delay to ensure state updates
    setTimeout(() => {
      console.log("Current page should now be home");
    }, 100);
  };

  const handleUserSignup = () => {
    setCurrentPage('home');
  };

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setUserName("");
      setIsAdmin(false);
      // Redirect to home if logging out from admin page
      if (currentPage === 'admin') {
        setCurrentPage('home');
      }
    }
  };

  // Navigation handler that checks profile completion
  const handleNavigation = (page: 'home' | 'login' | 'signup' | 'admin' | 'about' | 'past-events' | 'upcoming-events' | 'contact' | 'profile') => {
    // If navigating away from profile and profile is incomplete, warn but allow
    if (currentPage === 'profile' && !profileComplete && page !== 'profile') {
      // Allow navigation but will redirect back to profile after checkAuth runs
      setCurrentPage(page);
      // Recheck auth which will redirect back if still incomplete
      setTimeout(() => checkAuth(), 100);
    } else {
      setCurrentPage(page);
    }
  };

  // Show loading state briefly
  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#030303] flex items-center justify-center">
        <div className="text-white/50">Loading...</div>
      </div>
    );
  }

  // User login page
  if (currentPage === 'login') {
    return (
      <Login 
        onSwitchToSignup={() => setCurrentPage('signup')}
        onLoginSuccess={handleUserLogin}
      />
    );
  }

  // User signup page
  if (currentPage === 'signup') {
    return (
      <Signup 
        onSwitchToLogin={() => setCurrentPage('login')}
        onSignupSuccess={handleUserSignup}
      />
    );
  }

  // About Us page
  if (currentPage === 'about') {
    return <AboutUsPage 
      onBack={() => setCurrentPage('home')}
      onLoginClick={() => setCurrentPage('login')}
      onSignupClick={() => setCurrentPage('signup')}
      onAboutClick={() => setCurrentPage('about')}
      onPastEventsClick={() => setCurrentPage('past-events')}
      onUpcomingEventsClick={() => setCurrentPage('upcoming-events')}
      onContactClick={() => setCurrentPage('contact')}
      isAuthenticated={isAuthenticated}
      onLogout={handleLogout}
      userName={userName}
    />;
  }

  // Past Events page
  if (currentPage === 'past-events') {
    return <PastEventsPage 
      onBack={() => setCurrentPage('home')}
      onLoginClick={() => setCurrentPage('login')}
      onSignupClick={() => setCurrentPage('signup')}
      onAboutClick={() => setCurrentPage('about')}
      onPastEventsClick={() => setCurrentPage('past-events')}
      onUpcomingEventsClick={() => setCurrentPage('upcoming-events')}
      onContactClick={() => setCurrentPage('contact')}
      isAuthenticated={isAuthenticated}
      onLogout={handleLogout}
      userName={userName}
    />;
  }

  // Upcoming Events page
  if (currentPage === 'upcoming-events') {
    return <UpcomingEventsPage 
      onBack={() => setCurrentPage('home')}
      onLoginClick={() => setCurrentPage('login')}
      onSignupClick={() => setCurrentPage('signup')}
      onAboutClick={() => setCurrentPage('about')}
      onPastEventsClick={() => setCurrentPage('past-events')}
      onUpcomingEventsClick={() => setCurrentPage('upcoming-events')}
      onContactClick={() => setCurrentPage('contact')}
      isAuthenticated={isAuthenticated}
      onLogout={handleLogout}
      userName={userName}
    />;
  }

  // Contact Us page
  if (currentPage === 'contact') {
    return <ContactUsPage 
      onBack={() => setCurrentPage('home')}
      onLoginClick={() => setCurrentPage('login')}
      onSignupClick={() => setCurrentPage('signup')}
      onAboutClick={() => setCurrentPage('about')}
      onPastEventsClick={() => setCurrentPage('past-events')}
      onUpcomingEventsClick={() => setCurrentPage('upcoming-events')}
      onContactClick={() => setCurrentPage('contact')}
      isAuthenticated={isAuthenticated}
      onLogout={handleLogout}
      userName={userName}
    />;
  }

  // Profile page
  if (currentPage === 'profile') {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      setTimeout(() => setCurrentPage('login'), 0);
      return (
        <div className="min-h-screen w-full bg-[#030303] flex items-center justify-center">
          <div className="text-white/50">Redirecting to login...</div>
        </div>
      );
    }
    return <ProfilePage 
      onLoginClick={() => handleNavigation('login')}
      onSignupClick={() => handleNavigation('signup')}
      onAboutClick={() => handleNavigation('about')}
      onPastEventsClick={() => handleNavigation('past-events')}
      onUpcomingEventsClick={() => handleNavigation('upcoming-events')}
      onContactClick={() => handleNavigation('contact')}
      onHomeClick={() => handleNavigation('home')}
      onProfileClick={() => handleNavigation('profile')}
      isAuthenticated={isAuthenticated}
      onLogout={handleLogout}
      userName={userName}
      onProfileUpdate={() => checkAuth()}
    />;
  }

  // Admin section (login or dashboard based on auth and admin role)
  if (currentPage === 'admin') {
    // If authenticated and has admin role, show dashboard
    if (isAuthenticated && isAdmin) {
      return <AdminDashboard />;
    }
    
    // If authenticated but NOT admin, show access denied
    if (isAuthenticated && !isAdmin) {
      return (
        <AccessDenied 
          onGoHome={() => setCurrentPage('home')}
          onLogout={handleLogout}
          isAuthenticated={isAuthenticated}
        />
      );
    }
    
    // If not authenticated, show admin login
    return <AdminLogin onLoginSuccess={handleAdminLogin} />;
  }

  // Home page
  return (
    <>
      <Navbar 
        onLoginClick={() => setCurrentPage('login')}
        onSignupClick={() => setCurrentPage('signup')}
        onAboutClick={() => setCurrentPage('about')}
        onPastEventsClick={() => setCurrentPage('past-events')}
        onUpcomingEventsClick={() => setCurrentPage('upcoming-events')}
        onContactClick={() => setCurrentPage('contact')}
        onHomeClick={() => setCurrentPage('home')}
        onProfileClick={() => setCurrentPage('profile')}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
        userName={userName}
      />
      <HeroGeometric
        badge="Amrita Vishwa Vidyapeetham Nagercoil Campus"
        title1="Never Miss an"
        title2="Opportunity"
      />
      <EventsSection 
        onViewUpcoming={() => setCurrentPage('upcoming-events')}
        onViewPast={() => setCurrentPage('past-events')}
      />
      <AboutUs />
      <Footer />
    </>
  );
}

export { DemoHeroGeometric };
