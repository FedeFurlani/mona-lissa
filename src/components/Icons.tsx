export function IconCart({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 7h15l-1.4 8.2A2 2 0 0 1 17.6 17H9.2a2 2 0 0 1-2-1.7L5.2 4H3"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="20" r="1.2" fill="currentColor" />
      <circle cx="17" cy="20" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function IconWhatsApp({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20 11.5A8.5 8.5 0 0 1 7.6 18.7L4 20l1.4-3.5A8.5 8.5 0 1 1 20 11.5Zm-8.4 6.4c.8 0 1.6-.1 2.3-.4l.5-.2 1.4.4-.4-1.3.2-.5a6.3 6.3 0 1 0-4 2Zm3.6-4.6c-.2-.1-1.2-.6-1.4-.7s-.3-.1-.5.1-.5.7-.7.8-.3.2-.5 0a5.2 5.2 0 0 1-1.5-1.3 5.7 5.7 0 0 1-1-2.2c0-.3.1-.4.2-.6l.3-.4.1-.3c0-.1 0-.3-.1-.4s-.5-1.1-.6-1.5-.4-.3-.5-.3h-.4c-.2 0-.4.1-.6.3s-.7.7-.7 1.8.8 2.1.9 2.2a8.7 8.7 0 0 0 3.3 2.8c.4.2.8.3 1.1.4.4.2.8.1 1.1.1.3 0 1.1-.4 1.2-.8.2-.4.2-.7.1-.8 0-.1-.2-.1-.4-.2Z" />
    </svg>
  );
}

export function IconSearch({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M16.2 16.2 20 20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

export function IconClose({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function IconHeart({ filled, size = 18 }: { filled?: boolean; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
      <path
        d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.6-7 10-7 10Z"
        fill={filled ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function BottleMark({ color = "#fff" }: { color?: string }) {
  return (
    <svg viewBox="0 0 64 64" className="bottle-mark" aria-hidden>
      <path
        d="M28 8h8v4l4 4v6H24v-6l4-4V8Z"
        fill="none"
        stroke={color}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <rect x="22" y="22" width="20" height="30" rx="2" fill="none" stroke={color} strokeWidth="2.4" />
      <path d="M22 32h20" stroke={color} strokeWidth="2.4" />
      <path d="M36 8c4-1 8-1 12 2" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <path d="M36 12c3 0 7 .4 10 2.4" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
