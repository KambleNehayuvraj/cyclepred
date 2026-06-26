import { useState, useCallback } from 'react'
import { consultationAPI } from '../api/services'

const FONT    = "'Inter', -apple-system, 'Segoe UI', sans-serif"
const CORAL   = '#fb7185'
const INK     = '#eef1f4'
const MUTED   = '#8d97a3'
const BORDER  = 'rgba(255,255,255,0.09)'
const CARD_BG = 'rgba(255,255,255,0.04)'
const AMBER   = '#f97316'
const GREEN   = '#34d399'
const RED     = '#f87171'

export default function HospitalFinder() {
  const [locating, setLocating] = useState(false)
  const [status, setStatus] = useState(null) // { type: 'info'|'error'|'loading', msg }
  const [source, setSource] = useState(null)
  const [hospitals, setHospitals] = useState([])
  const [searched, setSearched] = useState(false)
  const [placeInput, setPlaceInput] = useState('')
  const [radius, setRadius] = useState('5000')

  const runSearch = useCallback(async ({ lat, lon, placeName, locationLabel, radiusM }) => {
    setHospitals([])
    setSearched(false)
    setSource(null)
    setStatus({ type: 'loading', msg: `Searching OpenStreetMap within ${radiusM / 1000} km…` })

    try {
      const res = await consultationAPI.getNearbyHospitals({ lat, lon, placeName, radiusM })
      const data = res.data
      setHospitals(data.hospitals || [])
      setSearched(true)
      setSource(`${data.source} · ${locationLabel} · ${radiusM / 1000} km radius`)
      setStatus(
        !data.hospitals || data.hospitals.length === 0
          ? { type: 'info', msg: 'No hospitals found. Try increasing the search radius.' }
          : null
      )
    } catch (e) {
      setStatus({ type: 'error', msg: 'Could not fetch hospitals right now. Please try again in a moment.' })
    }
  }, [])

  const autoLocate = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus({ type: 'error', msg: "Your browser doesn't support geolocation. Please enter a location manually." })
      return
    }
    setLocating(true)
    setStatus({ type: 'loading', msg: 'Waiting for location permission…' })

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false)
        runSearch({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          locationLabel: 'Your GPS location',
          radiusM: parseInt(radius),
        })
      },
      (err) => {
        setLocating(false)
        setStatus({
          type: 'error',
          msg: err.code === 1
            ? 'Location permission denied. Please enter your area manually below.'
            : 'Could not get your location. Please enter it manually.',
        })
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }, [radius, runSearch])

  const searchByPlace = useCallback(() => {
    const place = placeInput.trim()
    if (!place) {
      setStatus({ type: 'error', msg: 'Please enter a location name.' })
      return
    }
    runSearch({ placeName: place, locationLabel: `Searched: ${place}`, radiusM: parseInt(radius) })
  }, [placeInput, radius, runSearch])

  const statusColors = {
    info:    { bg: 'rgba(251,113,133,0.08)', color: CORAL, border: 'rgba(251,113,133,0.25)' },
    error:   { bg: 'rgba(248,113,113,0.08)', color: RED,   border: 'rgba(248,113,113,0.25)' },
    loading: { bg: 'rgba(249,115,22,0.08)',  color: AMBER, border: 'rgba(249,115,22,0.25)' },
  }

  return (
    <div style={{
      fontFamily: FONT, background: CARD_BG, border: `1px solid ${BORDER}`,
      borderRadius: 20, overflow: 'hidden', marginBottom: 14,
      animation: 'hr-fadeUp 0.5s ease-out 0.2s both',
    }}>
      {/* Header */}
      <div style={{
        padding: '20px 20px 16px',
        background: 'rgba(251,113,133,0.06)', borderBottom: `1px solid ${BORDER}`,
      }}>
        <h2 style={{ fontSize: 15.5, fontWeight: 800, color: INK, margin: 0, letterSpacing: -0.2 }}>
          🏥 Nearby Gynaecology Hospitals
        </h2>
        <p style={{ fontSize: 12, color: MUTED, margin: '5px 0 0', lineHeight: 1.5 }}>
          Find verified hospitals near you — powered by OpenStreetMap, no login needed
        </p>
      </div>

      <div style={{ padding: '16px 18px 18px' }}>
        {/* Location controls */}
        <div style={{
          background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}`,
          borderRadius: 16, padding: 16, marginBottom: 14,
        }}>
          <button
            onClick={autoLocate}
            disabled={locating}
            style={{
              width: '100%', background: CORAL, color: '#2d0010', border: 'none',
              borderRadius: 12, padding: '12px 16px', fontSize: 13.5, fontWeight: 700,
              cursor: locating ? 'not-allowed' : 'pointer', opacity: locating ? 0.55 : 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              transition: 'opacity 0.15s',
            }}
            onMouseEnter={(e) => { if (!locating) e.currentTarget.style.opacity = '0.88' }}
            onMouseLeave={(e) => { if (!locating) e.currentTarget.style.opacity = '1' }}
          >
            {locating
              ? <><span style={spinnerStyle(15, '#2d0010')} /> Detecting location…</>
              : <>📍 Use my current location</>}
          </button>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, margin: '13px 0',
            color: MUTED, fontSize: 11,
          }}>
            <span style={{ flex: 1, height: 1, background: BORDER }} />
            or enter manually
            <span style={{ flex: 1, height: 1, background: BORDER }} />
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={placeInput}
              onChange={(e) => setPlaceInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') searchByPlace() }}
              placeholder="e.g. Kothrud Pune, or Baner Pune"
              style={{
                flex: 1, border: `1px solid ${BORDER}`, borderRadius: 10,
                padding: '10px 12px', fontSize: 12.5, background: 'rgba(255,255,255,0.04)',
                color: INK, outline: 'none', fontFamily: FONT,
              }}
            />
            <button
              onClick={searchByPlace}
              style={{
                background: 'rgba(251,113,133,0.12)', color: CORAL,
                border: '1px solid rgba(251,113,133,0.3)', borderRadius: 10,
                padding: '10px 16px', fontSize: 12.5, fontWeight: 700,
                cursor: 'pointer', whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(251,113,133,0.18)' }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(251,113,133,0.12)' }}
            >
              Search
            </button>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginTop: 12,
            fontSize: 11.5, color: MUTED,
          }}>
            <span>Search within</span>
            <select
              value={radius}
              onChange={(e) => setRadius(e.target.value)}
              style={{
                border: `1px solid ${BORDER}`, borderRadius: 8, padding: '4px 7px',
                fontSize: 11.5, background: 'rgba(255,255,255,0.04)', color: INK, cursor: 'pointer',
              }}
            >
              <option value="3000">3 km</option>
              <option value="5000">5 km</option>
              <option value="8000">8 km</option>
              <option value="15000">15 km</option>
            </select>
            <span>of your location</span>
          </div>
        </div>

        {/* Status */}
        {status && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            borderRadius: 12, padding: '11px 14px', fontSize: 12.5,
            marginBottom: 12, background: statusColors[status.type].bg,
            color: statusColors[status.type].color,
            border: `1px solid ${statusColors[status.type].border}`,
          }}>
            {status.type === 'loading' && <span style={spinnerStyle(14, statusColors[status.type].color)} />}
            <span>{status.msg}</span>
          </div>
        )}

        {/* Source badge */}
        {source && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            fontSize: 10.5, color: MUTED, marginBottom: 10,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN, flexShrink: 0 }} />
            <span>{source}</span>
          </div>
        )}

        {/* Results */}
        {hospitals.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {hospitals.map((h, i) => {
              const hasCoords = h.lat != null && h.lon != null
              const mapsUrl = hasCoords
                ? `https://www.openstreetmap.org/?mlat=${h.lat}&mlon=${h.lon}&zoom=17`
                : null
              const directionsUrl = hasCoords
                ? `https://www.google.com/maps/dir/?api=1&destination=${h.lat},${h.lon}`
                : null
              const hoursKnown = h.opening_hours && !h.opening_hours.toLowerCase().startsWith('not listed')

              return (
                <div key={i} style={{
                  background: 'rgba(251,113,133,0.04)', border: '1px solid rgba(251,113,133,0.12)',
                  borderRadius: 14, padding: '14px 14px 12px', position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute', top: 13, right: 13, fontSize: 10.5, fontWeight: 700,
                    color: MUTED, background: 'rgba(255,255,255,0.04)', border: `1px solid ${BORDER}`,
                    borderRadius: 20, padding: '2px 8px',
                  }}>#{i + 1}</div>

                  <div style={{
                    fontSize: 13.5, fontWeight: 700, color: INK,
                    paddingRight: 40, lineHeight: 1.35, marginBottom: 4,
                  }}>{h.name}</div>

                  <div style={{ fontSize: 11.5, color: CORAL, fontWeight: 700, marginBottom: 9 }}>
                    📍 {h.distance_km} km away
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {h.address && <Row icon="🏠">{h.address}</Row>}
                    <Row icon="🕐">
                      {hoursKnown ? h.opening_hours : 'Not listed in OSM'}
                      <span style={{
                        display: 'inline-block', fontSize: 10, fontWeight: 700,
                        borderRadius: 4, padding: '1px 6px', marginLeft: 6,
                        background: hoursKnown ? 'rgba(52,211,153,0.12)' : 'rgba(249,115,22,0.12)',
                        color: hoursKnown ? GREEN : AMBER,
                      }}>{hoursKnown ? 'Listed' : 'Call ahead'}</span>
                    </Row>
                    {h.phone && h.phone !== 'Not listed' && <Row icon="📞">{h.phone}</Row>}
                    {h.speciality && <Row icon="🔬">{h.speciality}</Row>}
                  </div>

                  <div style={{ display: 'flex', gap: 7, marginTop: 12, flexWrap: 'wrap' }}>
                    {mapsUrl && <ActionLink href={mapsUrl}>🗺 View on map</ActionLink>}
                    {directionsUrl && <ActionLink href={directionsUrl}>🧭 Directions</ActionLink>}
                    {h.website && <ActionLink href={h.website}>🌐 Website</ActionLink>}
                    {h.phone && h.phone !== 'Not listed' && (
                      <ActionLink href={`tel:${h.phone}`}>📞 Call</ActionLink>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Empty state */}
        {searched && hospitals.length === 0 && (
          <div style={{ textAlign: 'center', padding: '30px 14px', color: MUTED, fontSize: 12.5 }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
            No hospitals found within this radius.<br />Try increasing the search distance.
          </div>
        )}

        {/* Disclaimer */}
        {searched && hospitals.length > 0 && (
          <p style={{
            fontSize: 10.5, color: 'rgba(141,151,163,0.6)', margin: '14px 0 0', lineHeight: 1.5,
          }}>
            Results are fetched live from OpenStreetMap community data. OSM coverage varies — not all
            hospitals may be listed. Opening hours shown only where contributors have added them; always
            call ahead to confirm. Distances are straight-line, not driving distance.
          </p>
        )}
      </div>

      <style>{`
        @keyframes hf-spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

function Row({ icon, children }) {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12, color: MUTED }}>
      <span style={{ flexShrink: 0, width: 16, textAlign: 'center', marginTop: 1 }}>{icon}</span>
      <span style={{ color: INK, opacity: 0.85 }}>{children}</span>
    </div>
  )
}

function ActionLink({ href, children }) {
  return (
    <a
      href={href} target="_blank" rel="noopener noreferrer"
      style={{
        fontSize: 11, fontWeight: 700, textDecoration: 'none', borderRadius: 99,
        padding: '5px 11px', display: 'inline-flex', alignItems: 'center', gap: 5,
        background: 'rgba(251,113,133,0.1)', color: CORAL,
        border: '1px solid rgba(251,113,133,0.25)', transition: 'background 0.15s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(251,113,133,0.18)' }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(251,113,133,0.1)' }}
    >
      {children}
    </a>
  )
}

function spinnerStyle(size, color = 'currentColor') {
  return {
    width: size, height: size, border: `2px solid ${color}`,
    borderTopColor: 'transparent', borderRadius: '50%',
    display: 'inline-block', animation: 'hf-spin 0.7s linear infinite',
  }
}