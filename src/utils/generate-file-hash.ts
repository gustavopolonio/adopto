import { createHash } from 'node:crypto'
import { Readable } from 'node:stream'

export async function generateFileHash(file: Readable): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256')

    file.on('error', reject)
    file.pipe(hash)

    hash.on('finish', () => resolve(hash.digest('hex')))
    hash.on('error', reject)
  })
}
