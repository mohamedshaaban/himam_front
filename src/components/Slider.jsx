import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import useLocalizedQuery from '../api/useLocalizedQuery.js'
import { isRtl } from '../i18n'

/**
 * The carousel used across the app. Pass `items` directly, or a `screen` name
 * to have it fetch that screen's slides from the API.
 */
export default function Slider({ screen, items, height }) {
  const { t, i18n } = useTranslation()
  const [index, setIndex] = useState(0)

  const query = useLocalizedQuery(['slides', screen], `/slides/${screen}`, {
    enabled: Boolean(screen) && !items,
    select: (body) => body.data,
  })

  const slides = items ?? query.data ?? []

  // A language change can shorten the list; keep the index in range.
  useEffect(() => {
    if (index >= slides.length) setIndex(0)
  }, [slides.length, index])

  if (slides.length === 0) return null

  const current = slides[Math.min(index, slides.length - 1)]
  const many = slides.length > 1
  const step = (delta) => setIndex((value) => (value + delta + slides.length) % slides.length)

  // In RTL the on-screen "previous" arrow points the other way, so the chevron
  // glyphs swap while the actions stay the same.
  const rtl = isRtl(i18n.language)

  return (
    <figure className="slider">
      <div className="slider__frame">
        <div className="plate slider__plate">
          <img
            className="slider__image"
            src={current.image}
            alt={current.caption ?? ''}
            style={height ? { height } : undefined}
            loading="lazy"
          />
        </div>

        {current.href && (
          <a className="slider__play" href={current.href} target="_blank" rel="noopener noreferrer" aria-label={current.caption ?? ''}>
            <span>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </a>
        )}

        {many && (
          <>
            <button type="button" className="slider__nav slider__nav--prev" onClick={() => step(-1)} aria-label={t('actions.previous')}>
              <Chevron dir={rtl ? 'right' : 'left'} />
            </button>
            <button type="button" className="slider__nav slider__nav--next" onClick={() => step(1)} aria-label={t('actions.next')}>
              <Chevron dir={rtl ? 'left' : 'right'} />
            </button>
          </>
        )}
      </div>

      <figcaption className="slider__caption">
        <span style={{ flex: 1, minWidth: 0 }}>{current.caption}</span>
        {many && (
          <span className="slider__dots">
            {slides.map((slide, position) => (
              <button
                key={slide.id ?? position}
                type="button"
                className="slider__dot"
                aria-current={position === index}
                aria-label={`${position + 1} / ${slides.length}`}
                onClick={() => setIndex(position)}
              />
            ))}
          </span>
        )}
      </figcaption>
    </figure>
  )
}

function Chevron({ dir }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={dir === 'left' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} />
    </svg>
  )
}
