import { customType } from 'drizzle-orm/mysql-core';

export const binary16 = (name: string) => customType<{ data: string; driverData: Buffer }>({
  dataType() {
    return 'binary(16)';
  },
  toDriver(val: string): Buffer {
    const hex = val.replace(/-/g, '');
    if (hex.length !== 32) {
      throw new Error(`Invalid UUID string: ${val}`);
    }
    return Buffer.from(hex, 'hex');
  },
  fromDriver(val: unknown): string {
    if (!val) return '';
    let buf: Buffer;
    if (Buffer.isBuffer(val)) {
      buf = val;
    } else if (typeof val === 'string') {
      buf = Buffer.from(val, 'binary');
    } else {
      buf = Buffer.from(val as any);
    }
    if (buf.length !== 16) {
      return buf.toString('hex');
    }
    const hex = buf.toString('hex');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }
})(name);
