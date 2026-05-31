import { strictEqual } from 'node:assert';
import test, { describe } from 'node:test';

import ByteArray from '../src/index.ts';

describe('ByteArray', () => {
    test('can write/read a byte', () => {
        const ba = new ByteArray();

        ba.writeByte(1);
        ba.writeUnsignedByte(2);

        ba.position = 0;

        strictEqual(ba.readByte(), 1);
        strictEqual(ba.readUnsignedByte(), 2);
        strictEqual(ba.position, 2);
    });

    test('can write/read a boolean', () => {
        const ba = new ByteArray();

        ba.writeBoolean(true);
        ba.writeBoolean(false);

        ba.position = 0;

        strictEqual(ba.readBoolean(), true);
        strictEqual(ba.readBoolean(), false);
        strictEqual(ba.position, 2);
    });

    test('can write/read bytes', () => {
        const ba = new ByteArray();

        ba.writeByte(1);
        ba.writeByte(2);
        ba.writeByte(3);
        strictEqual(ba.position, 3);

        const rb = new ByteArray();

        rb.writeBytes(ba);
        rb.position = 0;

        strictEqual(rb.readByte(), 1);
        strictEqual(rb.readByte(), 2);
        strictEqual(rb.readByte(), 3);

        rb.clear();

        rb.writeBytes(ba);
        rb.writeByte(4);
        rb.writeByte(5);
        rb.writeByte(6);

        rb.position = 3;
        rb.readBytes(ba, 3, 3);

        strictEqual(ba.position, 3);
        strictEqual(ba.readByte(), 4);
        strictEqual(ba.readByte(), 5);
        strictEqual(ba.readByte(), 6);
        strictEqual(ba.position, 6);
    });

    test('can write/read a short', () => {
        const ba = new ByteArray();

        ba.writeShort(1);
        ba.writeUnsignedShort(2);

        ba.position = 0;

        strictEqual(ba.readShort(), 1);
        strictEqual(ba.readUnsignedShort(), 2);
        strictEqual(ba.position, 4);
    });

    test('can write/read an int', () => {
        const ba = new ByteArray();

        ba.writeInt(1);
        ba.writeUnsignedInt(2);

        ba.position = 0;

        strictEqual(ba.readInt(), 1);
        strictEqual(ba.readUnsignedInt(), 2);
        strictEqual(ba.position, 8);
    });

    test('can write/read a float/double', () => {
        const ba = new ByteArray();

        ba.writeFloat(1.123);
        ba.writeDouble(2.456);

        ba.position = 0;

        strictEqual(Math.round(ba.readFloat() * 1000) / 1000, 1.123);
        strictEqual(ba.readDouble(), 2.456);
        strictEqual(ba.position, 12);
    });

    test('can write/read a string', () => {
        const ba = new ByteArray();

        ba.writeUTF('Hello World!');
        ba.writeUTFBytes('Hello');
        ba.writeMultiByte('Foo', 'ascii');

        ba.position = 0;

        strictEqual(ba.readUTF(), 'Hello World!');
        strictEqual(ba.readUTFBytes(5), 'Hello');
        strictEqual(ba.readMultiByte(3, 'ascii'), 'Foo');
        strictEqual(ba.position, 22);

        ba.clear();

        ba.writeMultiByte('Hello', 'win1251');

        ba.position = 0;

        strictEqual(ba.readMultiByte(5, 'win1251'), 'Hello');
    });

    test('can compress/uncompress the buffer', () => {
        const ba = new ByteArray();

        ba.writeUTF('Hello World!');
        ba.writeByte(1);
        ba.writeByte(2);
        strictEqual(ba.position, 16);

        ba.compress('deflate');
        strictEqual(ba.position, 18);

        ba.uncompress('deflate');
        strictEqual(ba.position, 0);
        strictEqual(ba.readUTF(), 'Hello World!');
        strictEqual(ba.readByte(), 1);
        strictEqual(ba.readByte(), 2);
        strictEqual(ba.position, 16);

        ba.clear();
        strictEqual(ba.position, 0);

        ba.writeUTF('Hello World!');
        strictEqual(ba.position, 14);

        ba.compress('zlib');
        strictEqual(ba.position, 22);
        strictEqual(ba.buffer[0], 120);
        strictEqual(ba.buffer[1], 218);

        ba.uncompress('zlib');
        strictEqual(ba.position, 0);
        strictEqual(ba.readUTF(), 'Hello World!');
        strictEqual(ba.position, 14);
    });

    test('supports BE/LE', () => {
        const ba = new ByteArray();

        ba.endian = false; // LE
        ba.writeShort(1);

        ba.endian = true; // BE
        ba.writeShort(2);

        ba.position = 0;

        ba.endian = false;
        strictEqual(ba.readShort(), 1);

        ba.endian = true;
        strictEqual(ba.readShort(), 2);
        strictEqual(ba.position, 4);
    });

    test('supports bytesAvailable', () => {
        const ba = new ByteArray();

        ba.writeUTFBytes(
            'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Vivamus etc.'
        );

        ba.position = 0;

        while (ba.bytesAvailable > 0 && ba.readUTFBytes(1) !== 'a') {
            /* empty */
        }

        if (ba.position < ba.bytesAvailable) {
            strictEqual(ba.position, 23);
            strictEqual(ba.bytesAvailable, 47);
        }
    });

    test('supports starting buffers in the constructor', () => {
        const ba = new ByteArray([1, 2, 3]);

        strictEqual(ba.readByte(), 1);
        strictEqual(ba.readByte(), 2);
        strictEqual(ba.readByte(), 3);
        strictEqual(ba.position, 3);

        const buffer = Buffer.alloc(3);

        buffer.writeInt8(1, 0);
        buffer.writeInt8(2, 1);
        buffer.writeInt8(3, 2);

        const ba2 = new ByteArray(buffer);

        strictEqual(ba2.readByte(), 1);
        strictEqual(ba2.readByte(), 2);
        strictEqual(ba2.readByte(), 3);
        strictEqual(ba2.position, 3);
    });

    test('supports a while loop using bytesAvailable', () => {
        const buffer = Buffer.alloc(6);

        buffer.writeInt8(69, 0);
        buffer.writeInt8('F'.charCodeAt(0), 1);
        buffer.writeInt8(69, 2);
        buffer.writeInt8('O'.charCodeAt(0), 3);
        buffer.writeInt8(69, 4);
        buffer.writeInt8('O'.charCodeAt(0), 5);

        const ba = new ByteArray(buffer);
        let str = '';

        while (ba.bytesAvailable > 0) {
            if (ba.readByte() === 69) {
                str += ba.readUTFBytes(1);
            }
        }

        strictEqual(str, 'FOO');
        strictEqual(ba.position, 6);
    });

    test('supports the length property', () => {
        const ba = new ByteArray();

        ba.length = 3;
        strictEqual(ba.length, 3);

        ba.writeByte(1);
        strictEqual(ba.buffer[0], 1);
        strictEqual(ba.position, 1);
        strictEqual(ba.length, 3);
        strictEqual(ba.bytesAvailable, 2);

        ba.clear();
        strictEqual(ba.length, 0);

        ba.length = 1;
        ba.writeUTF('Hello');
        strictEqual(ba.length, 7);

        ba.position = 0;
        strictEqual(ba.readUTF(), 'Hello');
        strictEqual(ba.position, 7);

        ba.clear();
        ba.writeByte(1);
        ba.writeShort(2);
        ba.length = 3;
        strictEqual(ba.buffer[0], 1);
        strictEqual(ba.buffer[2], 2);
        strictEqual(ba.length, 3);
        ba.writeUTF('Hello');

        ba.position = 0;
        strictEqual(ba.readByte(), 1);
        strictEqual(ba.readShort(), 2);
        strictEqual(ba.readUTF(), 'Hello');

        ba.clear();
        ba.length = 1;
        ba.writeInt(5);
        ba.writeUTFBytes('Hello');
        ba.position = 0;
        strictEqual(ba.readInt(), 5);
        strictEqual(ba.readUTFBytes(5), 'Hello');

        ba.clear();
        ba.length = 2;
        ba.writeInt(5);
        ba.writeUTFBytes('Hello');
        ba.position = 0;
        strictEqual(ba.readInt(), 5);
        strictEqual(ba.readUTFBytes(5), 'Hello');

        ba.clear();
        ba.length = 1;
        ba.writeDouble(5);
        ba.writeUTFBytes('Hello');
        ba.position = 0;
        strictEqual(ba.readDouble(), 5);
        strictEqual(ba.readUTFBytes(5), 'Hello');
    });
});
