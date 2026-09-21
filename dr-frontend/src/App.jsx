import { BrowserRouter, Routes, Route } from "react-router-dom";
import Toast from "./components/common/Toast";
import AppNavbar from "./components/common/AppNavbar";
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
      <div className="retinatrack-app" style={{ minHeight: "100vh", backgroundColor: "#FFFFFF" }}>
        <AppNavbar />
        <Toast />
        <main style={{ backgroundColor: "#FFFFFF" }}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/phc" element={<PHCWindow />} />
            <Route path="/phc/ticket/:id" element={<PHCTicketStatus />} />
            <Route path="/doctor" element={<DoctorWindow />} />
            <Route path="/doctor/:id" element={<DoctorCaseDetail />} />
            <Route path="/patient" element={<PatientDashboard />} />
            <Route path="/patient/ticket/:id" element={<PatientTicketStatus />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;