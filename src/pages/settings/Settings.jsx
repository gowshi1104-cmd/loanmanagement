import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  User,
  Lock,
  Users,
  ShieldCheck,
  ChevronRight,
  Sun,
  Moon,
  Monitor,
  Check,
  Settings2,
  Sparkles,
  ArrowUpRight,
  KeyRound,
  Shield,
  Palette,
} from "lucide-react";

const menus = [
  {
    title: "My Profile",
    description: "View and update your profile",
    icon: User,
    color:
      "bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
    path: "/settings/profile",
  },
  {
    title: "Change Password",
    description: "Update your account password",
    icon: Lock,
    color:
      "bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400",
    path: "/settings/change-password",
  },
  {
    title: "User Management",
    description: "Manage application users",
    icon: Users,
    color:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400",
    path: "/settings/users",
  },
  {
    title: "Roles & Permissions",
    description: "Manage roles and permissions",
    icon: ShieldCheck,
    color:
      "bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400",
    path: "/settings/roles",
  },
];

const themeOptions = [
  {
    value: "light",
    title: "Light",
    description: "Use light appearance",
    icon: Sun,
  },
  {
    value: "dark",
    title: "Dark",
    description: "Use dark appearance",
    icon: Moon,
  },
  {
    value: "system",
    title: "System",
    description: "Follow your device settings",
    icon: Monitor,
  },
];

const applyTheme = (selectedTheme) => {
  const root = document.documentElement;

  if (selectedTheme === "dark") {
    root.classList.add("dark");
    return;
  }

  if (selectedTheme === "light") {
    root.classList.remove("dark");
    return;
  }

  const systemDark = window.matchMedia(
    "(prefers-color-scheme: dark)"
  ).matches;

  root.classList.toggle("dark", systemDark);
};

export default function Settings() {
  const navigate = useNavigate();

  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "system"
  );

  useEffect(() => {
    applyTheme(theme);

    if (theme !== "system") {
      return;
    }

    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );

    const handleSystemThemeChange = () => {
      applyTheme("system");
    };

    mediaQuery.addEventListener(
      "change",
      handleSystemThemeChange
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleSystemThemeChange
      );
    };
  }, [theme]);

  const handleThemeChange = (value) => {
    setTheme(value);
    localStorage.setItem("theme", value);
    applyTheme(value);
  };

  const currentTheme =
    themeOptions.find((item) => item.value === theme) ||
    themeOptions[2];

  return (
    <div className="min-h-full w-full min-w-0 bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-[#020617] dark:text-white">
      <div className="mx-auto w-full max-w-[1450px] px-0 py-0 sm:px-1 sm:py-1 lg:px-2">

        {/* =====================================================
            HEADER / HERO
        ====================================================== */}

        <div className="relative mb-4 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:mb-5 sm:rounded-3xl">
          {/* Decorative background */}
          <div className="pointer-events-none absolute -right-20 -top-24 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl sm:h-72 sm:w-72" />

          <div className="pointer-events-none absolute -bottom-24 left-1/3 h-48 w-48 rounded-full bg-purple-500/5 blur-3xl sm:h-64 sm:w-64" />

          <div className="relative flex flex-col gap-5 p-4 sm:gap-6 sm:p-6 md:p-7 lg:flex-row lg:items-center lg:justify-between lg:p-8">

            {/* Left */}
            <div className="flex min-w-0 items-start gap-3 sm:gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20 sm:h-14 sm:w-14 sm:rounded-2xl">
                <Settings2
                  size={22}
                  strokeWidth={2}
                  className="sm:size-[27px]"
                />
              </div>

              <div className="min-w-0">
                <div className="mb-1.5 inline-flex max-w-full items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-1 text-[10px] font-semibold text-blue-600 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400 sm:mb-2 sm:px-3 sm:text-xs">
                  <Sparkles size={12} />
                  <span className="truncate">
                    Account & Preferences
                  </span>
                </div>

                <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
                  Settings
                </h1>

                <p className="mt-1 max-w-2xl text-xs leading-5 text-slate-500 dark:text-slate-400 sm:mt-1.5 sm:text-sm sm:leading-6">
                  Manage your account, security, access control and
                  application preferences from one place.
                </p>
              </div>
            </div>

            {/* Current theme */}
            <div className="flex w-full items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 dark:border-slate-800 dark:bg-slate-950/70 sm:w-fit sm:rounded-2xl sm:px-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm dark:bg-slate-800 dark:text-slate-300 sm:h-10 sm:w-10 sm:rounded-xl">
                <currentTheme.icon size={18} />
              </div>

              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 sm:text-[11px]">
                  Current Theme
                </p>

                <p className="mt-0.5 text-sm font-semibold text-slate-800 dark:text-white">
                  {currentTheme.title}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            ACCOUNT & ACCESS
        ====================================================== */}

        <div className="mb-3 flex items-center justify-between">
          <div className="min-w-0">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Account & Access
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Manage your account and access settings
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
          {menus.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.title}
                type="button"
                onClick={() => navigate(item.path)}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:shadow-black/20 sm:p-5"
              >
                {/* Hover glow */}
                <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full bg-blue-500/5 blur-2xl transition-all duration-300 group-hover:bg-blue-500/10" />

                <div className="relative flex items-start justify-between gap-3">
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 ${item.color}`}
                  >
                    <Icon size={20} strokeWidth={2} />
                  </div>

                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-all duration-300 group-hover:bg-slate-100 group-hover:text-slate-700 dark:text-slate-500 dark:group-hover:bg-slate-800 dark:group-hover:text-slate-200">
                    <ArrowUpRight
                      size={17}
                      className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                    />
                  </div>
                </div>

                <div className="relative mt-4 sm:mt-5">
                  <h3 className="text-[15px] font-bold text-slate-800 dark:text-white">
                    {item.title}
                  </h3>

                  <p className="mt-1.5 text-xs leading-5 text-slate-500 dark:text-slate-400">
                    {item.description}
                  </p>
                </div>

                <div className="relative mt-3 flex items-center gap-1 text-xs font-semibold text-blue-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100 dark:text-blue-400 sm:mt-4">
                  Open settings
                  <ChevronRight size={14} />
                </div>
              </button>
            );
          })}
        </div>

        {/* =====================================================
            MAIN SETTINGS AREA
        ====================================================== */}

        <div className="mt-5 grid grid-cols-1 gap-4 xl:mt-6 xl:grid-cols-[minmax(0,1.8fr)_minmax(300px,0.8fr)] xl:gap-5">

          {/* =================================================
              APPEARANCE
          ================================================== */}

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">

            {/* Section Header */}
            <div className="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:px-5 sm:py-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 sm:h-10 sm:w-10 sm:rounded-xl">
                  <Palette size={18} />
                </div>

                <div className="min-w-0">
                  <h2 className="text-base font-bold text-slate-800 dark:text-white">
                    Appearance
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Choose your preferred application theme
                  </p>
                </div>
              </div>

              <span className="w-fit rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                Theme Preference
              </span>
            </div>

            {/* Theme Options */}
            <div className="p-3.5 sm:p-5">
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                {themeOptions.map((option) => {
                  const Icon = option.icon;
                  const selected = theme === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        handleThemeChange(option.value)
                      }
                      className={`group relative overflow-hidden rounded-xl border p-3.5 text-left transition-all duration-200 sm:p-4 ${
                        selected
                          ? "border-blue-500 bg-blue-50/70 shadow-sm dark:border-blue-500 dark:bg-blue-500/10"
                          : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white dark:border-slate-800 dark:bg-slate-950/50 dark:hover:border-slate-700 dark:hover:bg-slate-800/60"
                      }`}
                    >
                      {/* Selected indicator */}
                      {selected && (
                        <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
                          <Check
                            size={14}
                            strokeWidth={2.5}
                          />
                        </div>
                      )}

                      <div className="flex items-center gap-3 pr-7">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors sm:h-11 sm:w-11 ${
                            selected
                              ? "bg-blue-600 text-white"
                              : "bg-slate-200 text-slate-600 group-hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-slate-700"
                          }`}
                        >
                          <Icon size={20} />
                        </div>

                        <div className="min-w-0">
                          <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                            {option.title}
                          </h3>

                          <p className="mt-0.5 text-[11px] leading-4 text-slate-500 dark:text-slate-400">
                            {option.description}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Current Selection */}
              <div className="mt-3 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 dark:border-slate-800 dark:bg-slate-950/50 sm:mt-4 sm:flex-row sm:items-center sm:justify-between sm:px-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white text-blue-600 shadow-sm dark:bg-slate-800 dark:text-blue-400">
                    <Check size={16} />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200">
                      Appearance preference saved
                    </p>

                    <p className="mt-0.5 text-[11px] leading-4 text-slate-400">
                      Your selected theme is applied across the application.
                    </p>
                  </div>
                </div>

                <span className="hidden shrink-0 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold text-emerald-600 sm:block dark:bg-emerald-500/10 dark:text-emerald-400">
                  ACTIVE
                </span>
              </div>
            </div>
          </div>

          {/* =================================================
              SECURITY & ACCESS
          ================================================== */}

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400 sm:h-10 sm:w-10 sm:rounded-xl">
                <Shield size={18} />
              </div>

              <div className="min-w-0">
                <h2 className="text-base font-bold text-slate-800 dark:text-white">
                  Security & Access
                </h2>

                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  Manage account protection
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3 sm:mt-5">

              {/* Password */}
              <button
                type="button"
                onClick={() =>
                  navigate("/settings/change-password")
                }
                className="group flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition-all hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-800/60 sm:p-3.5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
                  <KeyRound size={17} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Password & Security
                  </p>

                  <p className="mt-0.5 truncate text-[11px] text-slate-400">
                    Update your account password
                  </p>
                </div>

                <ChevronRight
                  size={16}
                  className="shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5"
                />
              </button>

              {/* Roles */}
              <button
                type="button"
                onClick={() =>
                  navigate("/settings/roles")
                }
                className="group flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition-all hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-800/60 sm:p-3.5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
                  <ShieldCheck size={17} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    Roles & Permissions
                  </p>

                  <p className="mt-0.5 truncate text-[11px] text-slate-400">
                    Control roles and application access
                  </p>
                </div>

                <ChevronRight
                  size={16}
                  className="shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5"
                />
              </button>

              {/* Users */}
              <button
                type="button"
                onClick={() =>
                  navigate("/settings/users")
                }
                className="group flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left transition-all hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-800/60 sm:p-3.5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
                  <Users size={17} />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                    User Access
                  </p>

                  <p className="mt-0.5 truncate text-[11px] text-slate-400">
                    Manage application users
                  </p>
                </div>

                <ChevronRight
                  size={16}
                  className="shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5"
                />
              </button>
            </div>

            {/* Security Note */}
            <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-950/60 sm:p-3.5">
              <div className="flex gap-2.5">
                <ShieldCheck
                  size={16}
                  className="mt-0.5 shrink-0 text-emerald-500"
                />

                <p className="text-[11px] leading-5 text-slate-500 dark:text-slate-400">
                  Keep your account details and access permissions
                  up to date for a secure application experience.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
            BOTTOM INFORMATION
        ====================================================== */}

        <div className="mt-4 grid grid-cols-1 gap-3 sm:mt-5 sm:grid-cols-2 sm:gap-4 md:grid-cols-3">

          {/* Profile */}
          <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <User size={17} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Personal Details
              </p>

              <p className="mt-0.5 text-[11px] leading-4 text-slate-400">
                Keep your profile information updated
              </p>
            </div>
          </div>

          {/* Security */}
          <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
              <Lock size={17} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Account Security
              </p>

              <p className="mt-0.5 text-[11px] leading-4 text-slate-400">
                Protect your account with secure credentials
              </p>
            </div>
          </div>

          {/* Preferences */}
          <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-400">
              <Settings2 size={17} />
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Application Preferences
              </p>

              <p className="mt-0.5 text-[11px] leading-4 text-slate-400">
                Customize your application experience
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}