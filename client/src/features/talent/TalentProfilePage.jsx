import { useEffect, useState } from "react";
import { api } from "../../lib/api";

const emptyProfile = {
  talentType: "instrumentalist",
  instruments: "",
  bio: "",
  yearsExperience: "0",
  profilePhotoUrl: "",
};

function toForm(profile) {
  return {
    talentType: profile.talentType || "instrumentalist",
    instruments: (profile.instruments || []).join(", "),
    bio: profile.bio || "",
    yearsExperience: String(profile.yearsExperience ?? 0),
    profilePhotoUrl: profile.profilePhotoUrl || "",
  };
}

export function TalentProfilePage() {
  const [form, setForm] = useState(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadProfile() {
      try {
        const response = await api.get("/talent/profile");
        if (response.data.data.profile) setForm(toForm(response.data.data.profile));
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Could not load your profile.");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function saveProfile(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const payload = {
        ...form,
        yearsExperience: Number(form.yearsExperience),
        instruments: form.talentType === "instrumentalist"
          ? form.instruments.split(",").map((instrument) => instrument.trim()).filter(Boolean)
          : [],
      };
      const response = await api.put("/talent/profile", payload);
      setForm(toForm(response.data.data.profile));
      setMessage("Your talent profile has been saved.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="p-6 text-slate-600">Loading profile…</p>;

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <h1 className="text-3xl font-bold text-slate-900">Your talent profile</h1>
      <p className="mt-2 text-slate-600">Tell customers about your experience and the roles you perform.</p>
      <form className="mt-8 space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={saveProfile}>
        <label className="block font-medium text-slate-800">Talent type
          <select className="mt-1 block w-full rounded border border-slate-300 p-2" name="talentType" value={form.talentType} onChange={updateField}>
            <option value="instrumentalist">Instrumentalist</option>
            <option value="backup_vocalist">Backup vocalist</option>
          </select>
        </label>
        {form.talentType === "instrumentalist" && <label className="block font-medium text-slate-800">Instruments
          <input className="mt-1 block w-full rounded border border-slate-300 p-2" name="instruments" value={form.instruments} onChange={updateField} placeholder="For example: Keyboard, Guitar" required />
          <span className="mt-1 block text-sm font-normal text-slate-500">Separate each instrument with a comma.</span>
        </label>}
        <label className="block font-medium text-slate-800">Years of experience
          <input className="mt-1 block w-full rounded border border-slate-300 p-2" type="number" name="yearsExperience" min="0" step="1" value={form.yearsExperience} onChange={updateField} required />
        </label>
        <label className="block font-medium text-slate-800">Bio
          <textarea className="mt-1 block min-h-32 w-full rounded border border-slate-300 p-2" name="bio" maxLength="2000" value={form.bio} onChange={updateField} placeholder="Your musical background, genres and performance experience" />
        </label>
        <label className="block font-medium text-slate-800">Profile photo URL <span className="font-normal text-slate-500">(optional)</span>
          <input className="mt-1 block w-full rounded border border-slate-300 p-2" type="url" name="profilePhotoUrl" value={form.profilePhotoUrl} onChange={updateField} placeholder="https://example.com/photo.jpg" />
        </label>
        {error && <p className="rounded bg-red-50 p-3 text-red-700" role="alert">{error}</p>}
        {message && <p className="rounded bg-green-50 p-3 text-green-700" role="status">{message}</p>}
        <button className="rounded bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-60" type="submit" disabled={saving}>{saving ? "Saving…" : "Save profile"}</button>
      </form>
    </main>
  );
}
