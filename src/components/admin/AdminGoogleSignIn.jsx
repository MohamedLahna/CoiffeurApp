import React, { useEffect, useRef, useState } from "react";
import { api } from "../../services/api";
import { useTranslation } from "../../i18n";

export function AdminGoogleSignIn({ onAuthenticated }) {
  const buttonRef = useRef(null);
  const { t } = useTranslation();
  const [error, setError] = useState("");
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;
    let cancelled = false;
    const render = () => {
      if (cancelled || !window.google?.accounts?.id || !buttonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async ({ credential }) => {
          setError("");
          try {
            const { data } = await api.post("/admin/auth/google", { credential });
            localStorage.setItem("atelier_admin_token", data.token);
            onAuthenticated(data.user);
          } catch (e) {
            setError(e.response?.data?.message || t("admin.authFailed"));
          }
        },
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "filled_black", size: "large", shape: "pill", text: "continue_with", width: 280,
      });
    };
    if (window.google?.accounts?.id) render();
    else {
      let script = document.querySelector('script[src="https://accounts.google.com/gsi/client"]');
      if (!script) {
        script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      script.addEventListener("load", render);
      script.addEventListener("error", () => setError(t("admin.authFailed")));
    }
    return () => { cancelled = true; };
  }, [clientId, onAuthenticated, t]);

  return (
    <main className="grid min-h-screen place-items-center bg-[#0b0b0b] px-5 text-[#f3eee5]">
      <section className="w-full max-w-md border border-[#393329] bg-[#141414] p-8 text-center shadow-[0_0_50px_rgba(215,173,88,.08)]">
        <p className="font-mono text-xs tracking-[.28em] text-[#d7ad58]">ATELIER NOIR / ADMIN</p>
        <h1 className="mt-5 font-display text-3xl">{t("admin.signInTitle")}</h1>
        <p className="mt-3 text-sm text-[#999]">{t("admin.signInDescription")}</p>
        <div className="mt-7 flex justify-center" ref={buttonRef} />
        {!clientId && <p className="mt-5 text-sm text-amber-300">{t("admin.googleNotConfigured")}</p>}
        {error && <p role="alert" className="mt-5 text-sm text-red-300">{error}</p>}
        <a href="/" className="mt-7 inline-block text-sm text-[#aaa] underline underline-offset-4 hover:text-white">{t("admin.backToSite")}</a>
      </section>
    </main>
  );
}
