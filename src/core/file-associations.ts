/** Maps file extensions to default app IDs */
const associations: Record<string, string> = {
  // Text / Code
  txt: 'text-editor',
  md: 'text-editor',
  js: 'text-editor',
  ts: 'text-editor',
  tsx: 'text-editor',
  jsx: 'text-editor',
  json: 'text-editor',
  css: 'text-editor',
  html: 'text-editor',
  xml: 'text-editor',
  yaml: 'text-editor',
  yml: 'text-editor',
  toml: 'text-editor',
  sh: 'text-editor',
  py: 'text-editor',
  rs: 'text-editor',
  go: 'text-editor',
  // PDF
  pdf: 'pdf-viewer',
  // Images
  png: 'image-viewer',
  jpg: 'image-viewer',
  jpeg: 'image-viewer',
  gif: 'image-viewer',
  svg: 'image-viewer',
  webp: 'image-viewer',
  bmp: 'image-viewer',
  ico: 'image-viewer',
}

export function getDefaultApp(filename: string): string | null {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (!ext) return null
  return associations[ext] ?? null
}

export function isTextFile(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (!ext) return false
  return associations[ext] === 'text-editor'
}

export function isImageFile(filename: string): boolean {
  const ext = filename.split('.').pop()?.toLowerCase()
  if (!ext) return false
  return associations[ext] === 'image-viewer'
}
