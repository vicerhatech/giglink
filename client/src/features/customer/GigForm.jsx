import { useState } from "react";
import { ADVISORY, blankGig, blankPosition, validateAndSerialize } from "./gigForm";

const naira = new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 });

function ErrorSlot({ message }) {
  return <span className="customer-error-slot" aria-live="polite">{message && <small className="customer-error">{message}</small>}</span>;
}

function digitsOnly(value) {
  return value.replace(/\D/g, "");
}

export function GigForm({ initialValue = blankGig(), onSubmit, submitLabel = "Save draft" }) {
  const [form, setForm] = useState(initialValue);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const set = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const setGigType = (gigType) => {
    setForm((current) => ({ ...current, gigType, ...(gigType === "free" ? { paymentMin: "", paymentMax: "" } : {}) }));
    if (gigType === "free") setErrors(({ paymentMin, paymentMax, ...remaining }) => remaining);
  };
  const changePosition = (index, field, value) => setForm((current) => ({
    ...current,
    positions: current.positions.map((position, i) => i === index ? { ...position, [field]: value } : position),
  }));
  const changeSong = (positionIndex, songIndex, value) => setForm((current) => ({
    ...current,
    positions: current.positions.map((position, i) => i === positionIndex ? {
      ...position,
      auditionSongs: position.auditionSongs.map((song, j) => j === songIndex ? value : song),
    } : position),
  }));
  const field = (name, label, type = "text", extra = {}) => <label className="customer-field"><span>{label}</span><input type={type} value={form[name]} onChange={(event) => set(name, event.target.value)} {...extra} /><ErrorSlot message={errors[name]} /></label>;
  const moneyField = (name, label) => <label className="customer-field"><span>{label}</span><span className="customer-money-input"><span aria-hidden="true">NGN</span><input type="text" inputMode="numeric" pattern="[0-9]*" placeholder="25000" value={form[name]} onChange={(event) => set(name, digitsOnly(event.target.value))} /></span><ErrorSlot message={errors[name]} /></label>;

  async function handleSubmit(event) {
    event.preventDefault();
    const result = validateAndSerialize(form);
    if (result.errors) {
      setErrors(result.errors);
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await onSubmit(result.payload);
    } finally {
      setSubmitting(false);
    }
  }

  const fee = form.gigType === "paid" ? 10000 : 5000;
  return <form className="customer-form" onSubmit={handleSubmit} noValidate>
    <aside className="customer-advisory"><strong>Plan ahead</strong><br />{ADVISORY}</aside>
    <div className="customer-grid">{field("title", "Gig title", "text", { placeholder: "e.g. Wedding Reception Band" })}{field("eventType", "Event type", "text", { placeholder: "e.g. Wedding reception" })}</div>
    <label className="customer-field"><span>Description</span><textarea value={form.description} onChange={(event) => set("description", event.target.value)} placeholder="Briefly describe the event, audience, and performance expectations." /><ErrorSlot message={errors.description} /></label>
    <div className="customer-grid">{field("eventDate", "Event date", "date")}{field("eventTime", "Event time", "time")}{field("applicationDeadline", "Application deadline", "date")}</div>
    {field("location", "Exact event location", "text", { placeholder: "e.g. Victoria Island, Lagos" })}
    <fieldset>
      <legend>Gig type, compensation, and posting fee</legend>
      <div className="customer-choice-row"><label><input type="radio" checked={form.gigType === "free"} onChange={() => setGigType("free")} /> Free gig</label><label><input type="radio" checked={form.gigType === "paid"} onChange={() => setGigType("paid")} /> Paid gig</label></div>
      {form.gigType === "free" ? <p className="customer-note">Gig type: <strong>Free</strong>. No Talent compensation range is collected for this gig.</p> : <><p className="customer-note">Gig type: <strong>Paid</strong>. Set the Talent compensation range below; this is separate from the platform posting fee.</p><div className="customer-grid">{moneyField("paymentMin", "Minimum Talent compensation (NGN)")}{moneyField("paymentMax", "Maximum Talent compensation (NGN)")}</div><p className="customer-note">{form.paymentMin && form.paymentMax ? `Talent compensation: ${naira.format(Number(form.paymentMin))} – ${naira.format(Number(form.paymentMax))}` : "Paid gigs require a minimum Talent compensation of NGN 25,000."}</p></>}
      <div className="customer-fee"><strong>Posting fee: {naira.format(fee)}</strong><br />Payment status starts as <strong>unpaid</strong>. Creating this form saves a private <strong>draft</strong>; you will pay the posting fee from the gig management page before it can be published.</div>
    </fieldset>
    <section>
      <div className="customer-section-heading"><div><h2>Who do you need?</h2><p className="customer-note">Add a role for each instrument or type of vocalist. Request 1–3 songs or performance samples for each role.</p></div><button type="button" className="customer-secondary" onClick={() => set("positions", [...form.positions, blankPosition()])}>Add a role</button></div>
      <ErrorSlot message={errors.positions} />
      {form.positions.map((position, index) => <fieldset className="customer-position" key={index}>
        <legend>Role {index + 1}</legend>
        <div className="customer-grid"><label className="customer-field"><span>Type of musician</span><select value={position.roleType} onChange={(event) => changePosition(index, "roleType", event.target.value)}><option value="instrumentalist">Instrumentalist</option><option value="backup_vocalist">Backup vocalist</option></select><ErrorSlot /></label>{position.roleType === "instrumentalist" && <label className="customer-field"><span>Instrument</span><input value={position.instrument} placeholder="e.g. Guitar" onChange={(event) => changePosition(index, "instrument", event.target.value)} /><ErrorSlot message={errors[`instrument-${index}`]} /></label>}<label className="customer-field"><span>People needed</span><input type="number" min="1" step="1" value={position.slots} onChange={(event) => changePosition(index, "slots", event.target.value)} /><ErrorSlot message={errors[`slots-${index}`]} /></label></div>
        <div className="audition-heading"><h3>What should applicants perform?</h3><span>{position.auditionSongs.length} of 3 requests</span></div><p className="customer-note">Start with one song or sample, such as “Amazing Grace” or “A 60-second jazz improvisation.” Applicants send one video for each request.</p><ErrorSlot message={errors[`songs-${index}`]} />
        {position.auditionSongs.map((song, songIndex) => <div className="audition-request" key={songIndex}><label className="customer-field"><span>Song or sample {songIndex + 1}</span><input value={song} placeholder="Song title or what you would like to hear" onChange={(event) => changeSong(index, songIndex, event.target.value)} /><ErrorSlot message={errors[`song-${index}-${songIndex}`]} /></label>{position.auditionSongs.length > 1 && <button type="button" className="customer-secondary" aria-label={`Remove sample ${songIndex + 1} from role ${index + 1}`} onClick={() => changePosition(index, "auditionSongs", position.auditionSongs.filter((_, i) => i !== songIndex))}>Remove</button>}</div>)}
        {position.auditionSongs.length < 3 && <button type="button" className="customer-secondary" onClick={() => changePosition(index, "auditionSongs", [...position.auditionSongs, ""])}>+ Add another song or sample</button>}
        {form.positions.length > 1 && <button type="button" className="customer-danger" onClick={() => set("positions", form.positions.filter((_, i) => i !== index))}>Remove this role</button>}
      </fieldset>)}
    </section>
    <button className="customer-primary" disabled={submitting}>{submitting ? "Saving…" : submitLabel}</button>
  </form>;
}
