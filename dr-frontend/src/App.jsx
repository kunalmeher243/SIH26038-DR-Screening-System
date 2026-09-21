import { Suspense, lazy, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Toast from "./components/common/Toast";
import AppNavbar from "./components/common/AppNavbar";
import ProtectedRoute from "./components/common/ProtectedRoute";
import StorageNotice from "./components/common/StorageNotice";
import LoadingFallback from "./components/common/LoadingFallback";
import eventTracker from "./utils/eventTracker";
import "./index.css";

// Lazy-loaded routes for optimal page load speed (Point 12)
const Login = lazy(() => import("./pages/Login"));
const PHCWindow = lazy(() => import("./pages/PHCWindow"));
const PHCTicketStatus = lazy(() => import("./pages/PHCTicketStatus"));
const DoctorWindow = lazy(() => import("./pages/DoctorWindow"));
const DoctorCaseDetail = lazy(() => import("./pages/DoctorCaseDetail"));
const PatientDashboard = lazy(() => import("./pages/PatientDashboard"));
const PatientTicketStatus = lazy(() => import("./pages/PatientTicketStatus"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsConditions = lazy(() => import("./pages/TermsConditions"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Telemetry / Route Change Tracker Component (Point 19)
function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    eventTracker.trackPageView(location.pathname + location.search);
  }, [location]);

  return null;
}

function App() {
  useEffect(() => {
    eventTracker.init();
  }, []);

  return (
    <BrowserRouter>
      <PageTracker />
      <div className="serix-app" style={{ minHeight: "100vh", backgroundColor: "#FFFFFF", display: "flex", flexDirection: "column" }}>
        <AppNavbar />
        <Toast />
        <StorageNotice />
        <main style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
          <Suspense fallback={<LoadingFallback message="Loading SERIX clinical workspace..." />}>
            <Routes>
              {/* Authentication / Home */}
              <Route path="/" element={<Login />} />
              
              {/* Legal & Compliance Pages (Points 1 & 2) */}
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route path="/terms" element={<TermsConditions />} />

              {/* PHC Worker Portal */}
              <Route 
                path="/phc" 
                element={
                  <ProtectedRoute allowedRoles={["PHC Worker"]}>
                    <PHCWindow />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/phc/ticket/:id" 
                element={
                  <ProtectedRoute allowedRoles={["PHC Worker"]}>
                    <PHCTicketStatus />
                  </ProtectedRoute>
                } 
              />

              {/* Ophthalmologist Portal */}
              <Route 
                path="/doctor" 
                element={
                  <ProtectedRoute allowedRoles={["Ophthalmologist"]}>
                    <DoctorWindow />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/doctor/:id" 
                element={
                  <ProtectedRoute allowedRoles={["Ophthalmologist"]}>
                    <DoctorCaseDetail />
                  </ProtectedRoute>
                } 
              />

              {/* Patient Portal */}
              <Route 
                path="/patient" 
                element={
                  <ProtectedRoute allowedRoles={["Patient"]}>
                    <PatientDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/patient/ticket/:id" 
                element={
                  <ProtectedRoute allowedRoles={["Patient"]}>
                    <PatientTicketStatus />
                  </ProtectedRoute>
                } 
              />

              {/* Wildcard 404 Route (Point 15) */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;