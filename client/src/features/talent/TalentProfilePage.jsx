import { useEffect, useState } from "react";
import { useAuth } from "../auth/auth-context.jsx";
import { api } from "../../lib/api";

const emptyProfile = {
  talentType: "instrumentalist",
  instruments: "",
  bio: "",
  yearsExperience: "0",
  profilePhotoUrl: "",
  genres: "",
  city: "",
};

function toForm(profile) {
  return {
    talentType: profile.talentType || "instrumentalist",
    instruments: (profile.instruments || []).join(", "),
    bio: profile.bio || "",
    yearsExperience: String(profile.yearsExperience ?? 0),
    profilePhotoUrl: profile.profilePhotoUrl || "",
    genres: (profile.genres || []).join(", "),
    city: profile.city || "",
  };
}

function accountForm(user) {
  return { name: user?.name || "", email: user?.email || "", phone: user?.phone || "" };
}

function commaSeparated(value) {
  return [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];
}

export function TalentProfilePage() {
  const { user } = useAuth();
  const [form, setForm] = useState(emptyProfile);
  const [account, setAccount] = useState(() => accountForm(user));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => { setAccount(accountForm(user)); }, [user]);
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

  function updateAccount(event) {
    const { name, value } = event.target;
    setAccount((current) => ({ ...current, [name]: value }));
  }

  function choosePhoto(event) {
    const file = event.target.files?.[0] || null;
    setPhotoFile(file);
    setPhotoPreview(file ? URL.createObjectURL(file) : form.profilePhotoUrl);
  }

  async function uploadPhoto() {
    if (!photoFile) return;
    setError("");
    setMessage("");
    setUploadingPhoto(true);
    try {
      const upload = new FormData();
      upload.append("image", photoFile);
      const response = await api.post("/talent/profile/photo", upload);
      setForm(toForm(response.data.data.profile));
      setPhotoPreview(response.data.data.photo.url);
      setPhotoFile(null);
      setMessage("Profile photo uploaded.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not upload your profile photo.");
    } finally {
      setUploadingPhoto(false);
    }
  }

  async function saveProfile(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const userUpdates = {};
      if (account.name.trim() !== (user?.name || "")) userUpdates.name = account.name.trim();
      if (account.phone.trim() !== (user?.phone || "")) userUpdates.phone = account.phone.trim();
      if (Object.keys(userUpdates).length) await api.patch("/users/me", userUpdates);

      const payload = {
        ...form,
        yearsExperience: Number(form.yearsExperience),
        instruments: form.talentType === "instrumentalist" ? commaSeparated(form.instruments) : [],
        genres: commaSeparated(form.genres),
        city: form.city.trim(),
      };
      const response = await api.put("/talent/profile", payload);
      setForm(toForm(response.data.data.profile));
      setMessage("Your account and talent profile have been saved.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Could not save your profile.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="p-6 text-slate-600">Loading profile...</p>;

  return <main className="mx-auto max-w-2xl px-6 py-10">
    <h1 className="text-3xl font-bold text-slate-900">Your talent profile</h1>
    <p className="mt-2 text-slate-600">Share the professional details Customers need. Use only your general city or area, never a private event address.</p>
    <form className="mt-8 space-y-7 rounded-xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={saveProfile}>
      <section><h2 className="text-lg font-bold text-slate-900">Account information</h2><div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block font-medium text-slate-800">Full name<input className="mt-1 block w-full rounded border border-slate-300 p-2" name="name" value={account.name} onChange={updateAccount} required /></label>
        <label className="block font-medium text-slate-800">Phone<input className="mt-1 block w-full rounded border border-slate-300 p-2" name="phone" value={account.phone} onChange={updateAccount} required /></label>
        <label className="block font-medium text-slate-800 sm:col-span-2">Email<input className="mt-1 block w-full cursor-not-allowed rounded border border-slate-200 bg-slate-50 p-2 text-slate-600" value={account.email} readOnly aria-readonly="true" /><span className="mt-1 block text-sm font-normal text-slate-500">Email changes are not supported here.</span></label>
      </div></section>
      <section className="border-t border-slate-200 pt-6"><h2 className="text-lg font-bold text-slate-900">Professional profile</h2><div className="mt-4 space-y-5">
        <label className="block font-medium text-slate-800">Talent type<select className="mt-1 block w-full rounded border border-slate-300 p-2" name="talentType" value={form.talentType} onChange={updateField}><option value="instrumentalist">Instrumentalist</option><option value="backup_vocalist">Backup vocalist</option></select></label>
        {form.talentType === "instrumentalist" && <label className="block font-medium text-slate-800">Instruments<input className="mt-1 block w-full rounded border border-slate-300 p-2" name="instruments" value={form.instruments} onChange={updateField} placeholder="For example: Keyboard, Guitar" required /><span className="mt-1 block text-sm font-normal text-slate-500">Separate each instrument with a comma.</span></label>}
        <label className="block font-medium text-slate-800">Years of experience<input className="mt-1 block w-full rounded border border-slate-300 p-2" type="number" name="yearsExperience" min="0" step="1" value={form.yearsExperience} onChange={updateField} required /></label>
        <label className="block font-medium text-slate-800">Genres and styles <span className="font-normal text-slate-500">(optional)</span><input className="mt-1 block w-full rounded border border-slate-300 p-2" name="genres" value={form.genres} onChange={updateField} placeholder="For example: Gospel, Afrobeats, Jazz" /><span className="mt-1 block text-sm font-normal text-slate-500">Separate styles with commas.</span></label>
        <label className="block font-medium text-slate-800">City or general area <span className="font-normal text-slate-500">(optional)</span><input className="mt-1 block w-full rounded border border-slate-300 p-2" name="city" value={form.city} onChange={updateField} placeholder="For example: Victoria Island, Lagos" maxLength="120" /><span className="mt-1 block text-sm font-normal text-slate-500">Use a general public area only, not an exact address.</span></label>
        <label className="block font-medium text-slate-800">Bio<textarea className="mt-1 block min-h-32 w-full rounded border border-slate-300 p-2" name="bio" maxLength="2000" value={form.bio} onChange={updateField} placeholder="Your musical background, genres, and performance experience" /></label>
        <div><span className="block font-medium text-slate-800">Profile photo <span className="font-normal text-slate-500">(optional)</span></span><input className="mt-1 block w-full text-sm" accept="image/jpeg,image/png,image/webp" type="file" onChange={choosePhoto} /><p className="mt-1 text-sm text-slate-500">JPEG, PNG, or WebP up to 5 MB.</p>{(photoPreview || form.profilePhotoUrl) && <img className="mt-3 h-24 w-24 rounded-full object-cover" src={photoPreview || form.profilePhotoUrl} alt="Profile preview" />}{photoFile && <button className="mt-3 rounded border border-indigo-300 px-3 py-2 font-semibold text-indigo-700 disabled:opacity-60" disabled={uploadingPhoto || saving} onClick={uploadPhoto} type="button">{uploadingPhoto ? "Uploading..." : "Upload photo"}</button>}</div>
      </div></section>
      {error && <p className="rounded bg-red-50 p-3 text-red-700" role="alert">{error}</p>}
      {message && <p className="rounded bg-green-50 p-3 text-green-700" role="status">{message}</p>}
      <button className="rounded bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-60" type="submit" disabled={saving}>{saving ? "Saving..." : "Save profile"}</button>
    </form>
  </main>;
}
