"use client";

export default function PinItButton({
  url,
  media,
  description,
  className = "",
}: {
  url: string;
  media: string;
  description: string;
  className?: string;
}) {
  const href = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(
    url
  )}&media=${encodeURIComponent(media)}&description=${encodeURIComponent(description)}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Save to Pinterest"
      className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold bg-[#E60023] text-white hover:bg-[#AD081B] transition-colors ${className}`}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 0a12 12 0 0 0-4.37 23.17c-.1-.93-.19-2.37.04-3.39.21-.93 1.37-5.94 1.37-5.94s-.35-.7-.35-1.73c0-1.63.94-2.84 2.12-2.84 1 0 1.48.75 1.48 1.65 0 1.01-.64 2.51-.97 3.91-.28 1.17.59 2.13 1.75 2.13 2.1 0 3.72-2.22 3.72-5.42 0-2.83-2.04-4.81-4.95-4.81-3.37 0-5.35 2.53-5.35 5.14 0 1.02.39 2.11.88 2.7.1.12.11.22.08.34-.09.37-.29 1.18-.33 1.35-.05.22-.17.27-.4.16-1.49-.69-2.42-2.87-2.42-4.62 0-3.76 2.73-7.22 7.88-7.22 4.14 0 7.35 2.95 7.35 6.89 0 4.11-2.59 7.42-6.19 7.42-1.21 0-2.34-.63-2.73-1.37l-.74 2.83c-.27 1.03-1 2.33-1.49 3.12A12 12 0 1 0 12 0z" />
      </svg>
      Save
    </a>
  );
}
