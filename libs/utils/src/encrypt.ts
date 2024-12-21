import crypto from 'node:crypto'
import { ALGORITHM } from '@app/types/constants';

export default function(data: string, secret: string, iv: string): string {
  if (secret.length !== 32) {
    throw new Error('Secret key must be 32 char long.');
  }

  const ivBuffer = Buffer.from(iv, 'hex');
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(secret), ivBuffer);
  const encrypted = cipher.update(data);

  return encrypted.toString('hex');
}