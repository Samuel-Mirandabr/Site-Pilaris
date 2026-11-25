import { useId } from "react";

interface Props {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: (p: { id: string; "aria-describedby"?: string; "aria-invalid"?: boolean }) => React.ReactNode;
  className?: string;
}

/** Rótulo + controle + dica + erro, com ligações de acessibilidade. */
export function Field({ label, error, hint, required, children, className }: Props) {
  const id = useId();
  const described = [hint ? `${id}-h` : "", error ? `${id}-e` : ""].filter(Boolean).join(" ") || undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="label">{label}{required && <span aria-hidden> *</span>}</label>
      {children({ id, "aria-describedby": described, "aria-invalid": error ? true : undefined })}
      {hint && <p id={`${id}-h`} className="hint">{hint}</p>}
      {error && <p id={`${id}-e`} role="alert" className="error-text">{error}</p>}
    </div>
  );
}
