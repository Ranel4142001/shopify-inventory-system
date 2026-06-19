export function uuidToBin(uuid: string): Buffer {
  const hex = uuid.replace(/-/g, '');
  if (hex.length !== 32) {
    throw new Error(`Invalid UUID string: ${uuid}`);
  }
  return Buffer.from(hex, 'hex');
}

export function binToUuid(bin: any): string {
  if (!bin) return '';
  let buf: Buffer;
  if (Buffer.isBuffer(bin)) {
    buf = bin;
  } else if (typeof bin === 'string') {
    if (bin.length === 36 && bin.includes('-')) return bin;
    buf = Buffer.from(bin, bin.length === 32 ? 'hex' : 'binary');
  } else {
    buf = Buffer.from(bin);
  }

  if (buf.length !== 16) {
    return buf.toString('hex');
  }

  const hex = buf.toString('hex');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}
