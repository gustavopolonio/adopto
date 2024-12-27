import * as fs from 'fs'
import { createHash } from 'crypto'

export function generateFileHash(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath)
  const hash = createHash('sha256')
  hash.update(fileBuffer)
  return hash.digest('hex')
}
