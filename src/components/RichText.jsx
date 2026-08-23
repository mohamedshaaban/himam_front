import { useMemo } from 'react'
import DOMPurify from 'dompurify'

/**
 * Renders section content that may be either HTML or plain text.
 *
 * The editor produces HTML, but everything seeded before it existed is plain
 * text with blank-line paragraph breaks — and an author can still paste plain
 * text in. Rather than migrate the data, this detects which it is: markup goes
 * through the sanitiser, plain text is split into paragraphs as before.
 *
 * The sanitiser is not optional. This content is written by administrators and
 * read by everyone, so a stored script would run in every reader's session.
 * Allowing only presentational markup keeps that door shut even if an admin
 * account is compromised.
 */
const ALLOWED_TAGS = [
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's',
  'h2', 'h3', 'h4', 'blockquote', 'ul', 'ol', 'li',
  'a', 'figure', 'figcaption', 'img',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
]

const looksLikeHtml = (value) => /<\/?[a-z][\s\S]*>/i.test(value)

export default function RichText({ html, className, style }) {
  const content = (html ?? '').trim()

  const clean = useMemo(() => {
    if (!content || !looksLikeHtml(content)) return null

    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS,
      ALLOWED_ATTR: ['href', 'title', 'target', 'rel', 'src', 'alt', 'colspan', 'rowspan'],
      // Blocks javascript: and data: URLs in links and images.
      ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|tel:|\/|\.\/|#)/i,
    })
  }, [content])

  if (!content) return null

  if (clean !== null) {
    return (
      <div
        className={`rich-text ${className ?? ''}`.trim()}
        style={style}
        // Safe: the value above passed through DOMPurify with an explicit allow-list.
        dangerouslySetInnerHTML={{ __html: clean }}
      />
    )
  }

  return (
    <div className={className} style={style}>
      {content.split(/\n{2,}/).filter(Boolean).map((paragraph, index) => (
        <p key={index}>{paragraph}</p>
      ))}
    </div>
  )
}
