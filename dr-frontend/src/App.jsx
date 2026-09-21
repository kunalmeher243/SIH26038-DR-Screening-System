import { BrowserRouter, Routes, Route } from "react-router-dom";
import Toast from "./components/common/Toast";
import AppNavbar from "./components/common/AppNavbar";
import ProtectedRoute from "./components/common/ProtectedRoute";
import Login from "./pages/Login";
import PHCWindow from "./pages/PHCWindow";
import PHCTicketStatus from "./pages/PHCTicketStatus";
import DoctorWindow from "./pages/DoctorWindow";
import DoctorCaseDetail from "./pages/DoctorCaseDetail";
import PatientDashboard from "./pages/PatientDashboard";
import PatientTicketStatus from "./pages/PatientTicketStatus";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <div className="serix-app" style={{ minHeight: "100vh", backgroundColor: "#FFFFFF" }}>
        <AppNavbar />
        <Toast />
        <main style={{ backgroundColor: "#FFFFFF" }}>
          <Routes>
            <Route path="/" element={<Login />} />
            
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
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;