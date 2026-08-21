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

  const { toggleSidebar } = useSidebar();

  const { user, logout } =
    useContext(AuthContext);

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

  const [notifications, setNotifications] =
    useState([]);

  const [unreadCount, setUnreadCount] =
    useState(0);

  const [notificationLoading, setNotificationLoading] =
    useState(false);

  // =====================================================
  // REFS
  // =====================================================

  const dropdownRef =
    useRef(null);

  const notificationRef =
    useRef(null);

  // =====================================================
  // USER DETAILS
  // =====================================================

  const fullName =
    user?.fullName || "User";

  const role =
    user?.role || "USER";

  // =====================================================
  // CURRENT DATE
  // =====================================================

  const today =
    new Date().toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }
    );

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

      const response =
        await getNotifications();

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

      const response =
        await getUnreadCount();

      setUnreadCount(
        Number(response.data) || 0
      );

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
  //
  // Every 10 seconds
  // =====================================================

  useEffect(() => {

    if (!user) {
      return;
    }

    const interval =
      setInterval(() => {

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

    const handleClickOutside =
      (event) => {

        if (
          dropdownRef.current &&
          !dropdownRef.current.contains(
            event.target
          )
        ) {
          setOpen(false);
        }

        if (
          notificationRef.current &&
          !notificationRef.current.contains(
            event.target
          )
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
  // OPEN NOTIFICATIONS
  // =====================================================

  const handleNotificationToggle =
    async () => {

      setNotificationOpen(
        (previous) => !previous
      );

      setOpen(false);

      await loadNotifications();
      await loadUnreadCount();
    };

  // =====================================================
  // MARK ONE AS READ
  // =====================================================

  const handleNotificationClick =
    async (notification) => {

      if (!notification?.id) {
        return;
      }

      try {

        if (!notification.read) {

          await markNotificationAsRead(
            notification.id
          );

          setNotifications(
            (previous) =>
              previous.map(
                (item) =>
                  item.id === notification.id
                    ? {
                        ...item,
                        read: true,
                      }
                    : item
              )
          );

          setUnreadCount(
            (previous) =>
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

  const handleMarkAllRead =
    async () => {

      try {

        setNotificationLoading(true);

        await markAllNotificationsAsRead();

        setNotifications(
          (previous) =>
            previous.map(
              (notification) => ({
                ...notification,
                read: true,
              })
            )
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

  const formatNotificationTime =
    (dateValue) => {

      if (!dateValue) {
        return "";
      }

      const date =
        new Date(dateValue);

      if (Number.isNaN(date.getTime())) {
        return "";
      }

      return date.toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    };

  // =====================================================
  // NOTIFICATION ICON TYPE
  // =====================================================

  const getNotificationIcon =
    (type) => {

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
    <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6">

      {/* =================================================
          LEFT
      ================================================= */}

      <div className="flex items-center gap-6">

        {/* Sidebar Toggle */}

        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-100 transition"
        >
          <Menu size={24} />
        </button>

        {/* Title */}

        <div>

          <h2 className="text-xl font-semibold">
            Loan Management System
          </h2>

          <p className="text-sm text-gray-500">
            {today}
          </p>

        </div>

      </div>

      {/* =================================================
          RIGHT
      ================================================= */}

      <div className="flex items-center gap-6">

        {/* =================================================
            NOTIFICATION
        ================================================= */}

        <div
          className="relative"
          ref={notificationRef}
        >

          <button
            onClick={
              handleNotificationToggle
            }
            className="relative p-2 rounded-lg hover:bg-slate-100 transition"
            title="Notifications"
          >

            <Bell size={22} />

            {/* Unread Badge */}

            {unreadCount > 0 && (

              <span
                className="
                  absolute
                  -top-1
                  -right-1
                  min-w-[18px]
                  h-[18px]
                  px-1
                  bg-red-500
                  text-white
                  text-[10px]
                  font-bold
                  rounded-full
                  flex
                  items-center
                  justify-center
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
                absolute
                right-0
                mt-3
                w-[380px]
                bg-white
                border
                border-slate-200
                rounded-xl
                shadow-xl
                z-[100]
                overflow-hidden
              "
            >

              {/* Header */}

              <div
                className="
                  flex
                  items-center
                  justify-between
                  px-4
                  py-3
                  border-b
                  bg-slate-50
                "
              >

                <div>

                  <h3 className="font-semibold text-slate-800">
                    Notifications
                  </h3>

                  <p className="text-xs text-slate-500">
                    {unreadCount} unread
                  </p>

                </div>

                {unreadCount > 0 && (

                  <button
                    onClick={
                      handleMarkAllRead
                    }
                    disabled={
                      notificationLoading
                    }
                    className="
                      text-xs
                      text-blue-600
                      hover:text-blue-800
                      flex
                      items-center
                      gap-1
                    "
                  >
                    <CheckCheck size={15} />
                    Mark all read
                  </button>

                )}

              </div>

              {/* Notification List */}

              <div className="max-h-[420px] overflow-y-auto">

                {notifications.length === 0 ? (

                  <div
                    className="
                      px-6
                      py-10
                      text-center
                      text-sm
                      text-slate-500
                    "
                  >

                    <Bell
                      size={32}
                      className="
                        mx-auto
                        mb-3
                        text-slate-300
                      "
                    />

                    No notifications

                  </div>

                ) : (

                  notifications.map(
                    (notification) => (

                      <button
                        key={notification.id}
                        onClick={() =>
                          handleNotificationClick(
                            notification
                          )
                        }
                        className={`
                          w-full
                          text-left
                          px-4
                          py-3
                          border-b
                          border-slate-100
                          transition
                          hover:bg-slate-50
                          ${
                            notification.read
                              ? "bg-white"
                              : "bg-blue-50"
                          }
                        `}
                      >

                        <div className="flex gap-3">

                          {/* Icon */}

                          <div
                            className="
                              w-9
                              h-9
                              rounded-full
                              bg-white
                              border
                              flex
                              items-center
                              justify-center
                              shrink-0
                            "
                          >
                            {getNotificationIcon(
                              notification.type
                            )}
                          </div>

                          {/* Content */}

                          <div className="flex-1 min-w-0">

                            <div className="flex items-start justify-between gap-2">

                              <p
                                className={`
                                  text-sm
                                  ${
                                    notification.read
                                      ? "font-medium text-slate-700"
                                      : "font-semibold text-slate-900"
                                  }
                                `}
                              >
                                {notification.title}
                              </p>

                              {!notification.read && (

                                <span
                                  className="
                                    w-2
                                    h-2
                                    bg-blue-600
                                    rounded-full
                                    shrink-0
                                    mt-1
                                  "
                                />

                              )}

                            </div>

                            <p
                              className="
                                text-xs
                                text-slate-600
                                mt-1
                                leading-5
                              "
                            >
                              {notification.message}
                            </p>

                            <p
                              className="
                                text-[11px]
                                text-slate-400
                                mt-2
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

        {/* =================================================
            PROFILE
        ================================================= */}

        <div
          className="relative"
          ref={dropdownRef}
        >

          <button
            onClick={() =>
              setOpen(!open)
            }
            className="
              flex
              items-center
              gap-3
              px-3
              py-2
              rounded-lg
              hover:bg-slate-100
            "
          >

            <div className="text-right">

              <p className="font-semibold">
                {fullName}
              </p>

              <p className="text-xs text-gray-500">
                {role}
              </p>

            </div>

            <UserCircle
              size={40}
              className="text-blue-600"
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
                mt-2
                w-48
                bg-white
                border
                rounded-lg
                shadow-lg
                z-50
              "
            >

              {/* Profile Settings */}

              <button
                onClick={() => {

                  navigate(
                    "/settings/profile"
                  );

                  setOpen(false);
                }}
                className="
                  block
                  w-full
                  text-left
                  px-4
                  py-2
                  hover:bg-gray-100
                "
              >

                <Settings
                  size={18}
                  className="inline mr-2"
                />

                Profile Settings

              </button>

              {/* Logout */}

              <button
                onClick={() => {

                  handleLogout();

                  setOpen(false);
                }}
                className="
                  block
                  w-full
                  text-left
                  px-4
                  py-2
                  hover:bg-gray-100
                  text-red-600
                "
              >

                <LogOut
                  size={18}
                  className="inline mr-2"
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