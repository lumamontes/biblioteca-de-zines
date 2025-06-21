'use server'

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"

const s3Secrets = {
  region: process.env.AWS_DEFAULT_REGION || 'us-east-1',
  endpoint: process.env.AWS_ENDPOINT,
  forcePathStyle: true,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
}

console.log('S3 Config:', {
  ...s3Secrets,
  credentials: { accessKeyId: s3Secrets.credentials.accessKeyId, secretAccessKey: '[HIDDEN]' }
})

const s3 = new S3Client(s3Secrets)

/**
 * @param file Arquivo do tipo `File` (via FormData)
 * @param key Caminho no bucket (ex: zines/16984293823_file.pdf)
 * @returns URL pública acessível ao usuário
 */
export async function uploadToS3(file: File, key: string): Promise<string> {
  try {
    const buffer = Buffer.from(await file.arrayBuffer())

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET!,
      Key: key,
      Body: buffer,
      ContentType: file.type,
    })

    await s3.send(command)

    const publicUrl = process.env.AWS_PUBLIC_BASE_URL
      ? `${process.env.AWS_PUBLIC_BASE_URL}/${key}`
      : `${process.env.AWS_ENDPOINT}/${process.env.AWS_BUCKET}/${key}`

    console.log('Upload successful:', publicUrl)
    return publicUrl
  } catch (error) {
    console.error('Upload error:', error)
    throw new Error(`Erro no upload: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
  }
}

