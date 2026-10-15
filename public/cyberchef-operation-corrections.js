// Operation-level compatibility for the pinned CyberChef 11.5.0 runtime.
// These corrections run inside the shared ChefWorker, so native tasks and
// complete recipes receive identical bytes. The upstream bundle on disk is
// unchanged; this file does not patch display text or suppress failed modes.
//
// ExtractLSB's Column branch indexes interleaved RGBA as row*width*4 + col +
// channel*4. The correct location is (row*width + col)*4 + channel. Reuse the
// original Row decoder/bit selection and transpose only the resulting bits.
// This retains Jimp's supported input formats, selected channel order, bit
// numbering and fromBinary's right-aligned final partial byte. PNG dimensions
// come from IHDR (PNG specification §11.2.2); other images are decoded by the
// existing, unmodified Convert Image Format operation to obtain PNG dimensions.
//
// TCPIPChecksum folds the accumulated sum only once and uses a signed 32-bit
// shift. A second carry can remain (FFFF FFFF 0001), and sufficiently long
// input can overflow that shift. RFC 1071 §1 requires one's-complement addition
// with end-around carry: fold while adding each network-order 16-bit word,
// including a final high-order byte for odd input. Preserve Utils.hex's existing
// lowercase output with a minimum of two digits.
//
// ChiSquare omits unobserved byte values even though every one of the 256
// classes has expectation N/256. Pearson's sum includes those zero-frequency
// classes. Its equivalent sum(O_i^2)/E - N includes their contribution without
// repeatedly adding small floating-point terms. Counts/squares remain exact
// integers within the client's 32 MB limit. Keep the old empty-input sentinel
// 0 for protocol compatibility; it is not a meaningful chi-square sample.
//
// AMF3's pinned @astronautlabs/amf 0.0.6 factory assigns value to getter-only
// literal nodes, omits ArrayValue's setter, and constructs the associative-array
// terminator before its embedded string node. Capture this library's class
// registration only during the exact Encodings module's synchronous import,
// restoring Object.defineProperty in finally even if import fails. Fully check
// factory ownership, variants, markers and field syntax before changing only
// those AMF3 prototypes. Reuse the original factories and byte serializer, keep
// immutable literal getters and the decoder's existing node-tree output. If
// any shape check fails, leave the original error/behaviour intact.
// AMF0's string/value and property-key setters store UTF-16 code-unit lengths,
// but their existing serializer writes UTF-8 bytes. Fix only those measured
// lengths and the short/long-string factory boundary (65535 UTF-8 bytes).
// The original serializers, node classes and Decoder output remain in place.
// Both AMF versions delimit strings/property names by UTF-8 byte length. The
// pinned StringSerializer instead inherits BitstreamReader's C-string default,
// truncating a correctly encoded embedded NUL. After validating all four AMF
// fields and their shared serializer, set only their nullTerminated option to
// false. No global Reader behaviour, byte encoder or output schema is changed.
(() => {
  const installed = new WeakSet();
  const amfInstalled = new WeakSet();

  function inspectAMF0(roots) {
    const candidates = [...roots].filter(Type => typeof Type === 'function' &&
      ['any', 'number', 'boolean', 'string', 'object', 'array', 'associativeArray'].every(name =>
        Object.hasOwn(Type, name) && typeof Type[name] === 'function') && !Object.hasOwn(Type, 'int'));
    if (candidates.length !== 1 || amfInstalled.has(candidates[0])) return null;
    const Value = candidates[0], variants = Object.hasOwn(Value, 'ownVariants') && Value.ownVariants;
    if (!Array.isArray(variants) || variants.length !== 15 || variants.some(item =>
      typeof item?.type !== 'function' || typeof item.discriminant !== 'function')) return null;
    const markers = [0, 1, 2, undefined, 5, 6, 7, 9, 11, 12, 13, 14, 4, 15, 17];
    for (let index = 0; index < variants.length; index++) {
      const node = new variants[index].type();
      if (!(node instanceof Value) || node.marker !== markers[index]) return null;
    }
    const number = Value.number(1), boolean = Value.boolean(false), empty = Value.string('');
    if (number.marker !== 0 || variants[0].type !== number.constructor ||
      boolean.marker !== 1 || variants[1].type !== boolean.constructor ||
      empty.marker !== 2 || variants[2].type !== empty.constructor || empty.value !== '') return null;
    const ShortString = variants[2].type, LongString = variants[9].type;
    const long = new LongString().with({value: 'A'});
    if (long.marker !== 12 || long.value !== 'A' || !variants[2].discriminant(empty) || !variants[9].discriminant(long)) return null;
    const strings = [];
    for (const [Type, node, field, width] of [[ShortString, empty, 'length', 16], [LongString, long, '_length', 32]]) {
      const descriptor = Object.getOwnPropertyDescriptor(Type.prototype, 'value'), syntax = Type.syntax;
      if (Object.getPrototypeOf(Type.prototype) !== Value.prototype || !descriptor?.configurable ||
        typeof descriptor.get !== 'function' || typeof descriptor.set !== 'function' ||
        !Array.isArray(syntax) || syntax.length !== 3 ||
        syntax[0].name !== 'marker' || syntax[0].type !== Number || syntax[0].length !== 8 ||
        syntax[1].name !== field || syntax[1].type !== Number || syntax[1].length !== width ||
        typeof syntax[1].options?.writtenValue !== 'function' || syntax[1].options.writtenValue({value: '你'}) !== 3 ||
        syntax[2].name !== '$value' || syntax[2].type !== String || typeof syntax[2].length !== 'function' ||
        syntax[2].length(node) !== node[field] || syntax[2].options?.string?.encoding !== 'utf-8' ||
        typeof syntax[2].options?.serializer?.read !== 'function' || typeof syntax[2].options?.serializer?.write !== 'function') return null;
      strings.push({Type, descriptor, field});
    }
    const object = Value.object({a: null}), properties = object.properties;
    if (object.marker !== 3 || !Array.isArray(properties) || properties.length !== 1 ||
      properties[0].key !== 'a' || properties[0].value.marker !== 5) return null;
    const Property = properties[0].constructor, key = Object.getOwnPropertyDescriptor(Property.prototype, 'key'), syntax = Property.syntax;
    const objectField = object.constructor.syntax.find(field => field.name === 'properties');
    if (objectField?.options?.array?.type !== Property || !key?.configurable ||
      typeof key.get !== 'function' || typeof key.set !== 'function' || !Array.isArray(syntax) || syntax.length !== 3 ||
      syntax[0].name !== 'keyLength' || syntax[0].type !== Number || syntax[0].length !== 16 ||
      typeof syntax[0].options?.writtenValue !== 'function' || syntax[0].options.writtenValue({key: '你'}) !== 3 ||
      syntax[1].name !== 'key' || syntax[1].type !== String || typeof syntax[1].length !== 'function' ||
      syntax[1].options?.string?.encoding !== 'utf-8' || syntax[2].name !== 'value' || syntax[2].type !== Value || syntax[2].length !== 0) return null;
    const factory = Object.getOwnPropertyDescriptor(Value, 'string');
    if (!factory?.writable || !factory.configurable || typeof factory.value !== 'function') return null;
    return {Value, ShortString, LongString, Property, key, strings, factory};
  }

  function patchAMF0(shape) {
    if (!shape) return;
    const {Value, ShortString, LongString, Property, key, strings, factory} = shape;
    const encoder = new TextEncoder();
    for (const {Type, descriptor, field} of strings) Object.defineProperty(Type.prototype, 'value', {...descriptor, set(value) {
      descriptor.set.call(this, value);
      this[field] = encoder.encode(value).length;
    }});
    Object.defineProperty(Property.prototype, 'key', {...key, set(value) {
      key.set.call(this, value);
      const bytes = encoder.encode(value).length;
      if (bytes > 0xffff) throw new RangeError('AMF0 对象属性名不能超过 65535 个 UTF-8 字节。');
      this.keyLength = bytes;
    }});
    Object.defineProperty(Value, 'string', {...factory, value(value) {
      if (typeof value !== 'string') return new ShortString().with({value});
      const Type = encoder.encode(value).length > 0xffff ? LongString : ShortString;
      return new Type().with({value});
    }});
    amfInstalled.add(Value);
  }

  function inspectAMF3(roots) {
    const candidates = [...roots].filter(Type => typeof Type === 'function' &&
      ['any', 'int', 'array', 'boolean', 'double', 'string', 'object'].every(name =>
        Object.hasOwn(Type, name) && typeof Type[name] === 'function') && !Object.hasOwn(Type, 'number'));
    if (candidates.length !== 1 || amfInstalled.has(candidates[0])) return null;
    const Value = candidates[0];
    const variants = Object.hasOwn(Value, 'ownVariants') && Value.ownVariants;
    if (!Array.isArray(variants) || variants.length !== 7 || variants.some(item =>
      typeof item?.type !== 'function' || typeof item.discriminant !== 'function')) return null;
    const expected = [undefined, null, false, true];
    const nodes = [Value.undefined, Value.null, Value.boolean(false), Value.boolean(true)];
    const descriptors = [];
    for (let marker = 0; marker < nodes.length; marker++) {
      const node = nodes[marker], prototype = Object.getPrototypeOf(node);
      const descriptor = Object.getOwnPropertyDescriptor(prototype, 'value');
      if (node.marker !== marker || !(node instanceof Value) ||
        Object.getPrototypeOf(prototype) !== Value.prototype ||
        !descriptor || typeof descriptor.get !== 'function' || descriptor.set !== undefined ||
        !descriptor.configurable || !Object.is(descriptor.get.call(node), expected[marker]) ||
        variants[marker].type !== node.constructor || !variants[marker].discriminant(node)) return null;
      descriptors.push({prototype, descriptor});
    }
    const integer = Value.int(1), double = Value.double(1), string = Value.string(''), array = Value.array([]);
    if (integer.marker !== 4 || double.marker !== 5 || string.marker !== 6 || array.marker !== 9 ||
      variants[4].type !== integer.constructor || variants[5].type !== double.constructor ||
      !variants[4].discriminant(integer) || !variants[5].discriminant(double) ||
      new variants[6].type().marker !== undefined || !variants[6].discriminant(array) ||
      !(array instanceof variants[6].type)) return null;
    const ArrayType = array.constructor;
    if (Object.hasOwn(ArrayType.prototype, 'value') || !Object.isExtensible(ArrayType.prototype)) return null;
    const syntax = ArrayType.syntax;
    if (!Array.isArray(syntax) || syntax.length !== 4 ||
      syntax[0].name !== 'marker' || syntax[0].length !== 8 ||
      syntax[1].name !== '$denseLengthOrReference' || syntax[1].length !== 0 ||
      syntax[2].name !== 'associativeValues' || syntax[2].type !== Array || syntax[2].length !== 0 ||
      syntax[3].name !== '$values' || syntax[3].type !== Array ||
      syntax[3].options?.array?.type !== Value || typeof syntax[3].length !== 'function') return null;
    const AssociativeType = syntax[2].options?.array?.type;
    const StringType = string.stringOrReference?.constructor;
    if (typeof AssociativeType !== 'function' || typeof StringType !== 'function') return null;
    const assocSyntax = AssociativeType.syntax, stringSyntax = StringType.syntax;
    const key = Object.getOwnPropertyDescriptor(AssociativeType.prototype, 'key');
    if (assocSyntax?.length !== 2 || assocSyntax[0].name !== '$key' ||
      assocSyntax[0].type !== StringType || assocSyntax[1].name !== 'value' ||
      assocSyntax[1].type !== Value || !key?.configurable ||
      typeof key.get !== 'function' || typeof key.set !== 'function' ||
      stringSyntax?.length !== 2 || stringSyntax[0].name !== '$lengthOrReference' ||
      stringSyntax[1].name !== '$value') return null;
    return {Value, ArrayType, AssociativeType, StringType, descriptors, key};
  }

  function patchAMF3(shape) {
    if (!shape) return;
    const {Value, ArrayType, AssociativeType, StringType, descriptors, key} = shape;
    for (const {prototype, descriptor} of descriptors) {
      Object.defineProperty(prototype, 'value', {...descriptor, set(value) {
        if (!Object.is(value, descriptor.get.call(this))) throw new TypeError('AMF3 字面类型与输入值不一致。');
      }});
    }
    Object.defineProperty(AssociativeType.prototype, 'key', {...key, set(value) {
      if (this.$key === undefined) this.$key = new StringType();
      key.set.call(this, value);
    }});
    Object.defineProperty(ArrayType.prototype, 'value', {configurable: true,
      get() {
        const result = (this.values || []).map(node => node.value);
        for (const item of this.associativeValues || []) Object.defineProperty(result,
          item.key, {value: item.value.value, writable: true, enumerable: true, configurable: true});
        return result;
      },
      set(value) {
        if (!Array.isArray(value)) throw new TypeError('AMF3 数组需要数组输入。');
        const node = Value.array(value);
        this.values = node.values;
        this.associativeValues = node.associativeValues;
      }
    });
    amfInstalled.add(Value);
  }

  function inspectAMFNulFields(amf0, amf3) {
    if (!amf0 || !amf3) return null;
    const specifications = [
      [amf0.ShortString, '$value', true],
      [amf0.LongString, '$value', true],
      [amf0.Property, 'key', true],
      [amf3.StringType, '$value', false]
    ];
    const fields = [];
    let serializerType;
    for (const [Type, name, hasEncoding] of specifications) {
      const matches = Type.syntax.filter(field => field.name === name);
      if (matches.length !== 1) return null;
      const field = matches[0], options = field.options;
      if (field.containingType !== Type || field.type !== String ||
        typeof field.length !== 'function' || !options ||
        typeof options.serializer?.read !== 'function' ||
        typeof options.serializer?.write !== 'function') return null;
      if (hasEncoding) {
        if (options.string?.encoding !== 'utf-8') return null;
      } else if (options.string !== undefined && options.string?.encoding !== 'utf-8') return null;
      if (options.string?.nullTerminated !== undefined && options.string.nullTerminated !== false) return null;
      serializerType ??= options.serializer.constructor;
      if (options.serializer.constructor !== serializerType || !Object.isExtensible(options)) return null;
      const descriptor = Object.getOwnPropertyDescriptor(options, 'string');
      if (descriptor && (!descriptor.writable || !descriptor.configurable)) return null;
      fields.push(field);
    }
    return new Set(fields).size === 4 ? fields : null;
  }

  function patchAMFNulFields(fields) {
    if (!fields) return;
    for (const field of fields) field.options.string = {...(field.options.string || {}), nullTerminated: false};
  }

  function importEncodings(importModule) {
    const roots = new Set();
    const define = Object.defineProperty;
    let active = true;
    Object.defineProperty = function (target, key, descriptor) {
      const result = Reflect.apply(define, this, arguments);
      if (active && key === 'ownVariants' && Array.isArray(descriptor?.value)) roots.add(target);
      return result;
    };
    try { importModule(); }
    finally { active = false; Object.defineProperty = define; }
    let amf3, amf0, nulFields;
    try { amf3 = inspectAMF3(roots); amf0 = inspectAMF0(roots); nulFields = inspectAMFNulFields(amf0, amf3); }
    catch { return; }
    patchAMF3(amf3);
    patchAMF0(amf0);
    patchAMFNulFields(nulFields);
  }

  function pngDimensions(input) {
    const bytes = new Uint8Array(input);
    if (bytes.length < 24 || ![137, 80, 78, 71, 13, 10, 26, 10].every((value, index) => bytes[index] === value)) return null;
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    if (view.getUint32(8) !== 13 || view.getUint32(12) !== 0x49484452) return null;
    const width = view.getUint32(16), height = view.getUint32(20);
    if (!width || !height || !Number.isSafeInteger(width * height)) throw new Error('CyberChef 图片尺寸无效。');
    return {width, height};
  }

  async function dimensions(input, imageModule) {
    const direct = pngDimensions(input);
    if (direct) return direct;
    // Keep decoding in the original Jimp implementation. Browser image APIs
    // would silently narrow upstream TIFF/BMP/GIF input support.
    const converter = new imageModule['Convert Image Format']();
    const png = await converter.run(input, ['PNG', 80, 'Auto', 1]);
    const converted = pngDimensions(png);
    if (!converted) throw new Error('CyberChef 无法读取转换后的图片尺寸。');
    return converted;
  }

  function columnBits(rowBytes, width, height, channels) {
    const totalBits = width * height * channels;
    if (!Number.isSafeInteger(totalBits) || rowBytes.length !== Math.ceil(totalBits / 8)) throw new Error('CyberChef 图像位数据与尺寸不一致。');
    const output = [];
    const partial = totalBits % 8;
    const last = rowBytes.length - 1;
    let byte = 0, count = 0;
    for (let column = 0; column < width; column++) {
      for (let row = 0; row < height; row++) {
        for (let channel = 0; channel < channels; channel++) {
          const bitIndex = (row * width + column) * channels + channel;
          const byteIndex = Math.floor(bitIndex / 8);
          const bitsInByte = byteIndex === last && partial ? partial : 8;
          const shift = bitsInByte - 1 - bitIndex % 8;
          byte = (byte << 1) | ((rowBytes[byteIndex] >>> shift) & 1);
          if (++count === 8) { output.push(byte); byte = 0; count = 0; }
        }
      }
    }
    if (count) output.push(byte);
    return output;
  }

  function patchLSB(imageModule) {
    const Operation = imageModule?.['Extract LSB'];
    if (!Operation || !imageModule['Convert Image Format'] || installed.has(Operation.prototype)) return;
    const original = Operation.prototype.run;
    Operation.prototype.run = async function (input, args) {
      if (args[4] !== 'Column') return original.call(this, input, args);
      const rowArgs = args.slice();
      rowArgs[4] = 'Row';
      const channels = rowArgs.slice(0, 4).filter(value => value !== '').length;
      const rowBytes = await original.call(this, input, rowArgs);
      const {width, height} = await dimensions(input, imageModule);
      return columnBits(rowBytes, width, height, channels);
    };
    installed.add(Operation.prototype);
  }

  function patchChecksum(cryptoModule) {
    const Operation = cryptoModule?.['TCP/IP Checksum'];
    if (!Operation || installed.has(Operation.prototype)) return;
    Operation.prototype.run = function (input) {
      const bytes = new Uint8Array(input);
      let sum = 0;
      for (let index = 0; index < bytes.length; index += 2) {
        sum += (bytes[index] << 8) | (bytes[index + 1] || 0);
        // Fold on each word, so the accumulator never reaches a signed
        // 32-bit boundary even for the client's maximum-size input.
        sum = (sum & 0xffff) + Math.floor(sum / 0x10000);
      }
      while (sum > 0xffff) sum = (sum & 0xffff) + Math.floor(sum / 0x10000);
      return (0xffff - sum).toString(16).padStart(2, '0');
    };
    installed.add(Operation.prototype);
  }

  function patchExif(imageModule) {
    const Operation = imageModule?.['Remove EXIF'];
    if (!Operation || installed.has(Operation.prototype)) return;
    const original = Operation.prototype.run;
    Operation.prototype.run = function (...args) {
      const result = original.apply(this, args);
      return result instanceof Uint8Array ? Array.from(result) : result;
    };
    installed.add(Operation.prototype);
  }

  function patchChiSquare(defaultModule) {
    const Operation = defaultModule?.['Chi Square'];
    if (!Operation || installed.has(Operation.prototype)) return;
    Operation.prototype.run = function (input) {
      const bytes = new Uint8Array(input);
      if (!bytes.length) return 0;
      const counts = new Uint32Array(256);
      for (const byte of bytes) counts[byte]++;
      let sumSquares = 0;
      for (const count of counts) sumSquares += count * count;
      return sumSquares / (bytes.length / 256) - bytes.length;
    };
    installed.add(Operation.prototype);
  }

  self.CyberChefOperationCorrections = Object.freeze({
    importEncodings,
    apply(modules) {
      patchLSB(modules?.Image);
      patchChecksum(modules?.Crypto);
      patchExif(modules?.Image);
      patchChiSquare(modules?.Default);
    }
  });
})();
