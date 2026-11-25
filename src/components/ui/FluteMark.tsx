/** Three small flutes used as a quiet brand motif. */
export function FluteMark({ className = "" }: { className?: string }) {
  return (
    <svg className={className} width="22" height="22" viewBox="0 0 22 22" aria-hidden focusable={false}>
      <rect x="2" y="3" width="4" height="16" rx="2" fill="currentColor" />
      <rect x="9" y="3" width="4" height="16" rx="2" fill="currentColor" />
      <rect x="16" y="3" width="4" height="16" rx="2" fill="currentColor" />
    </svg>
  );
}

/** Original editorial illustration of a fluted column, not a logo. */
export function ColumnFlutes({ className = "" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 320 400" fill="none" aria-hidden focusable={false}>
      <g stroke="currentColor" strokeWidth="1.25">
        <path d="M34 80h252M24 98h272M32 300h256M22 322h276" />
        <path d="M44 98v202" /><path d="M94 98v202" /><path d="M144 98v202" /><path d="M194 98v202" /><path d="M244 98v202" /><path d="M276 98v202" />
        <path d="M34 80c0-27 24-48 46-48s46 21 46 48M103 80c0-27 24-48 46-48s46 21 46 48M172 80c0-27 24-48 46-48s46 21 46 48" />
        <path d="M24 322h272l-18 24H42zM34 56h252" />
      </g>
      <path d="M18 346h284v8H18z" fill="currentColor" opacity=".18" />
    </svg>
  );
}
