import { mkdir, readFile, unlink, writeFile } from 'fs/promises';
import path from 'path';

// Local-disk storage. To move to S3/R2, keep this interface and swap the implementation.
export interface Storage {
    save(key: string, data: Buffer): Promise<void>;
    read(key: string): Promise<Buffer>;
    remove(key: string): Promise<void>;
}

const ROOT = path.join(process.cwd(), 'uploads');

// Keys are generated server-side, but never let one escape the uploads folder.
const resolve = (key: string) => {
    const file = path.join(ROOT, key);
    if (!file.startsWith(ROOT + path.sep)) throw new Error('Invalid storage key');
    return file;
};

export const storage: Storage = {
    async save(key, data) {
        await mkdir(ROOT, { recursive: true });
        await writeFile(resolve(key), data);
    },
    read: (key) => readFile(resolve(key)),
    remove: (key) => unlink(resolve(key)).catch(() => undefined),
};
