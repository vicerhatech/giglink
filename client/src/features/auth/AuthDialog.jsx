import { useEffect, useRef } from "react";
import "./auth-dialog.css";

export function AuthDialog({ onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (!dialog.open) dialog.showModal();
    return () => { dialog.close(); document.body.style.overflow = overflow; };
  }, []);
  return <dialog ref={ref} className="auth-dialog" aria-labelledby="auth-dialog-title" onCancel={(event) => { event.preventDefault(); onClose(); }} onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}><div className="auth-dialog-panel"><button className="auth-dialog-close" type="button" onClick={onClose} aria-label="Close authentication dialog">×</button>{children}</div></dialog>;
}
