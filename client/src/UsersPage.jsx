import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchAllUsers,
  fetchUser,
  deleteUserById,
  logoutUserById,
  permanentDeleteUserById,
  recoverUserById,
} from "./api/userApi";
import ConfirmDeleteModal from "./components/ConfirmDeleteModel";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [userName, setUserName] = useState("Guest User");
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState("User");

  const [selectedUser, setSelectedUser] = useState(null);
  const [permanentMode, setPermanentMode] = useState(false);
  const [recoverMode, setRecoverMode] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
    fetchCurrentUser();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await fetchAllUsers();
      setUsers(data);
      console.log("✅ Users fetched successfully:", data);
    } catch (err) {
      console.error("❌ Fetching users failed:", err);
      if (err.response?.status === 403) navigate("/");
      else if (err.response?.status === 401) navigate("/login");
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const data = await fetchUser();
      setUserName(data.name);
      setUserEmail(data.email);
      setUserRole(data.role);
    } catch (err) {
      console.error("❌ Fetching current user failed:", err);
      if (err.response?.status === 401) navigate("/login");
    }
  };

  const logoutUser = async (user) => {
    const confirmed = confirm(`You are about to logout ${user.email}`);
    if (!confirmed) return;
    try {
      await logoutUserById(user.id);
      fetchUsers();
    } catch (err) {
      console.error("❌ Logout error:", err);
    }
  };

  const handleSoftDelete = (user) => {
    setSelectedUser(user);
    setPermanentMode(false);
    setRecoverMode(false);
  };

  const handlePermanentDelete = (user) => {
    setSelectedUser(user);
    setPermanentMode(true);
    setRecoverMode(false);
  };

  const handleRecover = (user) => {
    setSelectedUser(user);
    setRecoverMode(true);
    setPermanentMode(false);
  };

  const confirmAction = async (user) => {
    try {
      if (recoverMode) {
        await recoverUserById(user.id);
      } else if (permanentMode) {
        await permanentDeleteUserById(user.id);
      } else {
        await deleteUserById(user.id);
      }
      fetchUsers();
    } catch (err) {
      console.error("❌ Action error:", err);
    } finally {
      setSelectedUser(null);
      setPermanentMode(false);
      setRecoverMode(false);
    }
  };

  const cancelDelete = () => {
    setSelectedUser(null);
    setPermanentMode(false);
    setRecoverMode(false);
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 px-4">
      <h1 className="text-3xl font-bold mb-4">All Users</h1>
      <p className="mb-4">
        <b>{userName}</b> <i>({userRole})</i>
      </p>

      <table className="w-full border border-gray-300">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Email</th>
            <th className="p-2 text-left">Status</th>
            <th className="p-2 text-left">Logout</th>
            {(userRole === "Admin" || userRole === "Owner") && (
              <>
                <th className="p-2 text-left">Delete</th>
                <th className="p-2 text-left">Permanent Delete</th>
              </>
            )}
            {userRole === "Owner" && (
              <th className="p-2 text-left">Recover User</th>
            )}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-t">
              <td className="p-2">{user.name}</td>
              <td className="p-2">{user.email}</td>
              <td className="p-2">
                {user.isLoggedIn ? "Logged In" : "Logged Out"}
              </td>
              <td className="p-2">
                <button
                  onClick={() => logoutUser(user)}
                  disabled={!user.isLoggedIn}
                  className={`px-3 py-1 rounded text-white text-sm ${
                    user.isLoggedIn
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  Logout
                </button>
              </td>

              {(userRole === "Admin" || userRole === "Owner") && (
                <>
                  <td className="p-2">
                    <button
                      onClick={() => handleSoftDelete(user)}
                      disabled={user.email === userEmail}
                      className={`px-3 py-1 text-sm text-white rounded ${
                        user.email === userEmail
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-yellow-500 hover:bg-yellow-600"
                      }`}
                    >
                      Delete
                    </button>
                  </td>
                  <td className="p-2">
                    <button
                      onClick={() => handlePermanentDelete(user)}
                      disabled={user.email === userEmail}
                      className={`px-3 py-1 text-sm text-white rounded ${
                        user.email === userEmail
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-red-700 hover:bg-red-800"
                      }`}
                    >
                      Permanent Delete
                    </button>
                  </td>
                  {userRole === "Owner" && (
                    <td className="p-2">
                      <button
                        onClick={() => handleRecover(user)}
                        disabled={user.email === userEmail}
                        className={`px-3 py-1 text-sm text-white rounded ${
                          user.email === userEmail
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-green-700 hover:bg-green-800"
                        }`}
                      >
                        Recover User
                      </button>
                    </td>
                  )}
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {selectedUser && (
        <ConfirmDeleteModal
          item={selectedUser}
          onConfirm={confirmAction}
          onCancel={cancelDelete}
          isPermanent={permanentMode}
          isRecover={recoverMode}
          type="user"
        />
      )}
    </div>
  );
}
