import { useEffect, useId, useState } from "react";
import "./event-filters.css";

const instruments = ["Keyboard", "Piano", "Guitar", "Acoustic guitar", "Electric guitar", "Bass guitar", "Drums", "Percussion", "Talking drum", "Saxophone", "Trumpet", "Violin", "Cello", "Flute"];

export function EventRoleFilters({ value, onApply }) {
  const id = useId();
  const [role, setRole] = useState(value.role || "");
  const [instrument, setInstrument] = useState(value.instrument || "");
  useEffect(() => { setRole(value.role || ""); setInstrument(value.instrument || ""); }, [value.role, value.instrument]);
  return <form className="event-role-filters" aria-label="Filter events by musician role" onSubmit={event => { event.preventDefault(); onApply({ role, instrument: instrument.trim() }); }}>
    <label htmlFor={`${id}-role`}>Musician role<select id={`${id}-role`} value={role} onChange={event => { setRole(event.target.value); if (event.target.value === "backup_vocalist") setInstrument(""); }}><option value="">Any role</option><option value="instrumentalist">Instrumentalist</option><option value="backup_vocalist">Backup vocalist</option></select></label>
    <label htmlFor={`${id}-instrument`}>Instrument<input id={`${id}-instrument`} list={`${id}-instruments`} value={instrument} onChange={event => setInstrument(event.target.value)} disabled={role === "backup_vocalist"} maxLength={80} placeholder={role === "backup_vocalist" ? "Not needed for vocalists" : "Any instrument — type or choose"} /><datalist id={`${id}-instruments`}>{instruments.map(name => <option key={name} value={name} />)}</datalist></label>
    <div className="event-filter-actions"><button className="button button-primary" type="submit">Apply filters</button><button className="button button-secondary" type="button" onClick={() => { setRole(""); setInstrument(""); onApply({ role: "", instrument: "" }); }}>Clear</button></div>
    <p>Instrument names match exactly, ignoring capitals. Choose a suggestion or enter the instrument you play.</p>
  </form>;
}
