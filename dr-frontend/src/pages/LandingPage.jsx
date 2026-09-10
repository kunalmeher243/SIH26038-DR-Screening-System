import Navbar from "../components/common/Navbar";
import HeroSection from "../components/landing/HeroSection";
import AboutSection from "../components/landing/AboutSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import Footer from "../components/common/Footer";
import AuthModal from "../components/auth/AuthModal";
import useAuthStore from "../store/useAuthStore";

export default function LandingPage({ onAccessDashboard, currentView, setCurrentView }) {
  const { isAuthenticated, user } = useAuthStore();

  const handleAuthSuccess = (authenticatedUser) => {
    // Navigate automatically to dashboard after successful authentication
    if (setCurrentView) {
      setCurrentView("dashboard");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#FAFAFA" }}>
      {/* Navigation Bar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
      />

      {/* Hero Section */}
      <HeroSection
        onAccessDashboard={() => {
          if (setCurrentView) setCurrentView("dashboard");
        }}
      />

      {/* About Section */}
      <AboutSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Footer */}
      <Footer />

      {/* Auth Modal Triggerable from anywhere */}
      <AuthModal onAuthSuccess={handleAuthSuccess} />
    </div>
  );
}
