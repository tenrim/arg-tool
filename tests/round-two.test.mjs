import test from 'node:test';
import assert from 'node:assert/strict';
import { detectPitch, theory, segmentsToMelody } from '../public/round2/music-engine.js';
import { compareImages, colorValues } from '../public/round2/image-engine.js';
import {
  listArchive,
  extractArchive,
  createArchive,
  crc32,
} from '../public/round2/archive-engine.js';
import { gzipSync } from '../public/vendor/round2/fflate.js';
import {
  coordinate,
  convertPoint,
  reversePoint,
  distanceBearing,
  timeValue,
  formatTime,
  dms,
} from '../public/round2/coordinates-engine.js';
import { Midi } from '../public/vendor/round2/midi.js';
import { crc32 as independentCRC } from 'node:zlib';
import { readSet } from '../public/file-workbench/model.js';

test('ZIP 文件名遵循 UTF-8、校验过的 Unicode 扩展及 CP437，旧中文编码显式选择', async () => {
  // Independent stored ZIP fixture, payload "abc" has the published CRC 352441c2.
  const fixture = (name, flags = 0, extra = Buffer.alloc(0)) => {
    const raw = Buffer.from(name),
      local = Buffer.alloc(30),
      central = Buffer.alloc(46),
      end = Buffer.alloc(22);
    local.writeUInt32LE(0x04034b50);
    local.writeUInt16LE(flags, 6);
    local.writeUInt32LE(0x352441c2, 14);
    local.writeUInt32LE(3, 18);
    local.writeUInt32LE(3, 22);
    local.writeUInt16LE(raw.length, 26);
    central.writeUInt32LE(0x02014b50);
    central.writeUInt16LE(flags, 8);
    central.writeUInt32LE(0x352441c2, 16);
    central.writeUInt32LE(3, 20);
    central.writeUInt32LE(3, 24);
    central.writeUInt16LE(raw.length, 28);
    central.writeUInt16LE(extra.length, 30);
    const body = Buffer.concat([local, raw, Buffer.from('abc')]);
    const directory = Buffer.concat([central, raw, extra]);
    end.writeUInt32LE(0x06054b50);
    end.writeUInt16LE(1, 8);
    end.writeUInt16LE(1, 10);
    end.writeUInt32LE(directory.length, 12);
    end.writeUInt32LE(body.length, 16);
    return Buffer.concat([body, directory, end]);
  };
  const cp437 = fixture([0x82, 46, 116, 120, 116]);
  assert.equal(listArchive(cp437).entries[0].name, 'é.txt');
  assert.equal(extractArchive(cp437, 0).name, 'é.txt');
  assert.equal(Buffer.from(extractArchive(cp437, 0).bytes).toString(), 'abc');
  const oldChinese = fixture([0xd6, 0xd0, 46, 116, 120, 116]);
  assert.equal(listArchive(oldChinese, 'gb18030').entries[0].name, '中.txt');
  assert.equal(
    (await readSet([{ name: 'a.zip', bytes: oldChinese }], true, () => {}, 'gb18030'))[0].path,
    '中.txt',
  );
  const utf8 = fixture(Buffer.from('中.txt'), 2048);
  assert.equal(listArchive(utf8, 'shift_jis').entries[0].name, '中.txt');
  assert.throws(() => listArchive(fixture([255], 2048)));
  const name = Buffer.from('fallback.txt'),
    unicode = Buffer.from('线索.txt');
  const header = Buffer.alloc(9);
  header.writeUInt16LE(0x7075);
  header.writeUInt16LE(5 + unicode.length, 2);
  header[4] = 1;
  header.writeUInt32LE(independentCRC(name), 5);
  assert.equal(
    listArchive(fixture(name, 0, Buffer.concat([header, unicode]))).entries[0].name,
    '线索.txt',
  );
  header[5] ^= 1;
  assert.equal(
    listArchive(fixture(name, 0, Buffer.concat([header, unicode]))).entries[0].name,
    'fallback.txt',
  );
  assert.throws(() => listArchive(fixture(name, 0, Buffer.from([0x75, 0x70, 99, 0]))), /扩展字段/);
});
test('Pitchy finds A4, silence remains rest, Tonal gives actual notes', () => {
  const rate = 44100,
    samples = Float32Array.from(
      { length: rate },
      (_, i) => 0.4 * Math.sin((2 * Math.PI * 440 * i) / rate),
    );
  const segments = detectPitch(samples, rate);
  assert.ok(
    segments.some(
      (s) => s.note === 'A4' && Math.abs(s.frequency - 440) < 1 && s.end - s.start > 0.8,
    ),
  );
  assert.ok(detectPitch(new Float32Array(rate), rate).every((s) => s.note === 'R'));
  assert.deepEqual(theory('chord', 'Am').notes, ['A', 'C', 'E']);
  assert.deepEqual(theory('scale', 'C', 'major').notes, ['C', 'D', 'E', 'F', 'G', 'A', 'B']);
  assert.match(theory('notes', 'C4 E4 G4').text, /261.626/);
  assert.equal(
    segmentsToMelody(
      [
        { start: 0, end: 0.5, note: 'A4' },
        { start: 0.5, end: 1, note: 'R' },
      ],
      120,
    ),
    'A4:1 R:1',
  );
});
test('MIDI serializes real note times and tempo', () => {
  const midi = new Midi();
  midi.header.setTempo(120);
  midi.addTrack().addNote({ name: 'C4', time: 0.5, duration: 1, velocity: 0.8 });
  const parsed = new Midi(midi.toArray());
  assert.equal(parsed.tracks[0].notes[0].name, 'C4');
  assert.equal(parsed.tracks[0].notes[0].time, 0.5);
  assert.equal(parsed.tracks[0].notes[0].duration, 1);
});
test('Image comparison and color conversions use exact pixel values', () => {
  const a = new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255]),
    b = new Uint8ClampedArray([0, 0, 0, 255, 0, 255, 0, 255]);
  assert.deepEqual(
    [...compareImages(a, b, 2, 1, 'difference').pixels],
    [255, 0, 0, 255, 0, 0, 0, 255],
  );
  assert.equal(compareImages(a, b, 2, 1, 'perceptual', 0.5, 0.1).changed, 1);
  assert.equal(compareImages(a, a, 2, 1, 'perceptual').changed, 0);
  assert.throws(() => compareImages(a, b, 1, 1, 'xor'), /尺寸/);
  assert.match(colorValues([255, 0, 0, 128]), /HEX #ff0000/);
  assert.match(colorValues([255, 0, 0, 128]), /Alpha 0.502/);
});
test('ZIP and GZIP round trips, corruption and bounds fail explicitly', () => {
  const text = new TextEncoder().encode('ARG 第二轮'),
    zip = createArchive([{ name: '线索.txt', bytes: text }]);
  const list = listArchive(zip);
  assert.equal(list.entries[0].name, '线索.txt');
  assert.deepEqual(extractArchive(zip, 0).bytes, text);
  assert.deepEqual(extractArchive(gzipSync(text), 0).bytes, text);
  const broken = zip.slice();
  broken[30 + new DataView(zip.buffer).getUint16(26, true)] ^= 255;
  assert.throws(() => extractArchive(broken, 0));
  assert.throws(() => listArchive(new Uint8Array(2)), /目录/);
  assert.throws(
    () =>
      createArchive([
        { name: 'a', bytes: text },
        { name: 'a', bytes: text },
      ]),
    /同名/,
  );
  assert.equal(crc32(new TextEncoder().encode('123456789')), 0xcbf43926);
  const huge = zip.slice(),
    v = new DataView(huge.buffer);
  for (let i = 0; i < huge.length - 46; i++)
    if (v.getUint32(i, true) === 0x02014b50) {
      v.setUint32(i + 24, 33 * 1024 * 1024, true);
      break;
    }
  assert.throws(() => extractArchive(huge, 0), /32 MB/);
});
test('Coordinates round-trip UTM/MGRS/geohash and hemisphere notation', () => {
  assert.equal(coordinate('39°54′0″N', true), 39.9);
  assert.equal(coordinate('0°30′0″S', true), -0.5);
  assert.equal(coordinate('116.4E', false), 116.4);
  assert.throws(() => coordinate('39N', false), /纬度/);
  assert.throws(() => coordinate('91', true));
  const point = convertPoint(39.9, 116.4);
  assert.equal(point.zone, 50);
  const utm = reversePoint('utm', `50 N ${point.utm[0]} ${point.utm[1]}`);
  assert.ok(Math.abs(utm.lat - 39.9) < 1e-6);
  for (const type of ['mgrs', 'geohash'])
    assert.ok(Math.abs(reversePoint(type, point[type]).lat - 39.9) < 1e-4);
  assert.equal(convertPoint(-33.86, 151.2).hemisphere, 'S');
  assert.equal(convertPoint(89, 10).utm, null);
  assert.match(dms(12.999999999, false), /^13°0′0.000″E$/);
  const distance = distanceBearing(0, 0, 0, 1);
  assert.ok(Math.abs(distance.distance - 111.195) < 0.001);
  assert.equal(distance.bearing, 90);
});
test('Time offsets, epoch units, leap years, Julian day and DST', () => {
  assert.equal(timeValue('iso', '1970-01-01T08:00:00+08:00'), 0);
  assert.equal(timeValue('jd', '2440587.5'), 0);
  assert.equal(timeValue('mjd', '40587'), 0);
  assert.equal(timeValue('milliseconds', '1234'), 1234);
  assert.equal(timeValue('seconds', '1.234'), 1234);
  assert.throws(() => timeValue('iso', '2026-02-29T12:00:00Z'), /不存在/);
  assert.throws(() => timeValue('iso', '2026-10-08T12:00:00'), /时区/);
  assert.match(
    formatTime(timeValue('iso', '2026-07-01T12:00:00Z'), 'America/New_York').local,
    /GMT-04:00/,
  );
  assert.match(
    formatTime(timeValue('iso', '2026-01-01T12:00:00Z'), 'America/New_York').local,
    /GMT-05:00/,
  );
});

test('Streaming decompression stops a small archive at the actual output cap', () => {
  const packed = gzipSync(new Uint8Array(33 * 1024 * 1024));
  assert.ok(packed.length < 40000);
  assert.throws(() => extractArchive(packed, 0), /解压内容超过 32 MB/);
});
