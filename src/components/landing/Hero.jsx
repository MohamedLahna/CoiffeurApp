import React from "react";
import { ArrowRight, ChevronRight, Crown, Sparkles, Star } from "lucide-react";
import { useTranslation } from "../../i18n";
import "./hero.css";

export function Hero() {
  const { t } = useTranslation();
  return (
    <section className="hero">
      <div className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">
            <Sparkles size={14} /> {t("hero.badge")}
          </p>
          <h1>
            {t("hero.title")}
            <br />
            <em>{t("hero.accent")}</em>
          </h1>
          <p className="hero-text">{t("hero.subtitle")}</p>
          <div className="hero-actions">
            <button
              className="primary"
              onClick={() => {
                window.location.href = "/client.html?mode=register";
              }}
            >
              {t("hero.cta_book")} <ArrowRight size={16} />
            </button>
            <a href="#experience">
              {t("hero.cta_discover")} <ChevronRight size={16} />
            </a>
          </div>
          <div className="hero-proof">
            <div className="avatars">
              <span>M</span>
              <span>A</span>
              <span>O</span>
            </div>
            <p>
              <Star size={14} fill="currentColor" /> <b>4.9</b>{" "}
              {t("hero.rating")}
            </p>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-image" />
          <div className="floating-note">
            <Crown size={16} />
            <span>
              THE
              <br />
              <b>ATELIER</b>
            </span>
          </div>
          <div className="hero-stamp">
            NO. 01
            <br />
            <span>MARRAKECH</span>
          </div>
        </div>
      </div>
    </section>
  );
}
