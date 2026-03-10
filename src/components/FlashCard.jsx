import { useState, useEffect, useRef } from 'react'
import { fetchGBIFTaxonomy } from '../utils/gbif'
import { fetchProvincePresence } from '../utils/inatProvinces'
import { fetchTaxonPhotos } from '../utils/inatPhotos'
import { fetchBirdCall } from '../utils/xencanto'

// ── Audio player ───────────────────────────────────────────────────────────
function AudioPlayer({ call, active }) {
  const [playing, setPlaying] = useState(false)
  const [ready, setReady]     = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    if (!active) {
      audioRef.current?.pause()
      setPlaying(false)
    }
  }, [active])

  const toggle = () => {
    const audio = audioRef.current
    if (!audio || !ready) return
    if (playing) {
      audio.pause()
      setPlaying(false)
    } else {
      audio.play().then(() => setPlaying(true)).catch(err => console.warn('Audio play failed:', err))
    }
  }

  const stopProp = e => { e.stopPropagation(); e.preventDefault() }

  return (
    <div
      className="flex justify-center"
      onClick={e => e.stopPropagation()}
      onTouchStart={stopProp}
      onTouchEnd={stopProp}
    >
      <button
        onClick={toggle}
        className="w-16 h-16 rounded-full bg-green-600 hover:bg-green-500 active:bg-green-400 flex items-center justify-center transition-colors shadow-lg"
      >
        {!ready ? (
          <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        ) : playing ? (
          <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        )}
      </button>
      <audio
        ref={audioRef}
        src={call.url}
        onEnded={() => setPlaying(false)}
        onCanPlay={() => setReady(true)}
        preload="auto"
      />
    </div>
  )
}

// ── Flash card ─────────────────────────────────────────────────────────────
export default function FlashCard({ species, flipped, onFlip }) {
  const [imgError, setImgError]   = useState(false)
  const [imgLoaded, setImgLoaded] = useState(false)
  const [gbif, setGbif]           = useState(undefined)
  const [provinces, setProvinces] = useState(undefined)
  const [photos, setPhotos]       = useState(null)   // null=not fetched, []=none found, [...]=photos
  const [photoIndex, setPhotoIndex] = useState(0)
  const [call, setCall]           = useState(undefined) // undefined=not fetched, null=not found

  const photosFetchedRef = useRef(false)

  const taxon    = species?.taxon
  const photo    = taxon?.default_photo
  const imageUrl = photo?.medium_url || photo?.url || photo?.square_url

  const commonName = taxon?.preferred_common_name || 'Unknown Bird'
  const sciName    = taxon?.name || ''
  const obsCount   = species?.count?.toLocaleString() || '0'

  // Current photo: use carousel array if loaded, else fall back to default
  const currentPhoto       = photos?.length > 0 ? photos[photoIndex] : null
  const currentImageUrl    = currentPhoto?.url || imageUrl
  const currentAttribution = currentPhoto?.attribution || photo?.attribution

  // Reset all state when species changes
  useEffect(() => {
    setGbif(undefined)
    setProvinces(undefined)
    setImgError(false)
    setImgLoaded(false)
    setPhotos(null)
    setPhotoIndex(0)
    setCall(undefined)
    photosFetchedRef.current = false
  }, [taxon?.id])

  // Fetch extra photos eagerly (as soon as card mounts)
  useEffect(() => {
    if (!taxon?.id || photosFetchedRef.current) return
    photosFetchedRef.current = true
    let cancelled = false
    fetchTaxonPhotos(taxon.id).then(data => {
      if (!cancelled) setPhotos(data)
    })
    return () => { cancelled = true }
  }, [taxon?.id])

  // Fetch GBIF taxonomy when first flipped
  useEffect(() => {
    if (!flipped || !sciName || gbif !== undefined) return
    let cancelled = false
    fetchGBIFTaxonomy(sciName).then(data => { if (!cancelled) setGbif(data) })
    return () => { cancelled = true }
  }, [flipped, sciName])

  // Fetch province presence when first flipped
  useEffect(() => {
    if (!flipped || !taxon?.id || provinces !== undefined) return
    let cancelled = false
    fetchProvincePresence(taxon.id).then(data => { if (!cancelled) setProvinces(data) })
    return () => { cancelled = true }
  }, [flipped, taxon?.id])

  // Fetch bird call when first flipped
  useEffect(() => {
    if (!flipped || !taxon?.id || call !== undefined) return
    let cancelled = false
    fetchBirdCall(taxon.id).then(data => { if (!cancelled) setCall(data) })
    return () => { cancelled = true }
  }, [flipped, taxon?.id])

  const goNext = (e) => {
    e.stopPropagation()
    setImgLoaded(false)
    setImgError(false)
    setPhotoIndex(i => (i + 1) % photos.length)
  }
  const goPrev = (e) => {
    e.stopPropagation()
    setImgLoaded(false)
    setImgError(false)
    setPhotoIndex(i => (i - 1 + photos.length) % photos.length)
  }

  return (
    <div className="card-scene w-full max-w-md" style={{ height: 'min(480px, calc(100dvh - 320px))' }}>
      <div className={`card-inner ${flipped ? 'flipped' : ''}`} onClick={onFlip}>

        {/* ── FRONT — Photo ───────────────────────────────────────────── */}
        <div className="card-face bg-gray-900 shadow-2xl">
          {!imgLoaded && !imgError && (
            <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-green-400 dot-1" />
                <div className="w-3 h-3 rounded-full bg-green-400 dot-2" />
                <div className="w-3 h-3 rounded-full bg-green-400 dot-3" />
              </div>
            </div>
          )}

          {imgError || !currentImageUrl ? (
            <div className="absolute inset-0 bg-gray-800 flex flex-col items-center justify-center text-gray-500">
              <span className="text-6xl mb-3">🐦</span>
              <p className="text-sm">No photo available</p>
            </div>
          ) : (
            <img
              key={currentImageUrl}
              src={currentImageUrl}
              alt="Bird to identify"
              className="card-photo"
              onLoad={() => setImgLoaded(true)}
              onError={() => setImgError(true)}
            />
          )}

          {/* Photo nav arrows + dots (only when multiple photos loaded and on front) */}
          {photos?.length > 1 && !flipped && (
            <>
              <button
                className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center z-10 text-2xl leading-none active:bg-black/70"
                onClick={goPrev}
              >‹</button>
              <button
                className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 backdrop-blur-sm text-white flex items-center justify-center z-10 text-2xl leading-none active:bg-black/70"
                onClick={goNext}
              >›</button>
              <div className="absolute top-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                {photos.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-200 ${i === photoIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/40'}`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />

          {/* Tap hint */}
          <div className="absolute inset-x-0 bottom-4 flex items-center justify-center tap-hint">
            <div className="flex items-center gap-2 bg-black/40 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-full">
              <span>Tap to reveal</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16" />
              </svg>
            </div>
          </div>

        </div>

        {/* ── BACK — Name + Call + Provinces + Taxonomy ───────────────── */}
        <div className="card-face card-back-face bg-gradient-to-br from-emerald-900 via-green-900 to-teal-900 shadow-2xl flex flex-col">
          <div className="absolute inset-0 opacity-5 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

          <div className="relative flex-1 overflow-y-auto flex flex-col items-center px-5 py-5 text-center gap-3">

            {/* Names */}
            <div className="space-y-1 shrink-0">
              <h2 className="text-2xl font-bold text-white leading-tight">{commonName}</h2>
              <p className="text-sm italic text-green-300 font-light">{sciName}</p>
            </div>

            {/* Bird call */}
            <div className="w-full">
              {call === undefined && flipped && (
                <div className="flex items-center justify-center gap-1.5 text-white/25 text-xs">
                  <div className="w-2 h-2 rounded-full bg-white/20 dot-1" />
                  <div className="w-2 h-2 rounded-full bg-white/20 dot-2" />
                  <div className="w-2 h-2 rounded-full bg-white/20 dot-3" />
                  <span>Loading call…</span>
                </div>
              )}
              {call && <AudioPlayer call={call} active={flipped} />}
            </div>

            {/* Province presence */}
            <div className="w-full">
              {provinces === undefined && flipped && (
                <div className="flex items-center justify-center gap-1.5 text-white/25 text-xs">
                  <div className="w-2 h-2 rounded-full bg-white/20 dot-1" />
                  <div className="w-2 h-2 rounded-full bg-white/20 dot-2" />
                  <div className="w-2 h-2 rounded-full bg-white/20 dot-3" />
                  <span>Checking regions…</span>
                </div>
              )}
              {provinces && (
                <div className="space-y-1.5">
                  <p className="text-white/40 text-xs uppercase tracking-widest text-center">Found in</p>
                  <div className="flex flex-wrap gap-1.5 justify-center">
                    {provinces.map(prov => (
                      <span
                        key={prov.key}
                        className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
                          prov.present
                            ? 'bg-green-700/70 text-green-200 border border-green-600/50'
                            : 'bg-white/5 text-white/20 border border-white/5'
                        }`}
                      >
                        {prov.abbr}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* GBIF taxonomy */}
            <div className="w-full">
              {gbif === undefined && flipped && (
                <div className="flex items-center justify-center gap-2 text-white/30 text-xs">
                  <div className="w-3 h-3 rounded-full bg-white/20 dot-1" />
                  <div className="w-3 h-3 rounded-full bg-white/20 dot-2" />
                  <div className="w-3 h-3 rounded-full bg-white/20 dot-3" />
                  <span>Verifying taxonomy…</span>
                </div>
              )}

              {gbif && (
                <div className="bg-white/8 border border-white/10 rounded-xl px-4 py-3 space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    {gbif.family && (
                      <div className="bg-white/5 rounded-lg px-3 py-2">
                        <p className="text-white/40 uppercase tracking-widest text-[10px] mb-0.5">Family</p>
                        <p className="text-white font-medium">{gbif.family}</p>
                      </div>
                    )}
                    {gbif.order && (
                      <div className="bg-white/5 rounded-lg px-3 py-2">
                        <p className="text-white/40 uppercase tracking-widest text-[10px] mb-0.5">Order</p>
                        <p className="text-white font-medium">{gbif.order}</p>
                      </div>
                    )}
                  </div>

                  {gbif.status && gbif.status !== 'ACCEPTED' && (
                    <p className="text-yellow-400/70 text-xs text-center">
                      Taxonomic status: {gbif.status.toLowerCase()}
                    </p>
                  )}
                </div>
              )}

              {gbif === null && (
                <div className="text-white/20 text-xs text-center">
                  GBIF taxonomy not found
                </div>
              )}
            </div>

          </div>

          {/* Footer */}
          <div className="relative px-5 py-2 border-t border-white/10 flex items-center justify-between shrink-0">
            <span className="text-white/30 text-xs">{obsCount} observations</span>
            <span className="text-white/20 text-xs">Tap to flip back</span>
          </div>
        </div>

      </div>
    </div>
  )
}
