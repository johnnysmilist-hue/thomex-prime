"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { updateOfficerPhone } from "@/lib/supabaseDeliveryOfficers";
import { fetchStationById, Station } from "@/lib/supabaseStations";
import { useStationOfficer } from "@/context/StationOfficerContext";

export default function StationSettingsPage() {
  const officer = useStationOfficer();
  const [email, setEmail] = useState("");
  const [station, setStation] = useState<Station | null>(null);

  const [phone, setPhone] = useState(officer.phone || "");
  const [savingPhone, setSavingPhone] = useState(false);
  const [phoneSuccess, setPhoneSuccess] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email || ""));
    if (officer.station_id) {
      fetchStationById(officer.station_id).then((r) => setStation(r.data));
    }
  }, [officer.station_id]);

  const handleSavePhone = async () => {
    if (officer.id === "ALL") return;
    setPhoneError("");
    setPhoneSuccess("");
    if (!phone.trim()) {
      setPhoneError("Phone number can't be empty.");
      return;
    }
    setSavingPhone(true);
    const { error } = await updateOfficerPhone(officer.id, phone.trim());
    setSavingPhone(false);
    if (error) {
      setPhoneError("Could not update phone number.");
      return;
    }
    setPhoneSuccess("Phone number updated.");
  };

  const handleChangePassword = async () => {
    setPasswordError("");
    setPasswordSuccess("");
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords don't match.");
      return;
    }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (error) {
      setPasswordError(error.message);
      return;
    }
    setPasswordSuccess("Password updated.");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div>
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
        <h1 className="text-lg font-bold text-black dark:text-white">Settings</h1>
      </div>

      <div className="p-6 max-w-lg space-y-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
          <p className="text-sm font-bold text-black dark:text-white mb-4">Profile</p>

          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Name</label>
          <p className="text-sm text-black dark:text-white mb-4">{officer.name}</p>

          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Login Email</label>
          <p className="text-sm text-black dark:text-white mb-4">{email || "—"}</p>

          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Assigned Station</label>
          <p className="text-sm text-black dark:text-white mb-4">
            {officer.id === "ALL" ? "All Stations (admin)" : station ? station.name + (station.address ? " — " + station.address : "") : "Unassigned"}
          </p>

          {officer.id !== "ALL" && (
            <>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Phone</label>
              <div className="flex gap-2 mb-1">
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="flex-1 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-lg px-3 py-2 text-sm"
                />
                <button onClick={handleSavePhone} disabled={savingPhone} className="bg-brand text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-60">
                  {savingPhone ? "..." : "Save"}
                </button>
              </div>
              {phoneError && <p className="text-xs text-red-500">{phoneError}</p>}
              {phoneSuccess && <p className="text-xs text-green-600 dark:text-green-400">{phoneSuccess}</p>}
            </>
          )}
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5">
          <p className="text-sm font-bold text-black dark:text-white mb-4">Change Password</p>

          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-lg px-3 py-2 text-sm mb-3"
          />

          <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1">Confirm New Password</label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white rounded-lg px-3 py-2 text-sm mb-3"
          />

          {passwordError && <p className="text-xs text-red-500 mb-2">{passwordError}</p>}
          {passwordSuccess && <p className="text-xs text-green-600 dark:text-green-400 mb-2">{passwordSuccess}</p>}

          <button onClick={handleChangePassword} disabled={savingPassword} className="bg-brand text-white text-sm font-semibold px-4 py-2 rounded-lg disabled:opacity-60">
            {savingPassword ? "Updating..." : "Update Password"}
          </button>
        </div>
      </div>
    </div>
  );
}
