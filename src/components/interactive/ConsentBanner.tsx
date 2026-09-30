import { useEffect, useState } from 'react'

type Consent = 'accepted' | 'essential' | null

export default function ConsentBanner() {
  const [consent, setConsent] = useState<Consent>(null)
  const [ready, setReady] = useState(false)
  const [showPreferences,setShowPreferences] = useState(false)
  const configured = Boolean(import.meta.env.PUBLIC_GA_ID || import.meta.env.PUBLIC_META_PIXEL_ID || import.meta.env.PUBLIC_GOOGLE_ADS_ID)
  useEffect(() => {
    try { const stored = localStorage.getItem('seasonal-edit-consent'); setConsent(stored === 'accepted' || stored === 'essential' ? stored : null) } catch { setConsent(null) }
    setReady(true)
    const open = () => setShowPreferences(true)
    window.addEventListener('privacy_preferences',open)
    return () => window.removeEventListener('privacy_preferences',open)
  }, [])
  if (!ready || (!showPreferences && (consent || !configured))) return null
  const choose = (value: Exclude<Consent, null>) => {
    try { localStorage.setItem('seasonal-edit-consent', value) } catch { /* Advertising stays off if a preference cannot be persisted. */ }
    window.dispatchEvent(new CustomEvent('consent_updated', { detail: value }))
    setConsent(value)
    setShowPreferences(false)
    if (consent === 'accepted' && value === 'essential') window.location.reload()
  }
  return <aside className="consent" aria-label="Privacy options">
    <div><strong>Your choice, clearly.</strong><p>{configured ? 'Optional advertising measurement loads only after your permission. You can change this choice in the footer.' : 'No advertising or analytics service is configured in this preview.'}</p></div>
    <div className="consent__actions">
      <button className="button button--secondary" onClick={() => choose('essential')}>Essential only</button>
      <button className="button button--primary" onClick={() => choose('accepted')}>Allow measurement</button>
    </div>
  </aside>
}
