import { useNavigate } from "react-router-dom";
import {
  User,
  Lock,
  Users,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

const menus = [
  {
    title: "My Profile",
    description: "View and update your profile",
    icon: User,
    color: "bg-blue-100 text-blue-600",
    path: "/settings/profile",
  },
  {
    title: "Change Password",
    description: "Update your account password",
    icon: Lock,
    color: "bg-red-100 text-red-600",
    path: "/settings/change-password",
  },
  {
    title: "User Management",
    description: "Manage application users",
    icon: Users,
    color: "bg-green-100 text-green-600",
    path: "/settings/users",
  },
  {
    title: "Roles & Permissions",
    description: "Manage roles and permissions",
    icon: ShieldCheck,
    color: "bg-purple-100 text-purple-600",
    path: "/settings/roles",
  },
];

export default function Settings() {
  const navigate = useNavigate();

  return (
    <div className="p-6">

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">
          Settings
        </h1>

        <p className="text-slate-500 mt-2">
          Manage your account and application settings.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">

        {menus.map((item) => {

          const Icon = item.icon;

          return (
            <div
              key={item.title}
              onClick={() => navigate(item.path)}
              className="cursor-pointer rounded-2xl bg-white p-6 shadow hover:shadow-xl transition duration-300 border"
            >

              <div className="flex justify-between items-center">

                <div className="flex gap-4">

                  <div
                    className={`h-14 w-14 rounded-xl flex items-center justify-center ${item.color}`}
                  >
                    <Icon size={28} />
                  </div>

                  <div>

                    <h2 className="font-bold text-lg">
                      {item.title}
                    </h2>

                    <p className="text-gray-500 mt-1">
                      {item.description}
                    </p>

                  </div>

                </div>

                <ChevronRight />

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}