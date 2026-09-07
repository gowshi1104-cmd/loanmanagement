import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { ChevronDown, X } from "lucide-react";

import { navigation } from "../../constants/navigation";
import { useSidebar } from "../../context/SidebarContext";
import { hasPermission, getUser } from "../../utils/auth";
import { getMyFeatures } from "../../services/featureService";

const Sidebar = () => {
  const {
    collapsed,
    mobileOpen,
    closeMobileSidebar,
  } = useSidebar();

  const location = useLocation();

  const [openMenus, setOpenMenus] = useState({
    Loans: location.pathname.startsWith("/loans"),
  });

  const [enabledFeatures, setEnabledFeatures] = useState(new Set());
  const [featureLoading, setFeatureLoading] = useState(true);

  // =====================================================
  // CURRENT USER / ADMIN CHECK
  // =====================================================

  const user = getUser();

  const normalizedRole = String(user?.role || "")
    .replace(/^ROLE_/i, "")
    .trim()
    .toUpperCase();

  const isAdmin = normalizedRole === "ADMIN";

  // =====================================================
  // LOAD ENABLED FEATURES
  // =====================================================

  const loadEnabledFeatures = async () => {
    /*
     * Admin is not restricted by feature switches.
     */

    if (isAdmin) {
      setEnabledFeatures(new Set());
      setFeatureLoading(false);
      return;
    }

    try {
      setFeatureLoading(true);

      const response = await getMyFeatures();

      const featureList = Array.isArray(response?.data)
        ? response.data
        : [];

      const featureKeys = new Set();

      featureList.forEach((feature) => {
        /*
         * Backend normally returns:
         *
         * {
         *   id: 1,
         *   featureKey: "DASHBOARD",
         *   enabled: true
         * }
         */

        if (typeof feature === "string") {
          featureKeys.add(feature.trim().toUpperCase());
          return;
        }

        if (feature?.featureKey && feature?.enabled !== false) {
          featureKeys.add(
            String(feature.featureKey)
              .trim()
              .toUpperCase()
          );
        }
      });

      setEnabledFeatures(featureKeys);
    } catch (error) {
      console.error(
        "Failed to load enabled features:",
        error
      );

      /*
       * Fail closed.
       */

      setEnabledFeatures(new Set());
    } finally {
      setFeatureLoading(false);
    }
  };

  useEffect(() => {
    loadEnabledFeatures();
  }, [isAdmin]);

  // =====================================================
  // REFRESH FEATURE ACCESS WHEN USER RETURNS TO TAB
  // =====================================================

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        loadEnabledFeatures();
      }
    };

    const handleWindowFocus = () => {
      loadEnabledFeatures();
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    window.addEventListener(
      "focus",
      handleWindowFocus
    );

    return () => {
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      window.removeEventListener(
        "focus",
        handleWindowFocus
      );
    };
  }, [isAdmin]);

  // =====================================================
  // CLOSE MOBILE SIDEBAR ON ROUTE CHANGE
  // =====================================================

  useEffect(() => {
    closeMobileSidebar();
  }, [location.pathname]);

  // =====================================================
  // CLOSE MOBILE SIDEBAR WITH ESC
  // =====================================================

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeMobileSidebar();
      }
    };

    document.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };
  }, []);

  // =====================================================
  // FEATURE ACCESS CHECK
  // =====================================================

  const hasFeatureAccess = (item) => {
    /*
     * Items without feature key use
     * the existing permission system.
     */

    if (!item?.feature) {
      return true;
    }

    /*
     * Admin is always allowed.
     */

    if (isAdmin) {
      return true;
    }

    /*
     * While loading, hide feature controlled menus.
     */

    if (featureLoading) {
      return false;
    }

    const featureKey = String(item.feature)
      .trim()
      .toUpperCase();

    return enabledFeatures.has(featureKey);
  };

  // =====================================================
  // PERMISSION + FEATURE ACCESS
  // =====================================================

  const canShowItem = (item) => {
    if (item?.permission) {
      if (!hasPermission(item.permission)) {
        return false;
      }
    }

    /*
     * Role handling.
     */

    if (item?.roles?.length > 0) {
      if (!item.roles.includes(normalizedRole)) {
        return false;
      }
    }

    /*
     * Feature access.
     */

    if (!hasFeatureAccess(item)) {
      return false;
    }

    return true;
  };

  // =====================================================
  // FILTER CHILDREN
  // =====================================================

  const getVisibleChildren = (item) => {
    if (!item?.children?.length) {
      return [];
    }

    return item.children.filter((child) =>
      canShowItem(child)
    );
  };

  // =====================================================
  // BUILD VISIBLE NAVIGATION
  // =====================================================

  const visibleNavigation = useMemo(() => {
    return navigation
      .map((item) => {
        if (item.children?.length > 0) {
          const visibleChildren =
            getVisibleChildren(item);

          if (!canShowItem(item)) {
            return null;
          }

          if (visibleChildren.length === 0) {
            return null;
          }

          return {
            ...item,
            children: visibleChildren,
          };
        }

        if (!canShowItem(item)) {
          return null;
        }

        return item;
      })
      .filter(Boolean);
  }, [
    enabledFeatures,
    featureLoading,
    normalizedRole,
    isAdmin,
  ]);

  // =====================================================
  // TOGGLE MENU
  // =====================================================

  const toggleMenu = (title) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  // =====================================================
  // CLOSE AFTER NAVIGATION
  // =====================================================

  const handleMobileNavigation = () => {
    closeMobileSidebar();
  };

  return (
    <>
      {/* =================================================
          MOBILE OVERLAY
          ================================================= */}

      <div
        className={`
          fixed inset-0 z-40
          bg-slate-950/50
          backdrop-blur-[2px]
          transition-opacity duration-300
          lg:hidden
          ${
            mobileOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }
        `}
        onClick={closeMobileSidebar}
        aria-hidden="true"
      />

      {/* =================================================
          SIDEBAR
          ================================================= */}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50
          flex h-screen flex-col
          bg-white text-slate-800
          shadow-xl
          transition-all duration-300
          dark:bg-slate-900
          dark:text-white

          lg:sticky
          lg:top-0
          lg:z-30
          lg:h-screen
          lg:shrink-0
          lg:shadow-none

          ${
            collapsed
              ? "lg:w-20"
              : "lg:w-64"
          }

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }

          lg:translate-x-0
        `}
      >
        {/* =================================================
            LOGO
            ================================================= */}

        <div
          className={`
            flex h-16 shrink-0 items-center
            border-b
            border-slate-200
            dark:border-slate-700

            ${
              collapsed
                ? "lg:justify-center"
                : "justify-between lg:justify-center"
            }
          `}
        >
          <h1
            className="
              text-xl
              font-bold
              text-slate-800
              dark:text-white
            "
          >
            {/* Mobile */}
            <span className="lg:hidden">
              Loan MS
            </span>

            {/* Desktop */}
            <span className="hidden lg:inline">
              {collapsed ? "LMS" : "Loan MS"}
            </span>
          </h1>

          {/* Mobile close button */}

          <button
            type="button"
            onClick={closeMobileSidebar}
            className="
              mr-3
              flex h-9 w-9
              items-center
              justify-center
              rounded-lg
              text-slate-500
              transition-colors
              hover:bg-slate-100
              hover:text-slate-800
              dark:text-slate-400
              dark:hover:bg-slate-800
              dark:hover:text-white
              lg:hidden
            "
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* =================================================
            NAVIGATION
            ================================================= */}

        <nav className="flex-1 overflow-y-auto p-3">
          <div className="space-y-2">
            {visibleNavigation.map((item) => {
              const Icon = item.icon;

              const hasChildren =
                item.children &&
                item.children.length > 0;

              const isLoanMenu =
                item.title === "Loans";

              const isOpen =
                openMenus[item.title];

              // =================================================
              // MENU WITH SUB MENUS
              // =================================================

              if (hasChildren) {
                return (
                  <div key={item.path}>
                    <button
                      type="button"
                      onClick={() => {
                        if (!collapsed) {
                          toggleMenu(item.title);
                        }
                      }}
                      className={`
                        flex
                        w-full
                        items-center
                        gap-3
                        rounded-lg
                        px-3
                        py-3
                        transition-colors

                        ${
                          isLoanMenu &&
                          location.pathname.startsWith(
                            "/loans"
                          )
                            ? "bg-blue-600 text-white"
                            : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                        }
                      `}
                    >
                      <Icon
                        size={20}
                        className="shrink-0"
                      />

                      {!collapsed && (
                        <>
                          <span className="flex-1 text-left font-medium">
                            {item.title}
                          </span>

                          <ChevronDown
                            size={18}
                            className={`
                              transition-transform
                              duration-200
                              ${
                                isOpen
                                  ? "rotate-180"
                                  : ""
                              }
                            `}
                          />
                        </>
                      )}
                    </button>

                    {!collapsed && isOpen && (
                      <div
                        className="
                          mt-1
                          ml-4
                          space-y-1
                          border-l
                          border-slate-200
                          pl-3
                          dark:border-slate-700
                        "
                      >
                        {item.children.map(
                          (child) => {
                            const ChildIcon =
                              child.icon;

                            return (
                              <NavLink
                                key={child.path}
                                to={child.path}
                                onClick={
                                  handleMobileNavigation
                                }
                                className={({
                                  isActive,
                                }) =>
                                  `
                                  flex
                                  items-center
                                  gap-3
                                  rounded-lg
                                  px-3
                                  py-2.5
                                  text-sm
                                  transition-colors

                                  ${
                                    isActive
                                      ? "bg-blue-600 text-white"
                                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                                  }
                                `
                                }
                              >
                                {ChildIcon && (
                                  <ChildIcon
                                    size={17}
                                    className="shrink-0"
                                  />
                                )}

                                <span className="font-medium">
                                  {child.title}
                                </span>
                              </NavLink>
                            );
                          }
                        )}
                      </div>
                    )}
                  </div>
                );
              }

              // =================================================
              // NORMAL MENU
              // =================================================

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={handleMobileNavigation}
                  className={({ isActive }) =>
                    `
                    flex
                    items-center
                    gap-3
                    rounded-lg
                    px-3
                    py-3
                    transition-colors

                    ${
                      isActive
                        ? "bg-blue-600 text-white"
                        : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
                    }
                  `
                  }
                >
                  <Icon
                    size={20}
                    className="shrink-0"
                  />

                  {!collapsed && (
                    <span className="font-medium">
                      {item.title}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;