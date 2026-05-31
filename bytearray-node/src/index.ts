import {
    deflateRawSync,
    deflateSync,
    inflateRawSync,
    inflateSync
} from 'node:zlib';

import * as iconvModule from 'iconv-lite';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iconv = (iconvModule as any).default || iconvModule;
const { encodingExists, decode, encode } = iconv;

export default class ByteArray {
    public buffer!: Buffer;
    public position!: number;
    public endian!: boolean;

    /**
     * @constructor
     * @param buffer Optional buffer or byte array to initialize with
     */
    public constructor(buffer?: Buffer | number[]) {
        this.reset(buffer);
    }

    public reset(buffer?: Buffer | number[]): void {
        this.buffer = Buffer.isBuffer(buffer)
            ? buffer
            : Array.isArray(buffer)
              ? Buffer.from(buffer)
              : Buffer.alloc(0);
        this.position = 0;
        this.endian = true;
    }

    /**
     * Returns the length of the buffer
     */
    public get length(): number {
        return this.buffer.length;
    }

    /**
     * Returns the endianness as a string
     */
    public get endianStr(): 'BE' | 'LE' {
        return this.endian ? 'BE' : 'LE';
    }

    /**
     * Sets the length of the buffer
     */
    public set length(value: number) {
        if (value === 0) {
            this.clear();
        } else if (value !== this.length) {
            if (value < this.length) {
                this.buffer = this.buffer.subarray(0, value);
                this.position = this.length;
            } else {
                this.expand(value);
            }
        }
    }

    /**
     * Returns the amount of bytes available
     */
    public get bytesAvailable(): number {
        return this.length - this.position;
    }

    /**
     * Reads a buffer function
     */
    public readBufferFunc(func: string, pos: number): number {
        const methodName = (func + this.endianStr) as keyof Buffer;
        const method = this.buffer[methodName];

        if (typeof method === 'function') {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
            const value = (method as Function).call(this.buffer, this.position);
            this.position += pos;
            return value;
        }
        throw new Error(`Method ${String(methodName)} not found on Buffer`);
    }

    /**
     * Writes a buffer function
     */
    public writeBufferFunc(value: number, func: string, pos: number): void {
        this.expand(pos);

        const methodName = (func + this.endianStr) as keyof Buffer;
        const method = this.buffer[methodName];

        if (typeof method === 'function') {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
            (method as Function).call(this.buffer, value, this.position);
            this.position += pos;
        } else {
            throw new TypeError(
                `Method ${String(methodName)} not found on Buffer`
            );
        }
    }

    /**
     * Expands the buffer when needed
     */
    public expand(value: number): void {
        if (this.bytesAvailable < value) {
            const toExpandWith = value - this.bytesAvailable;

            this.buffer = Buffer.concat([
                this.buffer,
                Buffer.alloc(toExpandWith)
            ]);
        }
    }

    /**
     * Clears the buffer and sets the position to 0
     */
    public clear(): void {
        this.buffer = Buffer.alloc(0);
        this.position = 0;
    }

    /**
     * Compresses the buffer
     */
    public compress(algorithm: string): void {
        algorithm = algorithm.toLowerCase();

        if (algorithm === 'zlib')
            this.buffer = deflateSync(this.buffer, { level: 9 });
        else if (algorithm === 'deflate') {
            this.buffer = deflateRawSync(this.buffer);
        } else
            throw new Error(`Invalid compression algorithm: '${algorithm}'.`);

        this.position = this.length;
    }

    /**
     * Reads a boolean
     */
    public readBoolean(): boolean {
        return this.readByte() !== 0;
    }

    /**
     * Reads a signed byte
     */
    public readByte(): number {
        return this.buffer.readInt8(this.position++);
    }

    /**
     * Reads multiple signed bytes from a ByteArray
     */
    public readBytes(
        bytes: ByteArray,
        offset: number = 0,
        length: number = 0
    ): void {
        if (length === 0) {
            length = this.bytesAvailable;
        }

        if (length > this.bytesAvailable) {
            throw new RangeError('End of buffer was encountered.');
        }

        if (bytes.length < offset + length) {
            bytes.expand(offset + length);
        }

        for (let i = 0; i < length; i++) {
            bytes.buffer[i + offset] = this.buffer[i + this.position]!;
        }

        this.position += length;
    }

    /**
     * Reads a double
     */
    public readDouble(): number {
        return this.readBufferFunc('readDouble', 8);
    }

    /**
     * Reads a float
     */
    public readFloat(): number {
        return this.readBufferFunc('readFloat', 4);
    }

    /**
     * Reads a signed int
     */
    public readInt(): number {
        return this.readBufferFunc('readInt32', 4);
    }

    /**
     * Reads a multibyte string
     */
    public readMultiByte(length: number, charset: string = 'utf8'): string {
        const position = this.position;
        this.position += length;

        if (encodingExists(charset)) {
            return decode(
                this.buffer.subarray(position, this.position),
                charset
            );
        } else {
            throw new Error(`Invalid character set: '${charset}'.`);
        }
    }

    /**
     * Reads a signed short
     */
    public readShort(): number {
        return this.readBufferFunc('readInt16', 2);
    }

    /**
     * Reads an unsigned byte
     */
    public readUnsignedByte(): number {
        return this.buffer.readUInt8(this.position++);
    }

    /**
     * Reads an unsigned int
     */
    public readUnsignedInt(): number {
        return this.readBufferFunc('readUInt32', 4);
    }

    /**
     * Reads an unsigned short
     */
    public readUnsignedShort(): number {
        return this.readBufferFunc('readUInt16', 2);
    }

    /**
     * Reads a UTF-8 string
     */
    public readUTF(): string {
        return this.readMultiByte(this.readUnsignedShort());
    }

    /**
     * Reads UTF-8 bytes
     */
    public readUTFBytes(length: number): string {
        return this.readMultiByte(length);
    }

    /**
     * Converts the buffer to JSON
     */
    public toJSON(): { type: 'Buffer'; data: number[] } {
        return this.buffer.toJSON();
    }

    /**
     * Converts the buffer to a string
     */
    public toString(): string {
        return this.buffer.toString('utf8');
    }

    /**
     * Decompresses the buffer
     */
    public uncompress(algorithm: string): void {
        algorithm = algorithm.toLowerCase();

        if (algorithm === 'zlib') {
            this.buffer = inflateSync(this.buffer, { level: 9 });
        } else if (algorithm === 'deflate') {
            this.buffer = inflateRawSync(this.buffer);
        } else {
            throw new Error(`Invalid decompression algorithm: '${algorithm}'.`);
        }

        this.position = 0;
    }

    /**
     * Writes a boolean
     */
    public writeBoolean(value: boolean): void {
        this.writeByte(value ? 1 : 0);
    }

    /**
     * Writes a signed byte
     */
    public writeByte(value: number): void {
        this.expand(1);
        this.buffer.writeInt8(value, this.position++);
    }

    /**
     * Writes multiple signed bytes to a ByteArray
     */
    public writeBytes(
        bytes: ByteArray,
        offset: number = 0,
        length: number = 0
    ): void {
        if (length === 0) {
            length = bytes.length - offset;
        }

        this.expand(length);

        for (let i = 0; i < length; i++) {
            this.buffer[i + this.position] = bytes.buffer[i + offset]!;
        }

        this.position += length;
    }

    /**
     * Writes a double
     */
    public writeDouble(value: number): void {
        this.writeBufferFunc(value, 'writeDouble', 8);
    }

    /**
     * Writes a float
     */
    public writeFloat(value: number): void {
        this.writeBufferFunc(value, 'writeFloat', 4);
    }

    /**
     * Writes a signed int
     */
    public writeInt(value: number): void {
        this.writeBufferFunc(value, 'writeInt32', 4);
    }

    /**
     * Writes a multibyte string
     */
    public writeMultiByte(value: string, charset = 'utf8'): void {
        this.position += Buffer.byteLength(value);

        if (encodingExists(charset))
            this.buffer = Buffer.concat([this.buffer, encode(value, charset)]);
        else throw new Error(`Invalid character set: '${charset}'.`);
    }

    /**
     * Writes a signed short
     */
    public writeShort(value: number): void {
        this.writeBufferFunc(value, 'writeInt16', 2);
    }

    /**
     * Writes an unsigned byte
     */
    public writeUnsignedByte(value: number): void {
        this.expand(1);
        this.buffer.writeUInt8(value, this.position++);
    }

    /**
     * Writes an unsigned int
     */
    public writeUnsignedInt(value: number): void {
        this.writeBufferFunc(value, 'writeUInt32', 4);
    }

    /**
     * Writes an unsigned short
     */
    public writeUnsignedShort(value: number): void {
        this.writeBufferFunc(value, 'writeUInt16', 2);
    }

    /**
     * Writes a UTF-8 string
     */
    public writeUTF(value: string): void {
        this.writeUnsignedShort(Buffer.byteLength(value));
        this.writeMultiByte(value);
    }

    /**
     * Writes UTF-8 bytes
     */
    public writeUTFBytes(value: string): void {
        this.writeMultiByte(value);
    }
}
