import {
  createContext,
  useEffect,
  useState,
  useCallback,
} from "react";

import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();

// =========================================================
// SESSION TIMEOUT
// =========================================================

// 20 minutes
const SESSION_TIMEOUT = 20 * 60 * 1000;

// =========================================================
// NORMALIZE ROLE
// =========================================================

const normalizeRole = (value) => {
  if (!value) {
    return "";
  }

  return String(value)
    .toUpperCase()
    .replace(/^ROLE_/, "")
    .trim();
};

// =========================================================
// NORMALIZE USER
// =========================================================

const normalizeUser = (data) => {
  if (!data) {
    return null;
  }

  const source =
    data.user ||
    data.data ||
    data;

  const role = normalizeRole(
    source.role ||
      source.roleName ||
      source.userRole ||
      source?.role?.roleName ||
      source?.role?.name
  );

  const permissions =
    Array.isArray(source.permissions)
      ? source.permissions
      : [];

  // =======================================================
  // CUSTOMER / MEMBER ID
  // =======================================================

  const customerId =
    source.customerId ||
    source.memberId ||
    source.customer_id ||
    source.member_id ||
    "";

  return {
    token:
      source.token ||
      source.accessToken ||
      "",

    username:
      source.username ||
      source.userName ||
      "",

    fullName:
      source.fullName ||
      source.name ||
      "",

    role,

    permissions,

    customerId,
  };
};

// =========================================================
// JWT VALIDATION
// =========================================================

const isTokenValid = (token) => {
  if (!token) {
    return false;
  }

  try {
    const decoded = jwtDecode(token);

    if (decoded.exp) {
      const expiryTime =
        decoded.exp * 1000;

      if (Date.now() >= expiryTime) {
        return false;
      }
    }

    return true;

  } catch (error) {
    console.error(
      "Invalid JWT token:",
      error
    );

    return false;
  }
};

// =========================================================
// AUTH PROVIDER
// =========================================================

const AuthProvider = ({ children }) => {
  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [rememberMe, setRememberMe] =
    useState(false);

  // =======================================================
  // GET ACTIVE STORAGE
  // =======================================================

  const getActiveStorage = useCallback(() => {
    const rememberMeValue =
      localStorage.getItem("rememberMe");

    if (rememberMeValue === "true") {
      return localStorage;
    }

    return sessionStorage;
  }, []);

  // =======================================================
  // CLEAR SESSION
  // =======================================================

  const clearSession = useCallback(() => {
    console.log(
      "Session expired / logged out"
    );

    // =====================================================
    // SESSION STORAGE
    // =====================================================

    sessionStorage.removeItem("token");

    sessionStorage.removeItem("username");

    sessionStorage.removeItem("fullName");

    sessionStorage.removeItem("role");

    sessionStorage.removeItem("permissions");

    sessionStorage.removeItem("lastActivity");

    sessionStorage.removeItem("customerId");

    sessionStorage.removeItem("memberId");

    sessionStorage.removeItem("rememberMe");

    // =====================================================
    // LOCAL STORAGE
    // =====================================================

    localStorage.removeItem("token");

    localStorage.removeItem("username");

    localStorage.removeItem("fullName");

    localStorage.removeItem("role");

    localStorage.removeItem("userRole");

    localStorage.removeItem("permissions");

    localStorage.removeItem("lastActivity");

    localStorage.removeItem("customerId");

    localStorage.removeItem("memberId");

    localStorage.removeItem("rememberMe");

    setRememberMe(false);

    setUser(null);
  }, []);

  // =======================================================
  // UPDATE LAST ACTIVITY
  // =======================================================

  const updateActivity = useCallback(() => {
    const storage =
      getActiveStorage();

    if (
      !storage.getItem("token")
    ) {
      return;
    }

    storage.setItem(
      "lastActivity",
      Date.now().toString()
    );
  }, [getActiveStorage]);

  // =======================================================
  // RESTORE LOGIN SESSION
  // =======================================================

  useEffect(() => {
    try {
      // ---------------------------------------------------
      // CHECK REMEMBER ME LOGIN FIRST
      // ---------------------------------------------------

      const rememberMeValue =
        localStorage.getItem(
          "rememberMe"
        );

      const storage =
        rememberMeValue === "true"
          ? localStorage
          : sessionStorage;

      const token =
        storage.getItem("token");

      // ---------------------------------------------------
      // NO TOKEN
      // ---------------------------------------------------

      if (!token) {
        setUser(null);

        setRememberMe(false);

        setLoading(false);

        return;
      }

      // ---------------------------------------------------
      // CHECK JWT EXPIRATION
      // ---------------------------------------------------

      if (!isTokenValid(token)) {
        console.log(
          "JWT expired"
        );

        clearSession();

        setLoading(false);

        return;
      }

      // ---------------------------------------------------
      // CHECK 20 MINUTE INACTIVITY
      // ---------------------------------------------------

      const lastActivity =
        Number(
          storage.getItem(
            "lastActivity"
          )
        );

      if (
        lastActivity &&
        Date.now() - lastActivity >=
          SESSION_TIMEOUT
      ) {
        console.log(
          "20 minute session timeout"
        );

        clearSession();

        setLoading(false);

        return;
      }

      // ---------------------------------------------------
      // OLD SESSION WITHOUT ACTIVITY
      // ---------------------------------------------------

      if (!lastActivity) {
        storage.setItem(
          "lastActivity",
          Date.now().toString()
        );
      }

      // ---------------------------------------------------
      // RESTORE STORED VALUES
      // ---------------------------------------------------

      const storedRole =
        storage.getItem(
          "role"
        );

      const storedPermissions =
        storage.getItem(
          "permissions"
        );

      // ===================================================
      // CUSTOMER ID
      // ===================================================

      const storedCustomerId =
        storage.getItem(
          "customerId"
        );

      const storedMemberId =
        storage.getItem(
          "memberId"
        );

      const restoredCustomerId =
        storedCustomerId ||
        storedMemberId ||
        "";

      // ---------------------------------------------------
      // RESTORE USER
      // ---------------------------------------------------

      const userData = {
        token,

        username:
          storage.getItem(
            "username"
          ) || "",

        fullName:
          storage.getItem(
            "fullName"
          ) || "",

        role:
          normalizeRole(
            storedRole
          ),

        permissions:
          storedPermissions
            ? JSON.parse(
                storedPermissions
              )
            : [],

        customerId:
          restoredCustomerId,
      };

      console.log(
        "================================"
      );

      console.log(
        "RESTORED AUTH USER:"
      );

      console.log(
        "Username:",
        userData.username
      );

      console.log(
        "Full Name:",
        userData.fullName
      );

      console.log(
        "Role:",
        userData.role
      );

      console.log(
        "Permissions:",
        userData.permissions
      );

      console.log(
        "Customer ID:",
        userData.customerId
      );

      console.log(
        "Remember Me:",
        rememberMeValue === "true"
      );

      console.log(
        "================================"
      );

      setRememberMe(
        rememberMeValue === "true"
      );

      setUser(userData);

    } catch (error) {
      console.error(
        "Failed to restore auth session:",
        error
      );

      clearSession();

    } finally {
      setLoading(false);
    }
  }, [clearSession]);

  // =======================================================
  // AUTO LOGOUT TIMER
  // =======================================================

  useEffect(() => {
    if (!user) {
      return;
    }

    const checkSession = () => {
      const storage =
        getActiveStorage();

      const token =
        storage.getItem(
          "token"
        );

      if (!token) {
        clearSession();

        return;
      }

      // ---------------------------------------------------
      // JWT EXPIRATION CHECK
      // ---------------------------------------------------

      if (!isTokenValid(token)) {
        console.log(
          "JWT expired"
        );

        clearSession();

        return;
      }

      // ---------------------------------------------------
      // INACTIVITY CHECK
      // ---------------------------------------------------

      const lastActivity =
        Number(
          storage.getItem(
            "lastActivity"
          )
        );

      if (
        lastActivity &&
        Date.now() - lastActivity >=
          SESSION_TIMEOUT
      ) {
        console.log(
          "20 minute inactivity timeout"
        );

        clearSession();

        return;
      }
    };

    // Check every 10 seconds
    const interval =
      setInterval(
        checkSession,
        10 * 1000
      );

    return () => {
      clearInterval(interval);
    };

  }, [
    user,
    clearSession,
    getActiveStorage,
  ]);

  // =======================================================
  // USER ACTIVITY LISTENER
  // =======================================================

  useEffect(() => {
    if (!user) {
      return;
    }

    let lastUpdate = 0;

    const handleActivity = () => {
      const now =
        Date.now();

      // Avoid writing to storage
      // on every mouse movement

      if (
        now - lastUpdate <
        5000
      ) {
        return;
      }

      lastUpdate = now;

      updateActivity();
    };

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      window.addEventListener(
        event,
        handleActivity
      );
    });

    return () => {
      events.forEach((event) => {
        window.removeEventListener(
          event,
          handleActivity
        );
      });
    };

  }, [user, updateActivity]);

  // =======================================================
  // LOGIN
  // =======================================================

  const login = (
    data,
    shouldRememberMe = false
  ) => {
    console.log(
      "================================"
    );

    console.log(
      "RAW LOGIN RESPONSE:"
    );

    console.log(data);

    const userData =
      normalizeUser(data);

    console.log(
      "NORMALIZED LOGIN USER:"
    );

    console.log(
      "Username:",
      userData.username
    );

    console.log(
      "Full Name:",
      userData.fullName
    );

    console.log(
      "Role:",
      userData.role
    );

    console.log(
      "Permissions:",
      userData.permissions
    );

    console.log(
      "Customer ID:",
      userData.customerId
    );

    console.log(
      "Remember Me:",
      shouldRememberMe
    );

    console.log(
      "================================"
    );

    // -----------------------------------------------------
    // CLEAR OLD AUTH DATA FIRST
    // -----------------------------------------------------

    sessionStorage.removeItem("token");
    sessionStorage.removeItem("username");
    sessionStorage.removeItem("fullName");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("permissions");
    sessionStorage.removeItem("lastActivity");
    sessionStorage.removeItem("customerId");
    sessionStorage.removeItem("memberId");

    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("fullName");
    localStorage.removeItem("role");
    localStorage.removeItem("userRole");
    localStorage.removeItem("permissions");
    localStorage.removeItem("lastActivity");
    localStorage.removeItem("customerId");
    localStorage.removeItem("memberId");
    localStorage.removeItem("rememberMe");

    // -----------------------------------------------------
    // SELECT STORAGE
    // -----------------------------------------------------

    const storage =
      shouldRememberMe
        ? localStorage
        : sessionStorage;

    // -----------------------------------------------------
    // SAVE AUTH DATA
    // -----------------------------------------------------

    storage.setItem(
      "token",
      userData.token
    );

    storage.setItem(
      "username",
      userData.username
    );

    storage.setItem(
      "fullName",
      userData.fullName
    );

    storage.setItem(
      "role",
      userData.role
    );

    storage.setItem(
      "permissions",
      JSON.stringify(
        userData.permissions
      )
    );

    // =====================================================
    // SAVE CUSTOMER ID
    // =====================================================

    if (userData.customerId) {
      storage.setItem(
        "customerId",
        String(
          userData.customerId
        )
      );
    } else {
      storage.removeItem(
        "customerId"
      );
    }

    // -----------------------------------------------------
    // START 20 MINUTE ACTIVITY TIMER
    // -----------------------------------------------------

    storage.setItem(
      "lastActivity",
      Date.now().toString()
    );

    // -----------------------------------------------------
    // SAVE REMEMBER ME FLAG
    // -----------------------------------------------------

    if (shouldRememberMe) {
      localStorage.setItem(
        "rememberMe",
        "true"
      );
    }

    // -----------------------------------------------------
    // UPDATE STATE
    // -----------------------------------------------------

    setRememberMe(
      shouldRememberMe
    );

    setUser(userData);
  };

  // =======================================================
  // LOGOUT
  // =======================================================

  const logout = () => {
    console.log(
      "Logging out user:",
      user?.username
    );

    clearSession();
  };

  // =======================================================
  // PROVIDER
  // =======================================================

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        rememberMe,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;