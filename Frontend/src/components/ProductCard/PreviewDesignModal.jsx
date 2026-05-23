'use client';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import './PreviewDesignModal.css';

// --- Format Helpers ---
const MM_PER_INCH = 25.4;

function formatStitches(count) {
  return `${(count || 0).toLocaleString('en-US')} stitches`;
}

function formatTrims(count) {
  return `${(count || 0).toLocaleString('en-US')} trims`;
}

function formatColors(count) {
  const c = count || 1;
  return c === 1 ? '1 color' : `${c} colors`;
}

function formatDimensions(widthMm, heightMm) {
  const w = widthMm || 0;
  const h = heightMm || 0;
  const wIn = w / MM_PER_INCH;
  const hIn = h / MM_PER_INCH;
  return `${w.toFixed(1)} x ${h.toFixed(1)} mm (${wIn.toFixed(2)} x ${hIn.toFixed(2)} in)`;
}

// --- Icons ---
function IconClose() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconEye() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function IconInfo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path d="M12 10v6M12 8h.01" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconWarning() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="currentColor" />
      <path d="M12 8v5M12 16h.01" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconStitches() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 6h16M4 12h10M4 18h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function IconPalette() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3c-4.5 0-8 3-8 7a6 6 0 0 0 6 6h1.2a2.8 2.8 0 0 0 0-5.6H10a2 2 0 0 1-2-2c0-4 3.5-5.4 4-5.4Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="8" cy="8" r="1" fill="currentColor" />
      <circle cx="11" cy="6" r="1" fill="currentColor" />
      <circle cx="14" cy="8" r="1" fill="currentColor" />
    </svg>
  );
}

function IconScissors() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="6" cy="7" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="6" cy="17" r="2.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.5 8.5L20 4M8.5 15.5L20 20M14 12h6" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

function IconRuler() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 16l12-12 4 4L8 20l-4-4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M10 8l2 2M13 11l2 2M16 14l2 2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

// --- DesignFileCard Component ---
export function DesignFileCard({ file }) {
  const thumbSrc = file.previewDataUrl || file.previewUrl;
  const { stats } = file;

  return (
    <article className="design-file-card">
      <div className="design-file-card__thumb-wrap">
        {thumbSrc ? (
          <img className="design-file-card__thumb" src={thumbSrc} alt="" />
        ) : (
          <div className="design-file-card__thumb design-file-card__thumb--placeholder" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '8px', boxSizing: 'border-box' }}>
            <IconStitches style={{ width: '24px', height: '24px', color: '#ccd88f' }} />
            <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#777', letterSpacing: '0.05em' }}>PREVIEW</span>
          </div>
        )}
      </div>

      <div className="design-file-card__body">
        <div className="design-file-card__top">
          <span className="design-file-card__format">{file.format}</span>
        </div>

        <div className="design-file-card__divider" />

        <div className="design-file-card__stats">
          <span className="design-file-card__stat">
            <IconStitches />
            {formatStitches(stats.stitchCount)}
          </span>
          <span className="design-file-card__stat design-file-card__stat--colors">
            <IconPalette />
            <span className="design-file-card__colors-pill">{formatColors(stats.colorCount)}</span>
          </span>
          <span className="design-file-card__stat">
            <IconScissors />
            {formatTrims(stats.trimCount)}
          </span>
          <span className="design-file-card__stat design-file-card__stat--dims">
            <IconRuler />
            {formatDimensions(stats.widthMm, stats.heightMm)}
          </span>
        </div>
      </div>
    </article>
  );
}

// --- Main PreviewDesignModal Component ---
export default function PreviewDesignModal({
  open,
  loading = false,
  productTitle,
  variantName,
  files = [],
  onClose,
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  return createPortal(
    <div className="preview-modal-overlay" role="presentation" onClick={onClose}>
      <div
        className="preview-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="preview-modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="preview-modal__header">
          <div className="preview-modal__title-row">
            <IconEye className="preview-modal__title-icon" />
            <div>
              <h2 id="preview-modal-title" className="preview-modal__title">
                What you&apos;ll get with this design
              </h2>
              <p className="preview-modal__subtitle">{productTitle}</p>
            </div>
          </div>
          <button type="button" className="preview-modal__close-x" onClick={onClose} aria-label="Close">
            <IconClose />
          </button>
        </header>

        <div className="preview-modal__alerts">
          <div className="preview-alert preview-alert--info">
            <IconInfo className="preview-alert__icon preview-alert__icon--info" />
            <p>
              These are <strong>live previews</strong> extracted directly from the zip design files package. You can inspect stitches, color stops, trims, and dimensions of each layout block before purchasing.
            </p>
          </div>
          <div className="preview-alert preview-alert--warning">
            <IconWarning className="preview-alert__icon preview-alert__icon--warning" />
            <p>
              Stitch counts and boundaries are read directly from the DST file structure and may vary slightly depending on your embroidery machine settings or editing software.
            </p>
          </div>
        </div>

        <section className="preview-modal__files-section">
          {variantName && (
            <h3 className="preview-modal__variant-title">
              Package: {variantName}
            </h3>
          )}
          <p className="preview-modal__file-count">
            {files.length === 1
              ? '1 design file included'
              : `${files.length} design files included`}
          </p>
          {loading ? (
            <div className="preview-modal__loading">
              <span className="preview-modal__spinner"></span>
              <p>Reading design files from live ZIP package…</p>
            </div>
          ) : (
            <div className="preview-modal__files">
              {files.map((file) => (
                <DesignFileCard key={file.id} file={file} />
              ))}
            </div>
          )}
        </section>

        <footer className="preview-modal__footer">
          <button type="button" className="preview-modal__close-btn" onClick={onClose}>
            Close
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
}
