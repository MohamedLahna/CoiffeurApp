import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";
import { ClientPortal } from "./components/client/ClientPortal";
import { LanguageProvider } from "./i18n";
createRoot(document.getElementById("root")).render(
  <LanguageProvider scope="client">
    <ClientPortal />
  </LanguageProvider>,
);
