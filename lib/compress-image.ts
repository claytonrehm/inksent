// Client-side image compression: resizes to a max dimension and re-encodes as
// JPEG. Shrinks 5-12MB phone photos to ~150-300KB so uploads are fast and
// reliable on cellular, and normalizes everything (incl. PNG) to JPEG so it
// displays consistently in the admin.

export async function compressImage(file: File, maxDim = 1200, quality = 0.85): Promise<Blob> {
  // If the browser can't decode it (rare — e.g. some HEIC), fall back to the
  // original file so the upload still happens.
  const dataUrl = await readAsDataURL(file)
  const img = await loadImage(dataUrl).catch(() => null)
  if (!img) return file

  let { width, height } = img
  if (width > maxDim || height > maxDim) {
    if (width >= height) {
      height = Math.round((height * maxDim) / width)
      width = maxDim
    } else {
      width = Math.round((width * maxDim) / height)
      height = maxDim
    }
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return file
  ctx.drawImage(img, 0, 0, width, height)

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob((b) => resolve(b), 'image/jpeg', quality)
  )
  return blob ?? file
}

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}
