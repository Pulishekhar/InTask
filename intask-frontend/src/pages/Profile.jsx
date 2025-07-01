import React from "react";
import { useAuth } from "../context/AuthContext";
import { UserCircle } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-xl mx-auto mt-10 bg-white p-6 rounded shadow">
      <div className="flex items-center gap-3 mb-6">
        <UserCircle size={40} className="text-indigo-600" />
        <h1 className="text-2xl font-bold">Profile Details</h1>
      </div>

      <div className="space-y-3 text-gray-700 text-lg">
        <p>
          <strong>Name:</strong> {user?.name}
        </p>
        <p>
          <strong>Email:</strong> {user?.email}
        </p>
        <p>
          <strong>Role:</strong> {user?.role}
        </p>
      </div>
    </div>
  );
};

export default Profile;
