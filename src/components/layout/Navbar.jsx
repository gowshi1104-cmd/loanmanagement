import {
  useState,
  useContext,
  useRef,
  useEffect,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  Menu,
  Bell,
  UserCircle,
  LogOut,
  Settings,
  CheckCheck,
} from "lucide-react";

import { useSidebar } from "../../context/SidebarContext";
import { AuthContext } from "../../context/AuthContext";

import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../../services/notificationService";

const Navbar = () => {
  const {
    toggleSidebar,
    toggleMobileSidebar,
  } = useSidebar();

  const { user, logout } = useContext(AuthContext);

  const navigate = useNavigate();

  // =====================================================
  // DROPDOWN STATES
  // =====================================================

  const [open, setOpen] = useState(false);

  const [notificationOpen, setNotificationOpen] =
    useState(false);

  // =====================================================
  // NOTIFICATION STATES
  // =====================================================

  const [notifications, setNotifications] = useState([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const [notificationLoading, setNotificationLoading] =
    useState(false);

  // =====================================================
  // REFS
  // =====================================================

  const dropdownRef = useRef(null);

  const notificationRef = useRef(null);

  // =====================================================
  // USER DETAILS
  // =====================================================

  const fullName = user?.fullName || "User";

  const role = user?.role || "USER";

  // =====================================================
  // CURRENT DATE
  // =====================================================

  const today = new Date().toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // =====================================================
  // LOAD NOTIFICATIONS
  // =====================================================

  const loadNotifications = async () => {
    try {
      const response = await getNotifications();

      setNotifications(
        Array.isArray(response.data)
          ? response.data
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load notifications:",
        error
      );
    }
  };

  // =====================================================
  // LOAD UNREAD COUNT
  // =====================================================

  const loadUnreadCount = async () => {
    try {
      const response = await getUnreadCount();

      setUnreadCount(Number(response.data) || 0);
    } catch (error) {
      console.error(
        "Failed to load notification count:",
        error
      );
    }
  };

  // =====================================================
  // INITIAL NOTIFICATION LOAD
  // =====================================================

  useEffect(() => {
    if (!user) {
      return;
    }

    loadNotifications();
    loadUnreadCount();
  }, [user]);

  // =====================================================
  // AUTO REFRESH
  // Every 10 seconds
  // =====================================================

  useEffect(() => {
    if (!user) {
      return;
    }

    const interval = setInterval(() => {
      loadUnreadCount();

      if (notificationOpen) {
        loadNotifications();
      }
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [user, notificationOpen]);

  // =====================================================
  // CLOSE DROPDOWNS ON OUTSIDE CLICK
  // =====================================================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setNotificationOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  // =====================================================
  // CLOSE NOTIFICATION WHEN ESC IS PRESSED
  // =====================================================

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setNotificationOpen(false);
        setOpen(false);
      }
    };

    document.addEventListener(
      "keydown",
      handleEscape
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, []);

  // =====================================================
  // OPEN NOTIFICATIONS
  // =====================================================

  const handleNotificationToggle = async () => {
    const nextState = !notificationOpen;

    setNotificationOpen(nextState);

    setOpen(false);

    if (nextState) {
      await loadNotifications();
      await loadUnreadCount();
    }
  };

  // =====================================================
  // MARK ONE AS READ
  // =====================================================

  const handleNotificationClick = async (
    notification
  ) => {
    if (!notification?.id) {
      return;
    }

    try {
      if (!notification.read) {
        await markNotificationAsRead(notification.id);

        setNotifications((previous) =>
          previous.map((item) =>
            item.id === notification.id
              ? {
                  ...item,
                  read: true,
                }
              : item
          )
        );

        setUnreadCount((previous) =>
          Math.max(0, previous - 1)
        );
      }
    } catch (error) {
      console.error(
        "Failed to mark notification as read:",
        error
      );
    }
  };

  // =====================================================
  // MARK ALL AS READ
  // =====================================================

  const handleMarkAllRead = async () => {
    try {
      setNotificationLoading(true);

      await markAllNotificationsAsRead();

      setNotifications((previous) =>
        previous.map((notification) => ({
          ...notification,
          read: true,
        }))
      );

      setUnreadCount(0);
    } catch (error) {
      console.error(
        "Failed to mark all notifications:",
        error
      );
    } finally {
      setNotificationLoading(false);
    }
  };

  // =====================================================
  // FORMAT TIME
  // =====================================================

  const formatNotificationTime = (dateValue) => {
    if (!dateValue) {
      return "";
    }

    const date = new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =====================================================
  // NOTIFICATION ICON TYPE
  // =====================================================

  const getNotificationIcon = (type) => {
    switch (type) {
      case "NEW_LOAN":
        return "📄";

      case "LOAN_APPROVED":
        return "✅";

      case "LOAN_REJECTED":
        return "❌";

      default:
        return "🔔";
    }
  };

  // =====================================================
  // JSX
  // =====================================================

  return (
    <header
      className="
        sticky
        top-0
        z-30
        flex
        h-16
        sm:h-20
        items-center
        justify-between
        border-b
        border-slate-200
        bg-white
        px-3
        sm:px-4
        lg:px-6
        text-slate-900
        transition-colors
        duration-300
        dark:border-slate-800
        dark:bg-slate-900
        dark:text-white
      "
    >
      {/* =====================================================
          LEFT SECTION
          ===================================================== */}

      <div
        className="
          flex
          min-w-0
          items-center
          gap-2
          sm:gap-4
          lg:gap-6
        "
      >
        {/* Mobile Sidebar Button */}

        <button
          type="button"
          onClick={toggleMobileSidebar}
          aria-label="Open navigation menu"
          className="
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-lg
            text-slate-700
            transition
            hover:bg-slate-100
            active:bg-slate-200
            dark:text-slate-200
            dark:hover:bg-slate-800
            dark:active:bg-slate-700
            lg:hidden
          "
        >
          <Menu size={23} />
        </button>

        {/* Desktop Sidebar Button */}

        <button
          type="button"
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className="
            hidden
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-lg
            text-slate-700
            transition
            hover:bg-slate-100
            active:bg-slate-200
            dark:text-slate-200
            dark:hover:bg-slate-800
            dark:active:bg-slate-700
            lg:flex
          "
        >
          <Menu size={24} />
        </button>

        {/* Title */}

        <div className="min-w-0">
          <h2
            className="
              truncate
              text-sm
              font-semibold
              text-slate-800
              sm:text-lg
              lg:text-xl
              dark:text-white
            "
          >
            Loan Management System
          </h2>

          <p
            className="
              mt-0.5
              hidden
              text-xs
              text-gray-500
              sm:block
              sm:text-sm
              dark:text-slate-400
            "
          >
            {today}
          </p>
        </div>
      </div>

      {/* =====================================================
          RIGHT SECTION
          ===================================================== */}

      <div
        className="
          flex
          shrink-0
          items-center
          gap-1
          sm:gap-2
          lg:gap-6
        "
      >
        {/* ===================================================
            NOTIFICATION
            =================================================== */}

        <div
          ref={notificationRef}
          className="relative"
        >
          {/* Notification Button */}

          <button
            type="button"
            onClick={handleNotificationToggle}
            aria-label="Notifications"
            aria-expanded={notificationOpen}
            className="
              relative
              flex
              h-10
              w-10
              items-center
              justify-center
              rounded-lg
              text-slate-700
              transition
              hover:bg-slate-100
              active:bg-slate-200
              dark:text-slate-200
              dark:hover:bg-slate-800
              dark:active:bg-slate-700
            "
          >
            <Bell size={21} />

            {/* Unread Badge */}

            {unreadCount > 0 && (
              <span
                className="
                  absolute
                  right-0
                  top-0
                  flex
                  h-[18px]
                  min-w-[18px]
                  items-center
                  justify-center
                  rounded-full
                  bg-red-500
                  px-1
                  text-[10px]
                  font-bold
                  leading-none
                  text-white
                  ring-2
                  ring-white
                  dark:ring-slate-900
                "
              >
                {unreadCount > 99
                  ? "99+"
                  : unreadCount}
              </span>
            )}
          </button>

          {/* =================================================
              NOTIFICATION DROPDOWN
              ================================================= */}

          {notificationOpen && (
            <div
              className="
                fixed
                left-3
                right-3
                top-[68px]
                z-[100]
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-2xl
                sm:absolute
                sm:left-auto
                sm:right-0
                sm:top-auto
                sm:mt-3
                sm:w-[380px]
                sm:rounded-xl
                dark:border-slate-700
                dark:bg-slate-900
              "
            >
              {/* =================================================
                  NOTIFICATION HEADER
                  ================================================= */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-3
                  border-b
                  border-slate-200
                  bg-slate-50
                  px-4
                  py-3.5
                  dark:border-slate-700
                  dark:bg-slate-800
                "
              >
                {/* Header Title */}

                <div className="min-w-0">
                  <h3
                    className="
                      truncate
                      text-sm
                      font-semibold
                      text-slate-800
                      sm:text-base
                      dark:text-white
                    "
                  >
                    Notifications
                  </h3>

                  <p
                    className="
                      mt-0.5
                      text-xs
                      text-slate-500
                      dark:text-slate-400
                    "
                  >
                    {unreadCount > 0
                      ? `${unreadCount} unread`
                      : "You're all caught up"}
                  </p>
                </div>

                {/* Mark All Read */}

                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={handleMarkAllRead}
                    disabled={notificationLoading}
                    className="
                      flex
                      shrink-0
                      items-center
                      gap-1.5
                      rounded-md
                      px-2
                      py-1.5
                      text-[11px]
                      font-semibold
                      text-blue-600
                      transition
                      hover:bg-blue-50
                      hover:text-blue-700
                      disabled:cursor-not-allowed
                      disabled:opacity-50
                      sm:text-xs
                      dark:text-blue-400
                      dark:hover:bg-blue-950/40
                      dark:hover:text-blue-300
                    "
                  >
                    <CheckCheck size={15} />

                    <span className="whitespace-nowrap">
                      Mark all read
                    </span>
                  </button>
                )}
              </div>

              {/* =================================================
                  NOTIFICATION LIST
                  ================================================= */}

              <div
                className="
                  max-h-[calc(100vh-150px)]
                  overflow-y-auto
                  overscroll-contain
                  sm:max-h-[420px]
                "
              >
                {notifications.length === 0 ? (
                  /* Empty State */

                  <div
                    className="
                      flex
                      min-h-[220px]
                      flex-col
                      items-center
                      justify-center
                      px-6
                      py-10
                      text-center
                    "
                  >
                    <div
                      className="
                        mb-3
                        flex
                        h-14
                        w-14
                        items-center
                        justify-center
                        rounded-full
                        bg-slate-100
                        dark:bg-slate-800
                      "
                    >
                      <Bell
                        size={28}
                        className="
                          text-slate-400
                          dark:text-slate-500
                        "
                      />
                    </div>

                    <p
                      className="
                        text-sm
                        font-medium
                        text-slate-700
                        dark:text-slate-200
                      "
                    >
                      No notifications
                    </p>

                    <p
                      className="
                        mt-1
                        text-xs
                        text-slate-400
                        dark:text-slate-500
                      "
                    >
                      You're all caught up.
                    </p>
                  </div>
                ) : (
                  notifications.map(
                    (notification) => (
                      <button
                        type="button"
                        key={notification.id}
                        onClick={() =>
                          handleNotificationClick(
                            notification
                          )
                        }
                        className={`
                          block
                          w-full
                          border-b
                          border-slate-100
                          px-4
                          py-3.5
                          text-left
                          transition-colors
                          last:border-b-0
                          dark:border-slate-800

                          ${
                            notification.read
                              ? "bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800"
                              : "bg-blue-50/80 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-950/60"
                          }
                        `}
                      >
                        <div className="flex min-w-0 gap-3">
                          {/* Notification Icon */}

                          <div
                            className="
                              flex
                              h-10
                              w-10
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              border
                              border-slate-200
                              bg-white
                              text-base
                              shadow-sm
                              dark:border-slate-700
                              dark:bg-slate-800
                            "
                          >
                            {getNotificationIcon(
                              notification.type
                            )}
                          </div>

                          {/* Notification Content */}

                          <div className="min-w-0 flex-1">
                            <div
                              className="
                                flex
                                items-start
                                justify-between
                                gap-2
                              "
                            >
                              <p
                                className={`
                                  min-w-0
                                  break-words
                                  text-sm
                                  leading-5
                                  ${
                                    notification.read
                                      ? "font-medium text-slate-700 dark:text-slate-300"
                                      : "font-semibold text-slate-900 dark:text-white"
                                  }
                                `}
                              >
                                {notification.title}
                              </p>

                              {!notification.read && (
                                <span
                                  className="
                                    mt-1.5
                                    h-2
                                    w-2
                                    shrink-0
                                    rounded-full
                                    bg-blue-600
                                  "
                                />
                              )}
                            </div>

                            <p
                              className="
                                mt-1
                                break-words
                                text-xs
                                leading-5
                                text-slate-600
                                dark:text-slate-400
                              "
                            >
                              {notification.message}
                            </p>

                            <p
                              className="
                                mt-2
                                text-[11px]
                                leading-4
                                text-slate-400
                                dark:text-slate-500
                              "
                            >
                              {formatNotificationTime(
                                notification.createdAt
                              )}
                            </p>
                          </div>
                        </div>
                      </button>
                    )
                  )
                )}
              </div>
            </div>
          )}
        </div>

        {/* ===================================================
            PROFILE
            =================================================== */}

        <div
          className="relative"
          ref={dropdownRef}
        >
          <button
            type="button"
            onClick={() => {
              setOpen(!open);
              setNotificationOpen(false);
            }}
            aria-label="Open profile menu"
            className="
              flex
              items-center
              gap-2
              rounded-lg
              px-1
              py-1.5
              transition
              hover:bg-slate-100
              active:bg-slate-200
              sm:gap-3
              sm:px-2
              sm:py-2
              dark:hover:bg-slate-800
              dark:active:bg-slate-700
            "
          >
            {/* User Details */}

            <div className="hidden text-right sm:block">
              <p
                className="
                  max-w-[160px]
                  truncate
                  text-sm
                  font-semibold
                  text-slate-800
                  lg:max-w-none
                  lg:text-base
                  dark:text-white
                "
              >
                {fullName}
              </p>

              <p
                className="
                  text-xs
                  text-gray-500
                  dark:text-slate-400
                "
              >
                {role}
              </p>
            </div>

            <UserCircle
              size={36}
              className="
                text-blue-600
                sm:h-10
                sm:w-10
                dark:text-blue-400
              "
            />
          </button>

          {/* =================================================
              PROFILE DROPDOWN
              ================================================= */}

          {open && (
            <div
              className="
                absolute
                right-0
                z-50
                mt-2
                w-48
                overflow-hidden
                rounded-xl
                border
                border-slate-200
                bg-white
                shadow-xl
                dark:border-slate-700
                dark:bg-slate-900
              "
            >
              {/* Profile Settings */}

              <button
                type="button"
                onClick={() => {
                  navigate("/settings/profile");
                  setOpen(false);
                }}
                className="
                  block
                  w-full
                  px-4
                  py-2.5
                  text-left
                  text-sm
                  text-slate-700
                  transition
                  hover:bg-slate-100
                  dark:text-slate-200
                  dark:hover:bg-slate-800
                "
              >
                <Settings
                  size={18}
                  className="mr-2 inline"
                />

                Profile Settings
              </button>

              {/* Logout */}

              <button
                type="button"
                onClick={() => {
                  handleLogout();
                  setOpen(false);
                }}
                className="
                  block
                  w-full
                  px-4
                  py-2.5
                  text-left
                  text-sm
                  text-red-600
                  transition
                  hover:bg-slate-100
                  dark:hover:bg-slate-800
                "
              >
                <LogOut
                  size={18}
                  className="mr-2 inline"
                />

                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;