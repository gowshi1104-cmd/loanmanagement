import { NavLink } from "react-router-dom";
import { navigation } from "../../constants/navigation";
import { useSidebar } from "../../context/SidebarContext";
import { hasPermission } from "../../utils/auth";

const Sidebar = () => {
  const { collapsed } = useSidebar();

  return (
    <aside
      className={`bg-slate-900 text-white transition-all duration-300 ${
        collapsed ? "w-20" : "w-64"
      }`}
    >
      <div className="h-16 flex items-center justify-center border-b border-slate-700">
        <h1 className="text-xl font-bold">
          {collapsed ? "LMS" : "Loan MS"}
        </h1>
      </div>

      <nav className="p-3 space-y-2">
        {navigation
          .filter((item) => hasPermission(item.permission))
          .map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-3 transition-colors ${
                    isActive
                      ? "bg-blue-600"
                      : "hover:bg-slate-800"
                  }`
                }
              >
                <Icon size={20} />

                {!collapsed && (
                  <span className="font-medium">
                    {item.title}
                  </span>
                )}
              </NavLink>
            );
          })}
      </nav>
    </aside>
  );
};

export default Sidebar;