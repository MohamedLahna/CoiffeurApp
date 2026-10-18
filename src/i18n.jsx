import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import fr from "./locales/fr.json";
import en from "./locales/en.json";
import ar from "./locales/ar.json";
import es from "./locales/es.json";
import de from "./locales/de.json";
import { api } from "./services/api";
export const languages = [
  { code: "fr", label: "Français", flag: "🇫🇷", dir: "ltr" },
  { code: "en", label: "English", flag: "🇬🇧", dir: "ltr" },
  { code: "ar", label: "العربية", flag: "🇸🇦", dir: "rtl" },
  { code: "es", label: "Español", flag: "🇪🇸", dir: "ltr" },
  { code: "de", label: "Deutsch", flag: "🇩🇪", dir: "ltr" },
];
const resources = { fr, en, ar, es, de };
// Keep the first-render admin interface local and synchronous. The online
// translator remains a fallback for keys not yet present in these bundles.
const adminInstant = {
  en: { overview: "Overview", barbers: "Barbers", services: "Services & options", appointments: "Appointments", schedules: "Opening hours", workspace: "WORKSPACE", controlCenter: "ATELIER NOIR / CONTROL CENTER", administrator: "Administrator", backToSite: "Back to website", signOut: "Sign out", loading: "Checking access…", revenueToday: "Revenue today", revenueMonth: "Revenue this month", revenueYear: "Annual revenue", periodChange: "vs previous period", performance: "PERFORMANCE", appointmentStatus: "Appointments and statuses", last30Days: "Last 30 days", total: "Total", confirmed: "Confirmed", pending: "Pending", topServices: "MOST REQUESTED SERVICES", bookings: "bookings", topBarbers: "TOP BARBERS", error: "Something went wrong. Please try again." },
  fr: {},
  ar: { overview: "نظرة عامة", barbers: "الحلاقون", services: "الخدمات والإضافات", appointments: "المواعيد", schedules: "ساعات العمل", workspace: "مساحة العمل", controlCenter: "أتيلييه نوار / مركز الإدارة", administrator: "المسؤول", backToSite: "العودة إلى الموقع", signOut: "تسجيل الخروج", loading: "جارٍ التحقق من الدخول…", revenueToday: "إيرادات اليوم", revenueMonth: "إيرادات هذا الشهر", revenueYear: "الإيرادات السنوية", periodChange: "مقارنة بالفترة السابقة", performance: "الأداء", appointmentStatus: "المواعيد والحالات", last30Days: "آخر 30 يوماً", total: "الإجمالي", confirmed: "مؤكد", pending: "قيد الانتظار", topServices: "الخدمات الأكثر طلباً", bookings: "حجوزات", topBarbers: "أفضل الحلاقين", error: "حدث خطأ. يرجى المحاولة مجدداً." },
  es: { overview: "Resumen", barbers: "Barberos", services: "Servicios y opciones", appointments: "Citas", schedules: "Horarios", workspace: "ESPACIO DE TRABAJO", controlCenter: "ATELIER NOIR / CENTRO DE CONTROL", administrator: "Administrador", backToSite: "Volver al sitio", signOut: "Cerrar sesión", loading: "Verificando acceso…", revenueToday: "Ingresos de hoy", revenueMonth: "Ingresos de este mes", revenueYear: "Ingresos anuales", periodChange: "vs. periodo anterior", performance: "RENDIMIENTO", appointmentStatus: "Citas y estados", last30Days: "Últimos 30 días", total: "Total", confirmed: "Confirmadas", pending: "Pendientes", topServices: "SERVICIOS MÁS SOLICITADOS", bookings: "reservas", topBarbers: "MEJORES BARBEROS", error: "Se produjo un error. Inténtalo de nuevo." },
  de: { overview: "Übersicht", barbers: "Barbiere", services: "Services & Optionen", appointments: "Termine", schedules: "Öffnungszeiten", workspace: "ARBEITSBEREICH", controlCenter: "ATELIER NOIR / KONTROLLZENTRUM", administrator: "Administrator", backToSite: "Zurück zur Website", signOut: "Abmelden", loading: "Zugriff wird geprüft…", revenueToday: "Umsatz heute", revenueMonth: "Umsatz diesen Monat", revenueYear: "Jahresumsatz", periodChange: "gegenüber Vorperiode", performance: "LEISTUNG", appointmentStatus: "Termine und Status", last30Days: "Letzte 30 Tage", total: "Gesamt", confirmed: "Bestätigt", pending: "Ausstehend", topServices: "AM HÄUFIGSTEN GEBUCHTE SERVICES", bookings: "Buchungen", topBarbers: "TOP-BARBIERE", error: "Ein Fehler ist aufgetreten. Bitte erneut versuchen." },
};
const LanguageContext = createContext(null);
export const getLanguage = () =>
  localStorage.getItem("atelier_language") || "fr";
const direction = (code) =>
  languages.find((item) => item.code === code)?.dir || "ltr";
export function setLanguage(code) {
  const next = resources[code] ? code : "fr";
  localStorage.setItem("atelier_language", next);
  document.documentElement.lang = next;
  document.documentElement.dir = direction(next);
  window.dispatchEvent(
    new CustomEvent("atelier-language-change", { detail: next }),
  );
  return next;
}
const lookup = (object, path) =>
  path.split(".").reduce((value, key) => value?.[key], object);
const flatten = (value, prefix = "", result = {}) => {
  Object.entries(value || {}).forEach(([key, item]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof item === "string") result[path] = item;
    else if (item && typeof item === "object" && !Array.isArray(item)) flatten(item, path, result);
  });
  return result;
};
const nest = (flat) => {
  const result = {};
  Object.entries(flat).forEach(([path, value]) => {
    const parts = path.split(".");
    let node = result;
    parts.slice(0, -1).forEach((part) => { node[part] ||= {}; node = node[part]; });
    node[parts.at(-1)] = value;
  });
  return result;
};
const scopeKeys = {
  landing: ["common", "nav", "hero", "manifesto", "services", "team", "cta"],
  client: ["common", "client"],
  admin: ["common", "admin"],
};
const scopedResource = (scope) => {
  const keys = scopeKeys[scope];
  return keys ? Object.fromEntries(keys.map((key) => [key, fr[key]]).filter(([, value]) => value)) : fr;
};
export function LanguageProvider({ children, scope }) {
  const [language, setCurrentLanguage] = useState(getLanguage);
  const [apiResources, setApiResources] = useState({});
  const changeLanguage = (code) => setCurrentLanguage(setLanguage(code));
  useEffect(() => {
    setLanguage(language);
    const handler = (event) => setCurrentLanguage(event.detail);
    window.addEventListener("atelier-language-change", handler);
    return () => window.removeEventListener("atelier-language-change", handler);
  }, []);
  useEffect(() => {
    if (language === "fr") return;
    let active = true;
    const cacheKey = `atelier_translation_v3_${scope || "all"}_${language}`;
    let cached;
    try { cached = localStorage.getItem(cacheKey); } catch { /* storage can be disabled */ }
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setApiResources((current) => ({ ...current, [`${scope || "all"}_${language}`]: parsed }));
        return () => { active = false; };
      } catch {
        try { localStorage.removeItem(cacheKey); } catch { /* storage can be disabled */ }
      }
    }
    const controller = new AbortController();
    const local = resources[language];
    const entries = Object.entries(flatten(scopedResource(scope))).filter(([key]) => !lookup(local, key) && !(scope === "admin" && adminInstant[language]?.[key.replace(/^admin\./, "")]));
    if (!entries.length) return;
    const batches = Array.from({ length: Math.ceil(entries.length / 100) }, (_, index) => Object.fromEntries(entries.slice(index * 100, (index + 1) * 100)));
    Promise.all(batches.map((texts) => api.post("/translations", { source: "fr", target: language, texts }, { signal: controller.signal })))
      .then((responses) => {
        if (!active || responses.some(({ data }) => data.source !== "mymemory")) return;
        const merged = Object.assign({}, ...responses.map(({ data }) => data.translations || {}));
        const translated = nest(merged);
        try { localStorage.setItem(cacheKey, JSON.stringify(translated)); } catch { /* private browsing may disable storage */ }
        setApiResources((current) => ({ ...current, [`${scope || "all"}_${language}`]: translated }));
      })
      .catch(() => {})
    return () => { active = false; controller.abort(); };
  }, [language, scope]);
  const resourceKey = `${scope || "all"}_${language}`;
  const t = useCallback((key) =>
    (key.startsWith("admin.") && adminInstant[language]?.[key.slice(6)]) || lookup(resources[language], key) || lookup(apiResources[resourceKey], key) || lookup(resources.fr, key) || key,
  [apiResources, language, resourceKey]);
  const value = useMemo(
    () => ({
      language,
      setLanguage: changeLanguage,
      direction: direction(language),
      t,
    }),
    [language, t],
  );
  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}
export const useTranslation = () => {
  const value = useContext(LanguageContext);
  if (!value)
    throw new Error("useTranslation must be used inside LanguageProvider");
  return value;
};
export const useLanguage = useTranslation;
