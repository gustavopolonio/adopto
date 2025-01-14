export interface FileStorageProvider {
  upload(
    petId: string,
    file: Buffer,
    filename: string,
    mimetype: string,
  ): Promise<{ fileUrl: string | null; fileKey: string | null }>
  remove(key: string): Promise<void>
}
