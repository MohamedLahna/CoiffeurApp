import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  LogOut,
  Scissors,
} from "lucide-react";
import { api } from "../../services/api";
import { useTranslation } from "../../i18n";
import { LanguageSwitcher } from "../LanguageSwitcher";

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("atelier_token")}`,
});

export function ClientPortal() {
  const { t, language } = useTranslation();
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState(() =>
    new URLSearchParams(window.location.search).get("mode") === "register"
      ? "register"
      : "login",
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  useEffect(() => {
    const token = localStorage.getItem("atelier_token");
    if (!token) {
      setLoading(false);
      return;
    }
    api
      .get("/auth/me", { headers: authHeaders() })
      .then(({ data }) => setUser(data))
      .catch(() => localStorage.removeItem("atelier_token"))
      .finally(() => setLoading(false));
  }, []);
  if (loading)
    return (
      <div className="grid min-h-screen place-items-center bg-[#0b0b0b] text-[#d7ad58]">
        {t("client.loading")}
      </div>
    );
  if (!user)
    return (
      <AuthScreen
        mode={mode}
        setMode={setMode}
        form={form}
        setForm={setForm}
        error={error}
        setError={setError}
        onSuccess={setUser}
      />
    );
  const logout = async () => {
    try {
      await api.post("/auth/logout", {}, { headers: authHeaders() });
    } catch {
      /* Clear the local session even if the API is unreachable. */
    } finally {
      localStorage.removeItem("atelier_token");
      setUser(null);
    }
  };
  return <ClientWorkspace user={user} language={language} onLogout={logout} />;
}

function AuthScreen({
  mode,
  setMode,
  form,
  setForm,
  error,
  setError,
  onSuccess,
}) {
  const { t } = useTranslation();
  const submit = async (event) => {
    event.preventDefault();
    setError("");
    try {
      const { data } = await api.post(
        `/auth/${mode === "login" ? "login" : "register"}`,
        form,
      );
      localStorage.setItem("atelier_token", data.token);
      onSuccess(data.user);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          Object.values(err.response?.data?.errors || {}).flat()[0] ||
          t("client.error"),
      );
    }
  };
  return (
    <div className="relative grid min-h-screen place-items-center bg-[#0b0b0b] px-5 py-24 text-[#f3eee5]">
      <div className="absolute right-5 top-5 z-10">
        <LanguageSwitcher />
      </div>
      <form
        onSubmit={submit}
        className="w-full max-w-md border border-[#292929] bg-[#141414] p-8 shadow-[0_20px_80px_rgba(215,173,88,.08)]"
      >
        <div className="font-mono text-sm tracking-[.25em]">
          <span className="block text-[#999]">ATELIER</span>
          <b className="font-normal text-[#d7ad58]">NOIR / CLIENT</b>
        </div>
        <h1 className="mt-10 font-display text-3xl">
          {t(mode === "login" ? "client.loginTitle" : "client.registerTitle")}
        </h1>
        <p className="mt-3 text-sm text-[#888]">
          {t(
            mode === "login"
              ? "client.loginSubtitle"
              : "client.registerSubtitle",
          )}
        </p>
        {mode === "register" && (
          <Field
            label={t("client.name")}
            value={form.name}
            onChange={(value) => setForm({ ...form, name: value })}
          />
        )}
        <Field
          label={t("client.email")}
          type="email"
          value={form.email}
          onChange={(value) => setForm({ ...form, email: value })}
        />
        {mode === "register" && (
          <Field
            label={t("client.phone")}
            type="tel"
            value={form.phone}
            onChange={(value) => setForm({ ...form, phone: value })}
          />
        )}
        <Field
          label={t("client.password")}
          type="password"
          value={form.password}
          onChange={(value) => setForm({ ...form, password: value })}
          minLength={8}
          autoComplete={mode === "login" ? "current-password" : "new-password"}
        />
        {error && (
          <p role="alert" className="mt-4 text-sm text-red-300">
            {error}
          </p>
        )}
        <button className="mt-6 flex w-full items-center justify-center gap-2 bg-[#d7ad58] py-3 text-sm font-semibold text-[#19140b]">
          {t(mode === "login" ? "client.signIn" : "client.createAccount")}{" "}
          <ArrowRight size={16} />
        </button>
        <button
          type="button"
          onClick={() => {
            setMode(mode === "login" ? "register" : "login");
            setError("");
          }}
          className="mt-5 w-full text-center text-xs text-[#aaa] hover:text-[#d7ad58]"
        >
          {t(mode === "login" ? "client.noAccount" : "client.hasAccount")}
        </button>
        <a
          href="/"
          className="mt-6 flex items-center justify-center gap-2 text-xs text-[#777]"
        >
          <ArrowLeft size={14} /> {t("client.backToSite")}
        </a>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  minLength,
  autoComplete,
}) {
  return (
    <label className="mt-5 block text-xs text-[#999]">
      {label}
      <input
        required
        type={type}
        minLength={minLength}
        autoComplete={autoComplete}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 w-full border border-[#393939] bg-[#202020] p-3 text-sm text-white outline-none focus:border-[#d7ad58]"
      />
    </label>
  );
}

function ClientWorkspace({ user, onLogout, language }) {
  const { t } = useTranslation();
  const [view, setView] = useState("appointments");
  const [refresh, setRefresh] = useState(0);
  return (
    <div className="min-h-screen bg-[#0b0b0b] text-[#f3eee5]">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-[#292929] px-5 py-5 sm:px-10">
        <a href="/" className="font-mono text-sm tracking-[.25em]">
          <span className="block text-[#999]">ATELIER</span>
          <b className="font-normal text-[#d7ad58]">NOIR</b>
        </a>
        <div className="flex flex-wrap items-center justify-end gap-3 sm:gap-5">
          <span className="hidden text-sm text-[#aaa] sm:block">
            {t("client.hello")} {user.name}
          </span>
          <a
            href="/"
            className="flex items-center gap-2 border border-[#393939] px-3 py-2 text-xs text-[#ccc] transition hover:border-[#d7ad58] hover:text-[#d7ad58]"
          >
            <ArrowLeft size={14} /> {t("client.backToSite")}
          </a>
          <button
            onClick={onLogout}
            className="flex items-center gap-2 border border-[#393939] px-3 py-2 text-xs text-[#ccc] transition hover:border-red-400 hover:text-red-300"
          >
            <LogOut size={15} /> {t("common.logout")}
          </button>
          <LanguageSwitcher />
        </div>
      </header>
      <main className="mx-auto max-w-6xl p-5 sm:p-10">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] tracking-[.2em] text-[#d7ad58]">
              {t("client.portalLabel")}
            </p>
            <h1 className="mt-2 font-display text-4xl">
              {t("client.welcome")}, {user.name.split(" ")[0]}.
            </h1>
          </div>
          <button
            onClick={() => setView("booking")}
            className="flex items-center gap-2 bg-[#d7ad58] px-5 py-3 text-sm font-semibold text-[#19140b]"
          >
            <CalendarDays size={16} /> {t("client.book")}
          </button>
        </div>
        <div className="mb-8 flex gap-1 border-b border-[#292929]">
          <button
            onClick={() => setView("appointments")}
            className={`px-4 py-3 text-sm ${view === "appointments" ? "border-b-2 border-[#d7ad58] text-[#d7ad58]" : "text-[#888]"}`}
          >
            {t("client.appointments")}
          </button>
          <button
            onClick={() => setView("booking")}
            className={`px-4 py-3 text-sm ${view === "booking" ? "border-b-2 border-[#d7ad58] text-[#d7ad58]" : "text-[#888]"}`}
          >
            {t("client.newBooking")}
          </button>
        </div>
        {view === "booking" ? (
          <Booking
            language={language}
            onDone={() => {
              setView("appointments");
              setRefresh(refresh + 1);
            }}
          />
        ) : (
          <Appointments key={refresh} language={language} />
        )}
      </main>
    </div>
  );
}

function Appointments({ language }) {
  const { t } = useTranslation();
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    api
      .get("/appointments", { headers: authHeaders() })
      .then(({ data }) =>
        setItems(Array.isArray(data) ? data : data.data || []),
      )
      .catch(() => setError(t("client.loadAppointmentsError")));
  }, [t]);
  const cancel = async (id) => {
    try {
      await api.patch(
        `/appointments/${id}`,
        { status: "cancelled" },
        { headers: authHeaders() },
      );
      setItems((current) =>
        current.map((item) =>
          item.id === id ? { ...item, status: "cancelled" } : item,
        ),
      );
    } catch {
      setError(t("client.error"));
    }
  };
  const dateLocale =
    { fr: "fr-FR", en: "en-GB", ar: "ar", es: "es-ES", de: "de-DE" }[
      language
    ] || "fr-FR";
  const statuses = {
    pending: t("client.pending"),
    confirmed: t("client.confirmed"),
    cancelled: t("client.cancelled"),
    completed: t("client.completed"),
  };
  return (
    <div className="grid gap-4">
      {error && (
        <p role="alert" className="text-sm text-red-300">
          {error}
        </p>
      )}
      {items.map((item) => (
        <article
          key={item.id}
          className="flex flex-wrap items-center justify-between gap-5 border border-[#292929] bg-[#141414] p-5"
        >
          <div className="flex items-center gap-4">
            <div className="grid h-12 w-12 place-items-center bg-[#2a2419] text-[#d7ad58]">
              <Scissors size={20} />
            </div>
            <div>
              <h3 className="text-lg">
                {item.services
                  ?.map((s) => s.service?.name)
                  .filter(Boolean)
                  .join(" + ") || t("client.appointment")}
              </h3>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#888]">
                <CalendarDays size={13} />{" "}
                {new Date(item.appointment_date).toLocaleDateString(dateLocale)}{" "}
                <Clock3 size={13} /> {item.start_time?.slice(0, 5)} ·{" "}
                {item.barber?.name}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span
              className={`rounded-full px-3 py-1 text-xs ${item.status === "cancelled" ? "bg-red-950 text-red-300" : item.status === "confirmed" ? "bg-emerald-950 text-emerald-300" : "bg-[#332b1d] text-[#e1b965]"}`}
            >
              {statuses[item.status] || item.status}
            </span>
            {!["cancelled", "completed"].includes(item.status) && (
              <button
                onClick={() => cancel(item.id)}
                className="text-xs text-[#999] underline hover:text-red-300"
              >
                {t("client.cancel")}
              </button>
            )}
          </div>
        </article>
      ))}
      {!items.length && !error && (
        <div className="border border-dashed border-[#393939] p-12 text-center text-[#888]">
          {t("client.emptyAppointments")}
        </div>
      )}
    </div>
  );
}

function Booking({ onDone, language }) {
  const { t } = useTranslation();
  const [services, setServices] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [serviceId, setServiceId] = useState("");
  const [barberId, setBarberId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [slots, setSlots] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const service = useMemo(
    () => services.find((item) => String(item.id) === String(serviceId)),
    [services, serviceId],
  );
  useEffect(() => {
    Promise.all([api.get("/services"), api.get("/barbers")])
      .then(([serviceResponse, barberResponse]) => {
        const serviceData = serviceResponse.data.data || serviceResponse.data;
        const barberData = barberResponse.data.data || barberResponse.data;
        setServices(serviceData);
        setBarbers(barberData);
        if (serviceData[0]) setServiceId(serviceData[0].id);
        if (barberData[0]) setBarberId(barberData[0].id);
      })
      .catch(() => setError(t("client.loadBookingError")));
  }, [t]);
  useEffect(() => {
    setTime("");
    setSlots([]);
    if (!date || !barberId || !service) return;
    api
      .get("/availability", {
        params: {
          barber_id: barberId,
          date,
          total_duration_minutes: service.duration_minutes,
        },
      })
      .then(({ data }) => setSlots(data.slots || data))
      .catch(() => setError(t("client.loadSlotsError")));
  }, [date, barberId, service, t]);
  const submit = async () => {
    setError("");
    setSaving(true);
    try {
      await api.post(
        "/appointments",
        {
          barber_id: barberId,
          appointment_date: date,
          start_time: time,
          service_ids: [serviceId],
          addon_ids: [],
        },
        { headers: authHeaders() },
      );
      onDone();
    } catch (err) {
      setError(err.response?.data?.message || t("client.slotUnavailable"));
    } finally {
      setSaving(false);
    }
  };
  const locale =
    { fr: "fr-FR", en: "en-GB", ar: "ar", es: "es-ES", de: "de-DE" }[
      language
    ] || "fr-FR";
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
      <div className="space-y-6 border border-[#292929] bg-[#141414] p-6">
        <Step label="01" title={t("client.service")}>
          <select
            required
            value={serviceId}
            onChange={(event) => setServiceId(event.target.value)}
            className="mt-3 w-full border border-[#393939] bg-[#202020] p-3 text-sm text-white"
          >
            {services.map((item) => (
              <option value={item.id} key={item.id}>
                {item.name} · {item.price}€ · {item.duration_minutes}{" "}
                {t("client.minutes")}
              </option>
            ))}
          </select>
        </Step>
        <Step label="02" title={t("client.barber")}>
          <select
            required
            value={barberId}
            onChange={(event) => setBarberId(event.target.value)}
            className="mt-3 w-full border border-[#393939] bg-[#202020] p-3 text-sm text-white"
          >
            {barbers.map((item) => (
              <option value={item.id} key={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </Step>
        <Step label="03" title={t("client.date")}>
          <input
            required
            type="date"
            min={new Date().toISOString().slice(0, 10)}
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className="mt-3 w-full border border-[#393939] bg-[#202020] p-3 text-sm text-white"
          />
        </Step>
        <Step label="04" title={t("client.time")}>
          <div className="mt-3 grid grid-cols-3 gap-2">
            {slots.map((slot) => (
              <button
                type="button"
                className={`border p-3 text-xs ${time === slot ? "border-[#d7ad58] bg-[#2a2419] text-[#d7ad58]" : "border-[#393939] bg-[#202020]"}`}
                onClick={() => setTime(slot)}
                key={slot}
              >
                {slot}
              </button>
            ))}
          </div>
          {date && !slots.length && (
            <p className="mt-3 text-xs text-[#999]">{t("client.noSlots")}</p>
          )}
        </Step>
        {error && (
          <p role="alert" className="text-sm text-red-300">
            {error}
          </p>
        )}
        <button
          disabled={!time || saving}
          onClick={submit}
          className="flex w-full items-center justify-center gap-2 bg-[#d7ad58] py-3 text-sm font-semibold text-[#19140b] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving ? t("client.saving") : t("client.confirmBooking")}{" "}
          <Check size={16} />
        </button>
      </div>
      <aside className="h-fit border border-[#3a342a] bg-[#1b1812] p-6">
        <p className="font-mono text-[10px] tracking-[.18em] text-[#d7ad58]">
          {t("client.summary")}
        </p>
        <h3 className="mt-5 font-display text-2xl">
          {service?.name || t("client.chooseService")}
        </h3>
        <p className="mt-3 text-sm text-[#aaa]">{service?.description}</p>
        <div className="mt-6 space-y-3 border-t border-[#4a3e2b] pt-5 text-sm">
          <div className="flex justify-between">
            <span className="text-[#888]">{t("client.price")}</span>
            <b>{service?.price || 0} €</b>
          </div>
          <div className="flex justify-between">
            <span className="text-[#888]">{t("client.duration")}</span>
            <b>
              {service?.duration_minutes || 0} {t("client.minutes")}
            </b>
          </div>
          {date && (
            <div className="flex justify-between gap-4">
              <span className="text-[#888]">{t("client.date")}</span>
              <b>{new Date(`${date}T12:00:00`).toLocaleDateString(locale)}</b>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

function Step({ label, title, children }) {
  return (
    <div>
      <p className="font-mono text-[10px] tracking-[.18em] text-[#d7ad58]">
        {label} / {title}
      </p>
      {children}
    </div>
  );
}
