import React, { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { languages, useTranslation } from "../i18n";

function Flag({ code }) {
  const common = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
  };
  if (code === "fr")
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="11" fill="#fff" />
        <path
          d="M1 12a11 11 0 0 0 7.3 10.35V1.65A11 11 0 0 0 1 12Z"
          fill="#1D4ED8"
        />
        <path
          d="M23 12a11 11 0 0 0-7.3-10.35v20.7A11 11 0 0 0 23 12Z"
          fill="#EF4444"
        />
      </svg>
    );
  if (code === "en")
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="11" fill="#1D4ED8" />
        <path d="m4 4 16 16M20 4 4 20" stroke="#fff" strokeWidth="3" />
        <path d="M12 1v22M1 12h22" stroke="#fff" strokeWidth="5" />
        <path d="M12 1v22M1 12h22" stroke="#DC2626" strokeWidth="2" />
        <path d="m4 4 16 16M20 4 4 20" stroke="#DC2626" strokeWidth="1.4" />
      </svg>
    );
  if (code === "ar")
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="11" fill="#16834B" />
        <path d="M6 12h12M8 15h8" stroke="#fff" strokeWidth="1.2" />
        <path d="M9 9c1.2-1.5 4.8-1.5 6 0" stroke="#fff" />
      </svg>
    );
  if (code === "es")
    return (
      <svg {...common}>
        <circle cx="12" cy="12" r="11" fill="#FACC15" />
        <path d="M1.7 8h20.6M1.7 16h20.6" stroke="#DC2626" strokeWidth="4" />
      </svg>
    );
  return (
    <svg {...common}>
      <circle cx="12" cy="12" r="11" fill="#FACC15" />
      <path d="M1.7 12h20.6" stroke="#DC2626" strokeWidth="7" />
      <path d="M1.7 7h20.6M1.7 17h20.6" stroke="#111827" strokeWidth="4" />
    </svg>
  );
}
export function LanguageSwitcher() {
  const { language, setLanguage } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const active =
    languages.find((item) => item.code === language) || languages[0];
  useEffect(() => {
    const close = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);
  return (
    <div ref={ref} className="relative z-[1000]" dir="ltr">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-[#30425d] bg-[#0d1726]/90 px-3 py-2 text-xs text-[#e8eef7] shadow-[0_0_18px_rgba(44,145,255,.16)] backdrop-blur-xl transition hover:border-[#43b8ff]"
      >
        <Flag code={active.code} />
        <span>{active.label}</span>
        <ChevronDown
          size={14}
          className={`transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute right-0 mt-3 w-60 rounded-2xl border border-[#30425d] bg-[#0c1727]/95 p-2 shadow-[0_16px_45px_rgba(0,0,0,.45)] backdrop-blur-xl">
          {languages.map((item) => (
            <button
              type="button"
              onClick={() => {
                setLanguage(item.code);
                setOpen(false);
              }}
              key={item.code}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-[#1a3150] ${item.code === language ? "bg-[#17345a]" : ""}`}
            >
              <Flag code={item.code} />
              <span className="flex-1">
                <strong className="block text-xs text-white">
                  {item.label}
                </strong>
                <small className="font-mono text-[10px] text-[#8496ad]">
                  {item.code.toUpperCase()}
                </small>
              </span>
              {item.code === language && (
                <Check size={15} className="text-[#43b8ff]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
