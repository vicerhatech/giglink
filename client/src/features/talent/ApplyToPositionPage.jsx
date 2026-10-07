import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../../lib/api";

function emptyUploads(songs) {
  return Object.fromEntries(songs.map((song) => [song, { file: null, video: null, progress: 0 }]));
}

export function ApplyToPositionPage() {
  const { gigId, positionId } = useParams();
  const [gig, setGig] = useState(null);
  const [position, setPosition] = useState(null);
  const [uploads, setUploads] = useState({});
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadGig() {
      try {
        const response = await api.get(`/talent/gigs/${gigId}`);
        const loadedGig = response.data.data.gig;
        const loadedPosition = loadedGig.positions.find((candidate) => String(candidate._id) === positionId);
        if (!loadedPosition) throw new Error("This gig position is no longer available.");
        setGig(loadedGig);
        setPosition(loadedPosition);
        setUploads(emptyUploads(loadedPosition.auditionSongs));
      } catch (requestError) {
        setError(requestError.response?.data?.message || requestError.message || "Could not load this position.");
      }
    }
    loadGig();
  }, [gigId, positionId]);

  function chooseFile(song, file) {
    setUploads((current) => ({ ...current, [song]: { file: file || null, video: null, progress: 0 } }));
  }

  async function uploadForSong(song) {
    const entry = uploads[song];
    if (entry.video) return entry.video;
    if (!entry.file) throw new Error(`Choose a video for “${song}”.`);

    const formData = new FormData();
    formData.append("video", entry.file);
    const response = await api.post("/media/videos", formData, {
      onUploadProgress: (event) => {
        const progress = event.total ? Math.round((event.loaded * 100) / event.total) : 0;
        setUploads((current) => ({ ...current, [song]: { ...current[song], progress } }));
      },
    });
    const video = response.data.data.video;
    setUploads((current) => ({ ...current, [song]: { ...current[song], video, progress: 100 } }));
    return video;
  }

  async function submitApplication(event) {
    event.preventDefault();
    setError("");
    setStatus("");
    if (!position) return;
    if (position.auditionSongs.some((song) => !uploads[song]?.file && !uploads[song]?.video)) {
      setError("Choose one video for each requested audition song.");
      return;
    }

    setSubmitting(true);
    try {
      setStatus("Uploading your audition videos…");
      const demoVideos = [];
      for (const song of position.auditionSongs) {
        const video = await uploadForSong(song);
        demoVideos.push({ songTitle: song, ...video });
      }
      setStatus("Submitting your application…");
      await api.post(`/talent/gigs/${gigId}/positions/${positionId}/apply`, { demoVideos, note });
      setStatus("Application submitted successfully.");
    } catch (requestError) {
      setError(requestError.response?.data?.message || requestError.message || "Could not submit your application.");
      setStatus("");
    } finally {
      setSubmitting(false);
    }
  }

  if (error && !position) return <main className="mx-auto max-w-3xl p-6"><p className="rounded bg-red-50 p-3 text-red-700" role="alert">{error}</p></main>;
  if (!gig || !position) return <p className="p-6 text-slate-600">Loading application…</p>;

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link className="font-semibold text-indigo-700" to={`/talent/gigs/${gigId}`}>Back to gig</Link>
      <h1 className="mt-5 text-3xl font-bold text-slate-900">Apply to {gig.title}</h1>
      <p className="mt-2 text-slate-600">Submit one audition video for each requested song.</p>
      <form className="mt-7 space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm" onSubmit={submitApplication}>
        {position.auditionSongs.map((song) => {
          const upload = uploads[song] || {};
          return <fieldset className="rounded border border-slate-200 p-4" key={song}>
            <label className="block font-semibold text-slate-900" htmlFor={`video-${song}`}>{song}</label>
            <input accept="video/*" className="mt-3 block w-full text-sm" disabled={submitting} id={`video-${song}`} type="file" onChange={(event) => chooseFile(song, event.target.files?.[0])} />
            {upload.file && <p className="mt-2 text-sm text-slate-600">Selected: {upload.file.name}</p>}
            {upload.progress > 0 && !upload.video && <p className="mt-2 text-sm text-indigo-700">Uploading: {upload.progress}%</p>}
            {upload.video && <p className="mt-2 text-sm font-medium text-emerald-700">Video uploaded.</p>}
          </fieldset>;
        })}
        <label className="block font-medium text-slate-800">Note for the customer <span className="font-normal text-slate-500">(optional)</span>
          <textarea className="mt-1 block min-h-28 w-full rounded border border-slate-300 p-2" disabled={submitting} maxLength="2000" value={note} onChange={(event) => setNote(event.target.value)} />
        </label>
        {error && <p className="rounded bg-red-50 p-3 text-red-700" role="alert">{error}</p>}
        {status && <p className="rounded bg-blue-50 p-3 text-blue-700" role="status">{status}</p>}
        <button className="rounded bg-indigo-600 px-4 py-2 font-semibold text-white disabled:opacity-60" disabled={submitting} type="submit">{submitting ? "Working…" : "Upload demos and submit"}</button>
      </form>
    </main>
  );
}
