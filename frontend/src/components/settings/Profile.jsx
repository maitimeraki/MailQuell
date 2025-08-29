import React, { useState, useRef } from "react";
import { useProfile } from "@/hooks/useProfile";

export default function Profile() {
  const { profile, loading, error, refresh } = useProfile();
  const [name, setName] = useState(profile?.name || "");
  const [timezone, setTimezone] = useState(Intl.DateTimeFormat().resolvedOptions().timeZone);
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(profile?.avatarUrl || "");
  const [message, setMessage] = useState("");
  const fileRef = useRef(null);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">Error: {error}</div>;
  if (!profile) return <div className="p-8">No profile.</div>

  function onFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("timezone", timezone);
      if (fileRef.current?.files?.[0]) {
        formData.append("avatar", fileRef.current.files[0]);
        console.log(fileRef.current?.files);
      }
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/settings/profile`, {
        method: "PATCH",
        credentials: "include",
        body: formData
      });
      if (!res.ok) throw new Error("Update failed");
      setMessage("Saved");
      await refresh?.();
    } catch (err) {
      setMessage(err.message || "Error");
    } finally {
      setSaving(false);
      setTimeout(() => setMessage(""), 3000);
    }
  }

  return (
    <div className="p-8 max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">Profile</h1>
      <form onSubmit={handleSubmit} className="space-y-8">
        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-600 tracking-wider mb-4">BASIC INFO</h2>
            <div className="flex flex-col sm:flex-row gap-6">
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full ring-2 ring-blue-500/30 overflow-hidden bg-slate-100 flex items-center justify-center">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="avatar preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <i className="fa-solid fa-user text-slate-400 text-3xl" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()} 
                    //  When the user clicks this custom element, the onClick handler triggers the hidden file input's click() method, opening the file selection dialog without directly exposing the native input element to the user.
                    className="absolute -bottom-2 -right-2 bg-blue-600 hover:bg-blue-500 text-white text-xs px-2 py-1 rounded-md shadow"
                  >
                    Change
                  </button>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onFileChange}
                  />
                </div>
                <p className="text-[11px] text-slate-500">PNG/JPG up to 2MB</p>
              </div>
              <div className="flex-1 grid gap-5">
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium text-slate-700">Name</label>
                  <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-10 rounded-md border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Your name"
                  />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <input
                    value={profile.email}
                    disabled
                    className="h-10 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500"
                  />
                </div>
                <div className="grid gap-1.5">
                  <label className="text-sm font-medium text-slate-700">Timezone</label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="h-10 rounded-md border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {timezones.map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-slate-600 tracking-wider">PREFERENCES</h2>
          <div className="flex items-center gap-3">
            <input id="dailyDigest" type="checkbox" className="h-4 w-4"
              onChange={() => {}} disabled />
            <label htmlFor="dailyDigest" className="text-sm text-slate-700">
              Daily email digest (coming soon)
            </label>
          </div>
          <div className="flex items-center gap-3">
            <input id="alerts" type="checkbox" className="h-4 w-4"
              onChange={() => {}} disabled />
            <label htmlFor="alerts" className="text-sm text-slate-700">
              Processing failure alerts (coming soon)
            </label>
          </div>
        </section>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium px-5 h-10 rounded-md shadow-sm"
          >
            {saving && <i className="fa-solid fa-spinner fa-spin" />}
            Save Changes
          </button>
          {message && (
            <span
              className={
                "text-sm " +
                (message === "Saved" ? "text-green-600" : "text-red-600")
              }
            >
              {message}
            </span>
          )}
        </div>
      </form>
    </div>
  );
}

// Minimal timezone list (extend if needed)
const timezones = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Tokyo",
  "Australia/Sydney"
];