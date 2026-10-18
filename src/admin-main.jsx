import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { AdminDashboard } from "./components/admin/AdminDashboard";
import { LanguageProvider } from "./i18n";

createRoot(document.getElementById("root")).render(
  <LanguageProvider scope="admin">
    <AdminDashboard
      onExit={() => {
        window.location.href = "/";
      }}
    />
  </LanguageProvider>,
);
