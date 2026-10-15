import { useState, useEffect } from 'react';

export interface CreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GitHubIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

export function LinkedInIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
    </svg>
  );
}

export function InstagramIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
    </svg>
  );
}

export function MailIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"></rect>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
    </svg>
  );
}

export function CreatorModal({ isOpen, onClose }: CreatorModalProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
      }
    }

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  function fallbackCopy(text: string) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      // ignore
    }
    document.body.removeChild(textArea);
  }

  function handleCopyEmail(e?: React.MouseEvent) {
    if (e) e.stopPropagation();
    const email = 'rakshan.exe@gmail.com';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(email)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2200);
        })
        .catch(() => {
          fallbackCopy(email);
        });
    } else {
      fallbackCopy(email);
    }
  }

  return (
    <div
      className="creator-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="creator-modal-title"
    >
      <div
        className="creator-modal-content animate-pop"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="creator-modal-header">
          <div className="creator-avatar-wrap">
            <div className="creator-avatar">
              <span>RS</span>
            </div>
            <div>
              <div className="creator-title-row">
                <h3 id="creator-modal-title" className="creator-name">Rakshan</h3>
                <span className="creator-tag">Creator</span>
              </div>
              <p className="creator-role">Kannada Quest • Internal Exam Prep</p>
            </div>
          </div>

          <button
            id="btn-close-creator-modal"
            className="creator-modal-close"
            onClick={onClose}
            aria-label="Close creator profile"
          >
            ✕
          </button>
        </div>

        {/* Message */}
        <p className="creator-bio">
          Connect with me or feel free to report questions, suggest improvements, or share with classmates!
        </p>

        {/* Links Grid */}
        <div className="creator-links-list">
          {/* GitHub */}
          <a
            href="https://github.com/silicon-rationalist"
            target="_blank"
            rel="noopener noreferrer"
            className="creator-link-card"
          >
            <div className="creator-card-icon icon-github">
              <GitHubIcon />
            </div>
            <div className="creator-card-info">
              <span className="creator-card-platform">GitHub</span>
              <span className="creator-card-handle">silicon-rationalist</span>
            </div>
            <span className="creator-card-action">View ↗</span>
          </a>

          {/* LinkedIn */}
          <a
            href="https://linkedin.com/in/rakshan-s"
            target="_blank"
            rel="noopener noreferrer"
            className="creator-link-card"
          >
            <div className="creator-card-icon icon-linkedin">
              <LinkedInIcon />
            </div>
            <div className="creator-card-info">
              <span className="creator-card-platform">LinkedIn</span>
              <span className="creator-card-handle">rakshan-s</span>
            </div>
            <span className="creator-card-action">Connect ↗</span>
          </a>

          {/* Instagram */}
          <a
            href="https://instagram.com/sweet_poison.exe"
            target="_blank"
            rel="noopener noreferrer"
            className="creator-link-card"
          >
            <div className="creator-card-icon icon-instagram">
              <InstagramIcon />
            </div>
            <div className="creator-card-info">
              <span className="creator-card-platform">Instagram</span>
              <span className="creator-card-handle">@sweet_poison.exe</span>
            </div>
            <span className="creator-card-action">Follow ↗</span>
          </a>

          {/* Gmail */}
          <div className="creator-link-card creator-email-card">
            <a
              href="mailto:rakshan.exe@gmail.com"
              className="creator-email-main"
              title="Compose email to rakshan.exe@gmail.com"
            >
              <div className="creator-card-icon icon-gmail">
                <MailIcon />
              </div>
              <div className="creator-card-info">
                <span className="creator-card-platform">Gmail</span>
                <span className="creator-card-handle">rakshan.exe@gmail.com</span>
              </div>
            </a>
            <button
              type="button"
              id="btn-copy-email"
              className={`creator-copy-btn ${copied ? 'copied' : ''}`}
              onClick={handleCopyEmail}
              title="Copy email to clipboard"
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </div>

        {/* Footer note */}
        <div className="creator-modal-footer">
          <span>Made with ❤️ for fellow VTU & engineering students</span>
        </div>
      </div>
    </div>
  );
}
