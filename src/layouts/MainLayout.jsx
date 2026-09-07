import { Outlet } from "react-router-dom";
import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

const MainLayout = () => {
  return (
    <div
      className="
        flex
        min-h-screen
        w-full
        overflow-x-hidden
        bg-slate-100
        text-slate-900
        transition-colors
        duration-300
        dark:bg-slate-950
        dark:text-white
      "
    >
      {/* =====================================================
          SIDEBAR
          ===================================================== */}

      <Sidebar />

      {/* =====================================================
          MAIN APPLICATION AREA
          ===================================================== */}

      <div
        className="
          flex
          min-w-0
          flex-1
          flex-col
          overflow-x-hidden
        "
      >
        {/* ===================================================
            NAVBAR
            =================================================== */}

        <Navbar />

        {/* ===================================================
            PAGE CONTENT
            =================================================== */}

        <main
          className="
            min-w-0
            flex-1
            overflow-x-hidden
            bg-slate-100
            p-3
            sm:p-4
            md:p-5
            lg:p-6
            xl:p-7
            transition-colors
            duration-300
            dark:bg-slate-950
          "
        >
          <div className="mx-auto w-full max-w-[1600px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;