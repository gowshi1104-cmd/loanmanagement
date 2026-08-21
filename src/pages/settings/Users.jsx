import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Pencil, Trash2, Plus, Search, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { getUsers, deleteUser } from "../../services/userService";
import DeleteModal from "../../components/common/DeleteModal";

const Users = () => {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  const loadUsers = async () => {
    try {
      const res = await getUsers();
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    const value = search.toLowerCase();
    setFilteredUsers(
      users.filter(
        (u) =>
          u.fullName?.toLowerCase().includes(value) ||
          u.username?.toLowerCase().includes(value) ||
          u.email?.toLowerCase().includes(value) ||
          u.role?.roleName?.toLowerCase().includes(value)
      )
    );
  }, [search, users]);

  const handleDelete = async () => {
    try {
      await deleteUser(selectedUserId);

      setUsers((prev) => prev.filter((u) => u.id !== selectedUserId));
      setFilteredUsers((prev) => prev.filter((u) => u.id !== selectedUserId));

      toast.success("User deleted successfully");

      setIsDeleteOpen(false);
      setSelectedUserId(null);
    } catch (err) {
      console.error("Delete User Error:", err);

      let message = "Delete failed";

      if (err.response?.status === 401) {
        message = "Unauthorized";
      } else if (err.response?.status === 403) {
        message = "Access Denied";
      } else if (err.response?.status === 404) {
        message = "User Not Found";
      } else if (err.response?.data?.message) {
        message = err.response.data.message;
      } else if (typeof err.response?.data === "string") {
        message = err.response.data;
      }

      toast.error(message);

      setIsDeleteOpen(false);
      setSelectedUserId(null);
    }
  };

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="relative">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, username, email or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border rounded-lg pl-10 pr-4 py-2 w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          onClick={() => navigate("/settings/users/add")}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg transition"
        >
          <Plus size={18} />
          Add User
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow overflow-hidden mt-6">
        <table className="w-full">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left p-4">S.No</th>
              <th className="text-left p-4">Full Name</th>
              <th className="text-left p-4">Username</th>
              <th className="text-left p-4">Email</th>
              <th className="text-left p-4">Role</th>
              <th className="text-center p-4">Status</th>
              <th className="text-center p-4">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center py-8 text-gray-500">
                  No users found.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user, index) => (
                <tr key={user.id} className="border-t hover:bg-slate-50">
                  {/* 🔥 Serial number plain format */}
                  <td className="p-4 font-semibold text-gray-700">
                    {index + 1}
                  </td>

                  <td className="p-4 font-medium">{user.fullName}</td>
                  <td className="p-4">{user.username}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">{user.role?.roleName}</td>

                  <td className="p-4 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        user.enabled
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.enabled ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => navigate(`/settings/users/${user.id}`)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View User"
                      >
                        <Eye size={18} />
                      </button>

                      <button
                        onClick={() =>
                          navigate(`/settings/users/${user.id}/edit`)
                        }
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit User"
                      >
                        <Pencil size={18} />
                      </button>

                      <button
                        onClick={() => {
                          setSelectedUserId(user.id);
                          setIsDeleteOpen(true);
                        }}
                        className="text-red-600 hover:text-red-800"
                        title="Delete User"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Modal */}
      <DeleteModal
        isOpen={isDeleteOpen}
        title="Delete User"
        message="Are you sure you want to delete this user?"
        onClose={() => {
          setIsDeleteOpen(false);
          setSelectedUserId(null);
        }}
        onConfirm={handleDelete}
      />
    </div>
  );
};

export default Users;
