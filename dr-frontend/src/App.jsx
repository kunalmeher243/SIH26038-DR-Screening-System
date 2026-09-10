import { useState, useEffect } from "react";
import LandingPage from "./pages/LandingPage";
import DashboardRouter from "./pages/DashboardRouter";
import Toast from "./components/common/Toast";
import useAuthStore from "./store/useAuthStore";
import useAnalysisStore from "./store/useAnalysisStore";

function App() {
  const { isAuthenticated } = useAuthStore();
  const stage = useAnalysisStore((state) => state.stage);

  const [currentView, setCurrentView] = useState("landing"); // "landing" | "dashboard"

  // If analysis starts or is active, ensure we are in dashboard view
  useEffect(() => {
    if (stage && stage !== "idle") {
      setCurrentView("dashboard");
    }
  }, [stage]);

  return (
    <div className="retinatrack-app">
      {/* Top-Center Floating Flash Toast Notification */}
      <Toast />

      {/* Main View Router */}
      {currentView === "landing" ? (
        <LandingPage
          currentView={currentView}
          setCurrentView={setCurrentView}
        />
      ) : (
        <DashboardRouter
          currentView={currentView}
          setCurrentView={setCurrentView}
        />
      )}
    </div>
  );
}

export default App;