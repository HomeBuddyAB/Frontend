import React, { useState } from "react";
import { User, Eye, EyeOff } from "lucide-react";
import { userService } from "@/services/user.service";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "react-toastify";

const AccountSettings = ({
  email,
  setEmail,
}: {
  email: string;
  setEmail: (v: string) => void;
}) => {
  const { login } = useAuth();
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [currentPasswordForEmail, setCurrentPasswordForEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showCurrentPasswordForEmail, setShowCurrentPasswordForEmail] =
    useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveEmail = async () => {
    if (!newEmail || !newEmail.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!currentPasswordForEmail) {
      toast.error("Current password is required to change email");
      return;
    }

    setIsLoading(true);

    const response = await userService.updateProfile({
      email: newEmail,
      currentPassword: currentPasswordForEmail,
    });

    if (response.error) {
      toast.error(response.error);
      setIsLoading(false);
      return;
    }

    const loginResponse = await login(newEmail, currentPasswordForEmail);

    if (!loginResponse.success) {
      toast.warning(
        "Email updated but auto-login failed. Please log in manually with your new email."
      );
      setIsLoading(false);
      return;
    }
    toast.success("Email updated successfully!");
    setEmail(newEmail);
    setIsEditingEmail(false);
    setCurrentPasswordForEmail("");
    setIsLoading(false);
  };

  const handleSavePassword = async () => {
    if (!currentPassword) {
      toast.error("Current password is required");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("New password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    const response = await userService.updateProfile({
      email: email,
      currentPassword,
      newPassword,
    });

    if (response.error) {
      toast.error(response.error);
      setIsLoading(false);
      return;
    }

    toast.success("Password updated successfully!");
    setIsEditingPassword(false);
    setCurrentPassword("");
    setNewPassword("");
    setIsLoading(false);
  };

  return (
    <div className="p-4 md:p-10 bg-[#2B2B2B] border border-[#423F3E]">
      <div className="flex items-center mb-6 md:mb-10">
        <div className="w-12 h-12 md:w-16 md:h-16 flex items-center justify-center mr-4 md:mr-6 border-2 border-[#423F3E] bg-[#171010]">
          <User
            className="w-6 h-6 md:w-8 md:h-8 text-gray-200"
            strokeWidth={2}
          />
        </div>
        <div>
          <h2 className="text-xl md:text-3xl font-bold text-white tracking-tight">
            Account Settings
          </h2>
          <p className="text-sm md:text-base text-gray-400 mt-1">
            Manage your login credentials
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {/* Email Section */}
        <div>
          <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-widest">
            Email Address
          </label>
          {!isEditingEmail ? (
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="email"
                value={email}
                disabled
                className="flex-1 px-5 py-4 bg-[#171010] text-white placeholder-gray-600 border-2 border-[#423F3E] outline-none font-mono text-sm opacity-70 cursor-not-allowed"
              />
              <button
                onClick={() => {
                  setIsEditingEmail(true);
                  setNewEmail(email);
                }}
                disabled={isLoading}
                className="px-8 py-4 text-white font-bold text-sm tracking-widest uppercase transition-colors hover:bg-white hover:text-black border-2 border-[#423F3E] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Edit
              </button>
            </div>
          ) : (
            <div className="space-y-4 p-6 border border-[#423F3E] bg-[#171010]">
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                disabled={isLoading}
                placeholder="NEW EMAIL ADDRESS"
                className="w-full px-5 py-4 bg-[#0f0a0a] text-white placeholder-gray-600 border-2 border-[#423F3E] focus:border-[#8B4513] outline-none transition-colors font-mono text-sm disabled:opacity-50"
              />
              <div className="relative">
                <input
                  type={showCurrentPasswordForEmail ? "text" : "password"}
                  value={currentPasswordForEmail}
                  onChange={(e) => setCurrentPasswordForEmail(e.target.value)}
                  disabled={isLoading}
                  placeholder="CURRENT PASSWORD (REQUIRED)"
                  className="w-full px-5 py-4 pr-12 bg-[#0f0a0a] text-white placeholder-gray-600 border-2 border-[#423F3E] focus:border-[#8B4513] outline-none transition-colors font-mono text-sm disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowCurrentPasswordForEmail(!showCurrentPasswordForEmail)
                  }
                  disabled={isLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors disabled:opacity-50"
                >
                  {showCurrentPasswordForEmail ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              <div className="flex gap-4 pt-2">
                <button
                  onClick={handleSaveEmail}
                  disabled={isLoading}
                  className="px-8 py-4 text-white font-bold text-sm tracking-widest uppercase transition-all border-2 border-[#362222] hover:bg-[#8B4513] hover:border-[#8B4513] bg-[#362222] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "SAVING..." : "SAVE EMAIL"}
                </button>
                <button
                  onClick={() => {
                    setIsEditingEmail(false);
                    setCurrentPasswordForEmail("");
                  }}
                  disabled={isLoading}
                  className="px-8 py-4 text-white font-bold text-sm tracking-widest uppercase border-2 transition-colors hover:bg-white hover:text-black border-[#423F3E] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Password Section */}
        <div>
          <label className="block text-sm font-bold text-gray-300 mb-3 uppercase tracking-widest">
            Password
          </label>
          {!isEditingPassword ? (
            <button
              onClick={() => setIsEditingPassword(true)}
              disabled={isLoading}
              className="px-8 py-4 w-full text-white font-bold text-sm tracking-widest uppercase transition-colors hover:bg-white hover:text-black border-2 border-[#423F3E] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Change Password
            </button>
          ) : (
            <div className="space-y-4 p-6 border border-[#423F3E] bg-[#171010]">
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  disabled={isLoading}
                  placeholder="CURRENT PASSWORD"
                  className="w-full px-5 py-4 pr-12 bg-[#0f0a0a] text-white placeholder-gray-600 border-2 border-[#423F3E] focus:border-[#8B4513] outline-none transition-colors font-mono text-sm disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  disabled={isLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors disabled:opacity-50"
                >
                  {showCurrentPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={isLoading}
                  placeholder="NEW PASSWORD (MIN. 8 CHARACTERS)"
                  className="w-full px-5 py-4 pr-12 bg-[#0f0a0a] text-white placeholder-gray-600 border-2 border-[#423F3E] focus:border-[#8B4513] outline-none transition-colors font-mono text-sm disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  disabled={isLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200 transition-colors disabled:opacity-50"
                >
                  {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              <div className="flex flex-col md:flex-row gap-4 pt-2">
                <button
                  onClick={handleSavePassword}
                  disabled={isLoading}
                  className="px-8 py-4 text-white font-bold text-sm tracking-widest uppercase transition-all border-2 border-[#362222] hover:bg-[#8B4513] hover:border-[#8B4513] bg-[#362222] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? "SAVING..." : "SAVE PASSWORD"}
                </button>
                <button
                  onClick={() => {
                    setIsEditingPassword(false);
                    setCurrentPassword("");
                    setNewPassword("");
                  }}
                  disabled={isLoading}
                  className="px-8 py-4 text-white font-bold text-sm tracking-widest uppercase border-2 transition-colors hover:bg-white hover:text-black border-[#423F3E] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
