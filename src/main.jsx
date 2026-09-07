import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import App from "./App";
import "./index.css";

import AuthProvider from "./context/AuthContext";
import { SidebarProvider } from "./context/SidebarContext";

// Apply saved theme globally before the application renders
const savedTheme = localStorage.getItem("theme") || "system";

const applyTheme = (theme) => {
  const root = document.documentElement;

  if (theme === "dark") {
    root.classList.add("dark");
  } else if (theme === "light") {
    root.classList.remove("dark");
  } else {
    const systemDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    root.classList.toggle("dark", systemDark);
  }
};

applyTheme(savedTheme);

// Keep system theme changes in sync when "System" is selected
if (savedTheme === "system") {
  const mediaQuery = window.matchMedia(
    "(prefers-color-scheme: dark)"
  );

  mediaQuery.addEventListener("change", () => {
    applyTheme("system");
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SidebarProvider>
          <App />

          <Toaster
            position="top-center"
            containerStyle={{
              top: 80,
            }}
            toastOptions={{
              duration: 3000,

              style: {
                minWidth: "380px",
                maxWidth: "500px",
                background: "#ffffff",
                color: "#111827",
                borderRadius: "14px",
                padding: "18px 24px",
                fontSize: "16px",
                fontWeight: "500",
                boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
              },

              success: {
                iconTheme: {
                  primary: "#16a34a",
                  secondary: "#ffffff",
                },
              },

              error: {
                iconTheme: {
                  primary: "#dc2626",
                  secondary: "#ffffff",
                },
              },
            }}
          />
        </SidebarProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);