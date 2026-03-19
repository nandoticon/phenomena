import { Download, Smartphone } from 'lucide-react';

interface PwaInstallBannerProps {
  canInstall: boolean;
  isStandalone: boolean;
  isIos: boolean;
  onInstall: () => void;
  onDismiss: () => void;
}

export function PwaInstallBanner({ canInstall, isStandalone, isIos, onInstall, onDismiss }: PwaInstallBannerProps) {
  if (isStandalone) {
    return null;
  }

  return (
    <section
      className="card panel install-banner"
      style={{
        marginBottom: '18px',
        border: '1px solid rgba(255, 122, 89, 0.25)',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,122,89,0.08))',
      }}
      aria-label="Install Phenomena"
    >
      <div className="panel-head install-banner-head" style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Smartphone size={16} />
          <div>
            <p className="eyebrow" style={{ marginBottom: '4px', color: 'var(--accent)' }}>Mobile Install</p>
            <h2 style={{ margin: 0 }}>Install Phenomena on this device</h2>
          </div>
        </div>
        <button className="ghost" type="button" onClick={onDismiss} aria-label="Dismiss install prompt">Dismiss</button>
      </div>

      <div className="install-banner-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', gap: '14px', alignItems: 'start' }}>
        <div style={{ color: 'var(--muted)', lineHeight: 1.45 }}>
          <p style={{ marginTop: 0 }}>
            Install the app for a full-screen experience, offline access after the first load, and faster launch from your home screen.
          </p>
          <p style={{ marginBottom: 0 }}>
            The app caches the shell locally, so it keeps opening even if the network drops after installation.
          </p>
        </div>

        <div className="install-banner-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {canInstall ? (
            <button className="primary" onClick={onInstall} type="button" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Download size={16} />
              Install app
            </button>
          ) : (
            <div className="status ready" role="status" aria-live="polite" aria-atomic="true" style={{ background: 'rgba(167, 224, 104, 0.1)', color: 'var(--success)' }}>
              {isIos
                ? 'On iPhone or iPad, open Share and choose Add to Home Screen.'
                : 'Install is handled by your browser menu on this device.'}
            </div>
          )}
          <p style={{ margin: 0, color: 'var(--secondary)', fontSize: '0.9rem' }}>
            Background reminder notifications still work when browser permission is granted.
          </p>
        </div>
      </div>
    </section>
  );
}
