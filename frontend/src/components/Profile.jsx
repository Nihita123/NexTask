import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";

import {
  ChevronLeft,
  Lock,
  LogOut,
  Save,
  Shield,
  UserCircle,
  User,
  Mail,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_URL = "http://localhost:5000";

const personalFields = [
  { name: "name", type: "text", placeholder: "Full Name", icon: User },
  { name: "email", type: "email", placeholder: "Email", icon: Mail },
];

const securityFields = [
  { name: "current", placeholder: "Current Password" },
  { name: "new", placeholder: "New Password" },
  { name: "confirm", placeholder: "Confirm Password" },
];

const Profile = ({ setCurrentUser, onLogout }) => {
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios
      .get(`${API_URL}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => {
        if (data.success) {
          setProfile({ name: data.user.name, email: data.user.email });
        } else {
          toast.error(data.message);
        }
      })
      .catch(() => toast.error("UNABLE TO LOAD PROFILE"));
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(
        `${API_URL}/api/user/profile`,
        {
          name: profile.name,
          email: profile.email,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setCurrentUser((prev) => ({
          ...prev,
          name: profile.name,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            profile.name
          )}&background=random`,
        }));
        toast.success("Profile updated successfully!");
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Profile update failed");
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      return toast.error("Passwords don't match");
    }
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(
        `${API_URL}/api/user/password`,
        {
          currentPassword: passwords.current,
          newPassword: passwords.new,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success("Password changed successfully!");
        setPasswords({ current: "", new: "", confirm: "" });
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Password change failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-pink-100">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />
      <div className="max-w-4xl mx-auto p-4 md:p-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-pink-500 mb-6 md:mb-8 transition-colors duration-200 font-medium"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Dashboard
        </button>

        <div className="flex items-center gap-4 mb-6 md:mb-8">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-pink-400 to-pink-500 flex items-center justify-center text-white text-lg md:text-2xl font-bold shadow-md">
            {profile.name ? profile.name[0].toUpperCase() : "U"}
          </div>
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
              Account Settings
            </h1>
            <p className="text-sm text-gray-500 truncate">
              Manage your profile and security settings
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:gap-8 lg:grid-cols-2">
          {/* Personal Information Section */}
          <section className="bg-white rounded-xl shadow-sm border border-pink-100 p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4 md:mb-6">
              <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                <UserCircle className="text-pink-500 w-5 h-5" />
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                Personal Information
              </h2>
            </div>

            <form onSubmit={saveProfile} className="space-y-4">
              {personalFields.map(({ name, type, placeholder, icon: Icon }) => (
                <div
                  key={name}
                  className="flex items-center border border-pink-200 rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-pink-400 focus-within:border-pink-400 transition-all duration-200"
                >
                  <Icon className="text-pink-400 w-5 h-5 mr-2 shrink-0" />
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={profile[name] ?? ""}
                    onChange={(e) =>
                      setProfile({ ...profile, [name]: e.target.value })
                    }
                    className="w-full focus:outline-none text-sm text-gray-700"
                    required
                  />
                </div>
              ))}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-400 to-pink-300 text-white py-2.5 rounded-lg hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 text-sm font-semibold"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </form>
          </section>

          {/* Security Section */}
          <section className="bg-white rounded-xl shadow-sm border border-pink-100 p-4 md:p-6">
            <div className="flex items-center gap-2 mb-4 md:mb-6">
              <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                <Shield className="text-pink-500 w-5 h-5" />
              </div>
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                Security
              </h2>
            </div>

            <form onSubmit={changePassword} className="space-y-4">
              {securityFields.map(({ name, placeholder }) => (
                <div
                  key={name}
                  className="flex items-center border border-pink-200 rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-pink-400 focus-within:border-pink-400 transition-all duration-200"
                >
                  <Lock className="text-pink-400 w-5 h-5 mr-2 shrink-0" />
                  <input
                    type="password"
                    placeholder={placeholder}
                    value={passwords[name] ?? ""}
                    onChange={(e) =>
                      setPasswords({ ...passwords, [name]: e.target.value })
                    }
                    className="w-full focus:outline-none text-sm text-gray-700"
                    required
                  />
                </div>
              ))}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-400 to-pink-300 text-white py-2.5 rounded-lg hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 text-sm font-semibold"
              >
                <Shield className="w-4 h-4" />
                Change Password
              </button>

              {/* Danger Zone */}
              <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-pink-100">
                <h3 className="text-red-600 font-semibold mb-4 flex items-center gap-2 text-sm md:text-base">
                  <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center">
                    <LogOut className="w-4 h-4 text-red-500" />
                  </div>
                  Danger Zone
                </h3>
                <button
                  type="button"
                  className="w-full text-red-600 border border-red-200 py-2.5 rounded-lg hover:bg-red-50 transition-colors duration-200 text-sm font-medium"
                  onClick={onLogout}
                >
                  Logout from Account
                </button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;
