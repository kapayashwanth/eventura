import { useState, useEffect } from "react";
import { HeroGeometric } from "@/components/ui/shape-landing-hero";
import { Navbar } from "@/components/ui/navbar";
import { AboutUs } from "@/components/ui/about-us";
import { EventsSection } from "@/components/ui/events-section";
import { ContactSection } from "@/components/ui/contact-section";
import { Login } from "@/components/ui/login";
import { Signup } from "@/components/ui/signup";
import { AdminLogin } from "@/components/ui/admin-login";
import { AdminDashboard } from "@/components/ui/admin-dashboard";
import { AccessDenied } from "@/components/ui/access-denied";
import { ProfilePage } from "@/components/ui/profile-page";
import { RegisteredEventsPage } from "@/components/ui/registered-events-page";
import { UpcomingEventsPage } from "@/components/ui/upcoming-events-page";
import { PastEventsPage } from "@/components/ui/past-events-page";
import { Footer } from "@/components/ui/footer";
import { useAuth } from "@/lib/AuthContext";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

function DemoHeroGeometric() {
  const [currentPage, setCurrentPage] = useState<'home' | 'login' | 'signup' | 'admin' | 'profile' | 'registered-events' | 'upcoming-events' | 'past-events'>('home');
  const { user, loading, isAuthenticated, userName, isAdmin, signOutUser, setAdminFlag } = useAuth();
  const [profileComplete, setProfileComplete] = useState(true);

  // Fetch profile completeness from Convex
  const profileFields = useQuery(
    api.userProfiles.getProfileFields,
    user ? { firebase_uid: user.uid } : "skip"
  );

  // Check admin role from Convex profile
  const profile = useQuery(
    api.userProfiles.getByFirebaseUid,
    user ? { firebase_uid: user.uid } : "skip"
  );

  useEffect(() => {
    if (profile) {
      setAdminFlag(profile.role === "admin");
    }
  }, [profile, setAdminFlag]);

  useEffect(() => {
    if (profileFields) {
      const isComplete = !!(profileFields.mobile_number && profileFields.department && profileFields.year_of_study);
      setProfileComplete(isComplete);
      if (!isComplete && currentPage !== 'profile' && currentPage !== 'admin') {
        setCurrentPage('profile');
      }
    } else if (profileFields === null && user) {
      setProfileComplete(false);
    }
  }, [profileFields, user, currentPage]);

  useEffect(() => {
    const path = window.location.hash.slice(1);
    if (path === 'admin') {
      setCurrentPage('admin');
    }
  }, []);

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
    // Stay on admin page - the profile query will re-run and set isAdmin
    setCurrentPage('admin');
  };

  const handleUserLogin = () => {
    setCurrentPage('home');
  };

  const handleUserSignup = () => {
    setCurrentPage('home');
  };

  const handleLogout = async () => {
    await signOutUser();
    if (currentPage === 'admin') {
      setCurrentPage('home');
    }
  };

  const scrollToSection = (id: string) => {
    if (currentPage !== 'home') {
      setCurrentPage('home');
      // Wait for home to render, then scroll
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigation = (page: 'home' | 'login' | 'signup' | 'admin' | 'profile' | 'registered-events' | 'upcoming-events' | 'past-events') => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-[#030303] flex items-center justify-center">
        <div className="text-white/50">Loading...</div>
      </div>
    );
  }

  if (currentPage === 'login') {
    return (
      <Login 
        onSwitchToSignup={() => setCurrentPage('signup')}
        onLoginSuccess={handleUserLogin}
      />
    );
  }

  if (currentPage === 'signup') {
    return (
      <Signup 
        onSwitchToLogin={() => setCurrentPage('login')}
        onSignupSuccess={handleUserSignup}
      />
    );
  }

  if (currentPage === 'profile') {
    if (!isAuthenticated) {
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
      onAboutClick={() => scrollToSection('about')}
      onPastEventsClick={() => handleNavigation('past-events')}
      onUpcomingEventsClick={() => handleNavigation('upcoming-events')}
      onContactClick={() => scrollToSection('contact')}
      onHomeClick={() => handleNavigation('home')}
      onProfileClick={() => handleNavigation('profile')}
      onRegisteredEventsClick={() => handleNavigation('registered-events')}
      onAdminClick={() => handleNavigation('admin')}
      isAuthenticated={isAuthenticated}
      isAdmin={isAdmin}
      onLogout={handleLogout}
      userName={userName}
    />;
  }

  if (currentPage === 'registered-events') {
    if (!isAuthenticated) {
      setTimeout(() => setCurrentPage('login'), 0);
      return (
        <div className="min-h-screen w-full bg-[#030303] flex items-center justify-center">
          <div className="text-white/50">Redirecting to login...</div>
        </div>
      );
    }
    return <RegisteredEventsPage 
      onLoginClick={() => handleNavigation('login')}
      onSignupClick={() => handleNavigation('signup')}
      onAboutClick={() => scrollToSection('about')}
      onPastEventsClick={() => handleNavigation('past-events')}
      onUpcomingEventsClick={() => handleNavigation('upcoming-events')}
      onContactClick={() => scrollToSection('contact')}
      onHomeClick={() => handleNavigation('home')}
      onProfileClick={() => handleNavigation('profile')}
      onRegisteredEventsClick={() => handleNavigation('registered-events')}
      onAdminClick={() => handleNavigation('admin')}
      isAuthenticated={isAuthenticated}
      isAdmin={isAdmin}
      onLogout={handleLogout}
      userName={userName}
    />;
  }

  if (currentPage === 'upcoming-events') {
    return <UpcomingEventsPage 
      onLoginClick={() => handleNavigation('login')}
      onSignupClick={() => handleNavigation('signup')}
      onAboutClick={() => scrollToSection('about')}
      onPastEventsClick={() => handleNavigation('past-events')}
      onUpcomingEventsClick={() => handleNavigation('upcoming-events')}
      onContactClick={() => scrollToSection('contact')}
      onHomeClick={() => handleNavigation('home')}
      onProfileClick={() => handleNavigation('profile')}
      onRegisteredEventsClick={() => handleNavigation('registered-events')}
      onAdminClick={() => handleNavigation('admin')}
      isAuthenticated={isAuthenticated}
      isAdmin={isAdmin}
      onLogout={handleLogout}
      userName={userName}
    />;
  }

  if (currentPage === 'past-events') {
    return <PastEventsPage 
      onLoginClick={() => handleNavigation('login')}
      onSignupClick={() => handleNavigation('signup')}
      onAboutClick={() => scrollToSection('about')}
      onPastEventsClick={() => handleNavigation('past-events')}
      onUpcomingEventsClick={() => handleNavigation('upcoming-events')}
      onContactClick={() => scrollToSection('contact')}
      onHomeClick={() => handleNavigation('home')}
      onProfileClick={() => handleNavigation('profile')}
      onRegisteredEventsClick={() => handleNavigation('registered-events')}
      onAdminClick={() => handleNavigation('admin')}
      isAuthenticated={isAuthenticated}
      isAdmin={isAdmin}
      onLogout={handleLogout}
      userName={userName}
    />;
  }

  if (currentPage === 'admin') {
    if (!isAuthenticated) {
      return <AdminLogin onLoginSuccess={handleAdminLogin} />;
    }
    if (isAuthenticated && isAdmin) {
      return <AdminDashboard />;
    }
    if (isAuthenticated && profile !== undefined && !isAdmin) {
      return (
        <AccessDenied 
          onGoHome={() => setCurrentPage('home')}
          onLogout={handleLogout}
          isAuthenticated={isAuthenticated}
        />
      );
    }
    // Still loading profile, show loading state
    return (
      <div className="min-h-screen w-full bg-[#030303] flex items-center justify-center">
        <div className="text-white/50">Checking admin access...</div>
      </div>
    );
  }

  return (
    <>
      <Navbar 
        onLoginClick={() => setCurrentPage('login')}
        onSignupClick={() => setCurrentPage('signup')}
        onAboutClick={() => scrollToSection('about')}
        onPastEventsClick={() => handleNavigation('past-events')}
        onUpcomingEventsClick={() => handleNavigation('upcoming-events')}
        onContactClick={() => scrollToSection('contact')}
        onHomeClick={() => { setCurrentPage('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        onProfileClick={() => setCurrentPage('profile')}
        onRegisteredEventsClick={() => setCurrentPage('registered-events')}
        onAdminClick={() => setCurrentPage('admin')}
        isAuthenticated={isAuthenticated}
        isAdmin={isAdmin}
        onLogout={handleLogout}
        userName={userName}
      />
      <div id="home">
        <HeroGeometric
          badge="Eventura"
          title1="Never Miss an"
          title2="Opportunity"
        />
      </div>
      <div id="upcoming-events">
        <EventsSection 
          onViewAllUpcoming={() => handleNavigation('upcoming-events')}
          onViewAllPast={() => handleNavigation('past-events')}
          onLoginRequired={() => setCurrentPage('login')}
          onProfileRequired={() => setCurrentPage('profile')}
        />
      </div>
      <div id="about">
        <AboutUs />
      </div>
      <div id="contact">
        <ContactSection />
      </div>
      <Footer />
    </>
  );
}

export { DemoHeroGeometric };
