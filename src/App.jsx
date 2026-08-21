import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Loader from "./components/Loader";

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // 🔥 Spinner logic
  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, [location]);

  // 🔥 Idle logout logic (1 min)
  useEffect(() => {
    let idleTimer;

    const logoutUser = () => {
      localStorage.removeItem("token"); // clear auth token
      navigate("/login"); // redirect to login
    };

    const resetTimer = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(logoutUser, 30 * 60 * 1000); // 1 minute
    };

    // Track user activity (desktop + mobile)
    window.addEventListener("mousemove", resetTimer);
    window.addEventListener("keydown", resetTimer);
    window.addEventListener("click", resetTimer);
    window.addEventListener("touchstart", resetTimer);

    resetTimer(); // start timer initially

    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener("mousemove", resetTimer);
      window.removeEventListener("keydown", resetTimer);
      window.removeEventListener("click", resetTimer);
      window.removeEventListener("touchstart", resetTimer);
    };
  }, [navigate]);

  return (
    <>
      {loading && <Loader />}
      <AppRoutes />
    </>
  );
}

export default AppContent;
