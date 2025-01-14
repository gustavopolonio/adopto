import { createHash } from 'node:crypto'

export function generateFileHash(buffer: Buffer): string {
  const hash = createHash('sha256')
  hash.update(buffer)
  return hash.digest('hex')
}
