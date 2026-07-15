function escapeHtmlAttribute(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
}

export function openMultipleProductUrls(urls: string[]): boolean {
  const uniqueUrls = [...new Set(urls.map((url) => url.trim()).filter(Boolean))]
  if (uniqueUrls.length === 0) return false

  if (uniqueUrls.length === 1) {
    window.open(uniqueUrls[0], '_blank', 'noopener,noreferrer')
    return true
  }

  const popup = window.open('about:blank', '_blank')
  if (!popup) return false

  const serializedUrls = JSON.stringify(uniqueUrls)
  const fallbackHtml = [
    `<h2>נפתחו ${uniqueUrls.length} מוצרים</h2>`,
    '<p>אם חלק מהטאבים נחסמו, אפשר ללחוץ על הקישורים למטה:</p>',
    ...uniqueUrls.map(
      (url, index) =>
        `<p>${index + 1}. <a href="${escapeHtmlAttribute(url)}" target="_blank" rel="noopener noreferrer">${escapeHtmlAttribute(url)}</a></p>`,
    ),
  ].join('')

  popup.document.write(`<!DOCTYPE html>
<html lang="he" dir="rtl">
<head>
  <meta charset="utf-8">
  <title>פתיחת מוצרים</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; padding: 24px; color: #444; background: #fdfcfb; }
    h2 { font-weight: 400; margin-bottom: 8px; }
    p { margin: 0 0 12px; line-height: 1.5; }
    a { color: #8b7340; word-break: break-all; }
  </style>
</head>
<body>
  <script>
    (function() {
      var urls = ${serializedUrls};
      urls.forEach(function(url) {
        window.open(url, '_blank', 'noopener,noreferrer');
      });
      document.body.insertAdjacentHTML('afterbegin', ${JSON.stringify(fallbackHtml)});
    })();
  <\/script>
</body>
</html>`)
  popup.document.close()
  popup.opener = null
  return true
}
