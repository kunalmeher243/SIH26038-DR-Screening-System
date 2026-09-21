import { useNavigate } from "react-router-dom";
import HeroSection from "../components/landing/HeroSection";
import AboutSection from "../components/landing/AboutSection";
import FeaturesSection from "../components/landing/FeaturesSection";
import Footer from "../components/common/Footer";
import useAuthStore from "../store/useAuthStore";
import usePageMeta from "../utils/usePageMeta";

export default function LandingPage() {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();

  usePageMeta({
    title: "SERIX — AI Diabetic Retinopathy Screening & Tele-Ophthalmology",
    description: "Deep learning AI screening and tele-ophthalmology triage platform for rural health centers, ophthalmologists, and patients."
  });

  const handleAccessDashboard = () => {
    if (isAuthenticated && user) {
      const portal = user.role === "PHC Worker" || user.portal === "phc"
        ? "/phc"
        : user.role === "Ophthalmologist" || user.portal === "doctor"
        ? "/doctor"
        : "/patient";
      navigate(portal);
    } else {
      navigate("/login");
    }
  };

  return (
    <div
      style={{
        minHeight: "calc(100vh - 68px)",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--color-bg)",
      }}
    >
      {/* Hero Section */}
      <HeroSection onAccessDashboard={handleAccessDashboard} />

      {/* Features Section */}
      <div id="features">
        <FeaturesSection />
      </div>

      {/* About Section */}
      <div id="about">
        <AboutSection />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
