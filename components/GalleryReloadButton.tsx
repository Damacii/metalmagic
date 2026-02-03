'use client';

export default function GalleryReloadButton() {
  return (
    <button
      type="button"
      onClick={() => window.location.reload()}
      className="rounded-full bg-[#1D3461] force-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-black"
    >
      Reload Images
    </button>
  );
}
