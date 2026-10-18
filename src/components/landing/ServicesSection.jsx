import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Clock3 } from "lucide-react";
import { useTranslation } from "../../i18n";
import "./restored-sections.css";

const services = [
  { key: "signature", name: "Signature Cut", price: "35€", duration: "45 min" },
  { key: "shave", name: "Royal Shave", price: "28€", duration: "30 min" },
  { key: "beard", name: "Cut & Beard", price: "55€", duration: "75 min" },
];
export function ServicesSection() {
  const { t } = useTranslation();
  const [active, setActive] = useState(0);
  const [compact, setCompact] = useState(() => window.innerWidth <= 800);
  useEffect(() => {
    const breakpoint = window.matchMedia("(max-width: 800px)");
    const update = (event) => setCompact(event.matches);
    breakpoint.addEventListener("change", update);
    return () => breakpoint.removeEventListener("change", update);
  }, []);
  const shift = (direction) =>
    setActive(
      (current) => (current + direction + services.length) % services.length,
    );
  return (
    <section id="services" className="section restored-services">
      <div className="section-head">
        <div>
          <p className="eyebrow">{t("services.eyebrow")}</p>
          <h2>
            {t("services.title")}
            <br />
            <em>{t("services.accent")}</em>
          </h2>
        </div>
      </div>
      <div className="service-carousel" aria-roledescription="carousel">
        {services.map((service, index) => {
          const relative = (index - active + services.length) % services.length;
          const position =
            relative === 0 ? "front" : relative === 1 ? "right" : "left";
          return (
            <motion.article
              key={service.key}
              className={`service-card carousel-service ${position}`}
              initial={false}
              animate={{
                x:
                  position === "front"
                    ? 0
                    : position === "right"
                      ? compact
                        ? 190
                        : 250
                      : compact
                        ? -190
                        : -250,
                scale: position === "front" ? 1 : 0.78,
                rotateY:
                  position === "front" ? 0 : position === "right" ? -24 : 24,
                opacity: position === "front" ? 1 : 0.48,
                zIndex: position === "front" ? 3 : 1,
              }}
              transition={{ duration: 0.45, ease: [0.22, 0.7, 0.2, 1] }}
              onClick={() => position !== "front" && setActive(index)}
            >
              <div className="service-top">
                <span>{index === 0 ? "MOST REQUESTED" : "SIGNATURE"}</span>
                <Clock3 size={16} />
              </div>
              <h3>{service.name}</h3>
              <p>{t(`services.${service.key}`)}</p>
              <div className="service-bottom">
                <strong>{service.price}</strong>
                <small>{service.duration}</small>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    window.location.href = "/client.html?mode=register";
                  }}
                >
                  {t("services.book")} <ArrowRight size={16} />
                </button>
              </div>
            </motion.article>
          );
        })}
        <div className="service-carousel-controls">
          <button onClick={() => shift(-1)} aria-label="Previous service">
            <ArrowLeft size={17} />
          </button>
          <div>
            {services.map((service, index) => (
              <button
                key={service.key}
                aria-label={`Service ${index + 1}`}
                onClick={() => setActive(index)}
                className={index === active ? "active" : ""}
              />
            ))}
          </div>
          <button onClick={() => shift(1)} aria-label="Next service">
            <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </section>
  );
}
