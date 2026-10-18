import React, { useState } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { useTranslation } from "../i18n";

export function Navbar({ onBook }) {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const links = [
    ["#experience", "nav.experience"],
    ["#services", "nav.services"],
    ["#team", "nav.team"],
    ["#journal", "nav.journal"],
  ];

  return (
    <nav
      className="relative flex h-[88px] items-center justify-between border-b border-[#222] bg-[#0a0a0a] px-[6vw] max-lg:sticky max-lg:top-0 max-lg:z-[900] max-lg:h-auto max-lg:min-h-[76px] max-lg:flex-wrap max-lg:gap-y-3 max-lg:py-3 max-lg:bg-[#0a0a0a]/95 max-lg:backdrop-blur-md"
      dir="inherit"
    >
      <a href="/" className="font-mono text-sm tracking-[.22em]">
        <span className="block text-[#aaa]">ATELIER</span>
        <b className="font-normal text-[#d7ad58]">NOIR</b>
      </a>
      <div className="hidden items-center gap-6 xl:gap-8 lg:flex">
        {links.map(([href, label]) => (
          <a key={href} href={href} className="whitespace-nowrap text-xs text-[#aaa] hover:text-white">
            {t(label)}
          </a>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <button
          onClick={() => { setMobileOpen(false); onBook?.(); }}
          className="hidden items-center gap-3 bg-[#d7ad58] px-4 py-3 text-xs font-bold text-[#19140b] lg:flex"
        >
          {t("nav.book")} <ArrowRight size={15} />
        </button>
        <button
          type="button"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-navigation"
          onClick={() => setMobileOpen((open) => !open)}
          className="grid h-10 w-10 place-items-center border border-[#39352d] text-[#eee] transition hover:border-[#d7ad58] hover:text-[#d7ad58] lg:hidden"
        >
          {mobileOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
      </div>
      {mobileOpen && (
        <div id="mobile-navigation" className="absolute left-0 right-0 top-full z-[950] border-b border-[#292929] bg-[#0d0d0d] px-[6vw] pb-5 pt-3 shadow-2xl lg:hidden">
          <div className="grid gap-1">
            {links.map(([href, label]) => (
              <a key={href} href={href} onClick={() => setMobileOpen(false)} className="py-3 text-sm text-[#b9b5ad] transition hover:text-[#d7ad58]">
                {t(label)}
              </a>
            ))}
          </div>
          <button onClick={() => { setMobileOpen(false); onBook?.(); }} className="mt-3 flex w-full items-center justify-center gap-3 bg-[#d7ad58] px-4 py-3 text-sm font-bold text-[#19140b]">
            {t("nav.book")} <ArrowRight size={15} />
          </button>
        </div>
      )}
    </nav>
  );
}
