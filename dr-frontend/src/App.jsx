import { BrowserRouter, Routes, Route } from "react-router-dom";
import Toast from "./components/common/Toast";
import RoleSelector from "./pages/RoleSelector";
import PHCWindow from "./pages/PHCWindow";
import PHCTicketStatus from "./pages/PHCTicketStatus";
import DoctorWindow from "./pages/DoctorWindow";
import DoctorCaseDetail from "./pages/DoctorCaseDetail";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <div className="retinatrack-app" style={{ minHeight: "100vh", backgroundColor: "#FAFAFA" }}>
        <Toast />
        <Routes>
          <Route path="/" element={<RoleSelector />} />
          <Route path="/phc" element={<PHCWindow />} />
          <Route path="/phc/ticket/:id" element={<PHCTicketStatus />} />
          <Route path="/doctor" element={<DoctorWindow />} />
          <Route path="/doctor/:id" element={<DoctorCaseDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;