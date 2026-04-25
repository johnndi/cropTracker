
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminDashboard } from "./pages/AdminDashboard/AdminDashboard.jsx";
import { AgentDashboard } from "./pages/AgentDashboard/AgentDashboard.jsx";
import { LoginPage } from "./pages/LoginPage/LoginPage.jsx";
import { SignUpPage } from "./pages/SignUpPage/SignUpPage.jsx";
import { ProtectedRoute } from "./components/ProtectedRoute.jsx";
import { ToastContainer, Zoom } from "react-toastify";

function App() {
  return (
    <BrowserRouter>
    <ToastContainer
position="bottom-center"
autoClose={5335}
hideProgressBar
newestOnTop={false}
closeOnClick={false}
rtl={false}
pauseOnFocusLoss
draggable
pauseOnHover
theme="light"
transition={Zoom}
/>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        

        {/* Protected Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/agent"
          element={
            <ProtectedRoute requiredRole="AGENT">
              <AgentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Default route */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
