import { useState } from "react";
import { ADVISORY, blankGig, blankPosition, validateAndSerialize } from "./gigForm";

const naira = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });

export function GigForm({ initialValue = blankGig(), onSubmit, submitLabel = "Save draft" }) {
  const [form, setForm] = useState(initialValue);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const set = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const changePosition = (index, field, value) => setForm((current) => ({ ...current, positions: current.positions.map((position, i) => i === index ? { ...position, [field]: value } : position) }));
  const changeSong = (positionIndex, songIndex, value) => setForm((current) => ({ ...current, positions: current.positions.map((position, i) => i === positionIndex ? { ...position, auditionSongs: position.auditionSongs.map((song, j) => j === songIndex ? value : song) } : position) }));
  const field = (name, label, type = "text", extra = {}) => <label className="customer-field">{label}<input type={type} value={form[name]} onChange={(e) => set(name, e.target.value)} {...extra} />{errors[name] && <small className="customer-error">{errors[name]}</small>}</label>;
  async function handleSubmit(event) {
    event.preventDefault();
    const result = validateAndSerialize(form);
    if (result.errors) { setErrors(result.errors); return; }
    setErrors({}); setSubmitting(true);
    try { await onSubmit(result.payload); } finally { setSubmitting(false); }
  }
  const fee = form.gigType === "paid" ? 10000 : 5000;
  return <form className="customer-form" onSubmit={handleSubmit} noValidate>
    <aside className="customer-advisory"><strong>Plan ahead</strong><br />{ADVISORY}</aside>
    <div className="customer-grid">{field("title", "Gig title")}{field("eventType", "Event type")}</div>
    <label className="customer-field">Description<textarea value={form.description} onChange={(e) => set("description", e.target.value)} />{errors.description && <small className="customer-error">{errors.description}</small>}</label>
    <div className="customer-grid">{field("eventDate", "Event date", "date")}{field("eventTime", "Event time", "time")}{field("applicationDeadline", "Application deadline", "date")}</div>
    {field("location", "Exact event location")}
    <fieldset><legend>Gig type</legend><div className="customer-choice-row"><label><input type="radio" checked={form.gigType === "free"} onChange={() => set("gigType", "free")} /> Free gig</label><label><input type="radio" checked={form.gigType === "paid"} onChange={() => set("gigType", "paid")} /> Paid gig</label></div>
      {form.gigType === "free" ? <p className="customer-note">This gig is unpaid to talent. The separate {naira.format(5000)} platform posting fee applies before publication.</p> : <><p className="customer-note">Talent compensation is separate from the {naira.format(10000)} platform posting fee.</p><div className="customer-grid">{field("paymentMin", "Minimum talent payment (₦)", "number", { min: 25000, step: 1 })}{field("paymentMax", "Maximum talent payment (₦)", "number", { min: 25000, step: 1 })}</div><p className="customer-note">{form.paymentMin && form.paymentMax ? `Talent payment range: ${naira.format(Number(form.paymentMin))} – ${naira.format(Number(form.paymentMax))}` : "Enter the talent payment range in whole naira."}</p></>}
      <p className="customer-fee">Posting fee on publication: {naira.format(fee)}. This form saves a draft only; it does not process payment or publish the gig.</p>
    </fieldset>
    <section><div className="customer-section-heading"><h2>Required positions</h2><button type="button" onClick={() => set("positions", [...form.positions, blankPosition()])}>Add position</button></div>{errors.positions && <small className="customer-error">{errors.positions}</small>}
      {form.positions.map((position, index) => <fieldset className="customer-position" key={index}><legend>Position {index + 1}</legend><div className="customer-grid"><label className="customer-field">Role<select value={position.roleType} onChange={(e) => changePosition(index, "roleType", e.target.value)}><option value="instrumentalist">Instrumentalist</option><option value="backup_vocalist">Backup Vocalist</option></select></label>{position.roleType === "instrumentalist" && <label className="customer-field">Instrument<input value={position.instrument} onChange={(e) => changePosition(index, "instrument", e.target.value)} />{errors[`instrument-${index}`] && <small className="customer-error">{errors[`instrument-${index}`]}</small>}</label>}<label className="customer-field">Number of slots<input type="number" min="1" step="1" value={position.slots} onChange={(e) => changePosition(index, "slots", e.target.value)} />{errors[`slots-${index}`] && <small className="customer-error">{errors[`slots-${index}`]}</small>}</label></div><p className="customer-note">Exactly three non-empty audition songs are required.</p>{position.auditionSongs.map((song, songIndex) => <label className="customer-field" key={songIndex}>Audition song {songIndex + 1} of 3<input value={song} onChange={(e) => changeSong(index, songIndex, e.target.value)} />{errors[`song-${index}-${songIndex}`] && <small className="customer-error">{errors[`song-${index}-${songIndex}`]}</small>}</label>)}{form.positions.length > 1 && <button type="button" className="customer-danger" onClick={() => set("positions", form.positions.filter((_, i) => i !== index))}>Remove position</button>}</fieldset>)}</section>
    <button className="customer-primary" disabled={submitting}>{submitting ? "Saving…" : submitLabel}</button>
  </form>;
}
