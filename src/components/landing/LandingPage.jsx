import React from "react";
import { ArrowRight } from "lucide-react";
import { LanguageProvider, useTranslation } from "../../i18n";
import { Navbar } from "../Navbar";
import { Hero } from "./Hero";
import { ServicesSection } from "./ServicesSection";
import { TeamSection } from "./TeamSection";
import "./responsive.css";

function LandingContent() {
  const { t } = useTranslation();
  return (
    <>
      <Navbar
        onBook={() => {
          window.location.href = "/client.html?mode=register";
        }}
      />
      <main>
        <Hero />
        <div className="marquee">
          <div className="marquee-track">
            {[
              "Est. 2014",
              "Precision over everything",
              "Casa • Paris • London",
              "Crafted for your confidence",
            ]
              .concat([
                "Est. 2014",
                "Precision over everything",
                "Casa • Paris • London",
                "Crafted for your confidence",
              ])
              .map((x, i) => (
                <span key={i}>
                  {x}
                  <b>✦</b>
                </span>
              ))}
          </div>
        </div>
        <section id="experience" className="manifesto">
          <div>
            <p className="eyebrow">{t("manifesto.eyebrow")}</p>
            <h2>
              {t("manifesto.title")}
              <br />
              <em>{t("manifesto.accent")}</em>
            </h2>
            <p className="manifesto-copy">{t("manifesto.body")}</p>
          </div>
        </section>
        <ServicesSection />
        <TeamSection />
        <section className="cta">
          <div>
            <p className="eyebrow">{t("cta.eyebrow")}</p>
            <h2>
              {t("cta.title")}
              <br />
              <em>{t("cta.accent")}</em>
            </h2>
          </div>
          <button
            className="primary"
            onClick={() => {
              window.location.href = "/client.html?mode=register";
            }}
          >
            {t("cta.button")} <ArrowRight size={16} />
          </button>
        </section>
      </main>
      <footer>
        <div className="brand">
          <span>ATELIER</span>
          <b>NOIR</b>
        </div>
        <p>Crafted with intention · Marrakech</p>
        <div className="footer-links">
          <a href="https://instagram.com/ateliernoir" target="_blank" rel="noopener noreferrer">
            Instagram
          </a>
          <a href="#contact">Contact</a>
          <a href="#mentions">Mentions</a>
        </div>
      </footer>
    </>
  );
}
export function LandingPage() {
  return (
    <LanguageProvider scope="landing">
      <LandingContent />
    </LanguageProvider>
  );
}
