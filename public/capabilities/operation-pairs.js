// Explicit directions share one discovery owner. A pair means that the engine
// implements both directions; it does not promise a byte-exact round trip.
// Signing/verifying, one-way hashes and unrelated cleanup stay separate.
export const CHEF_OPERATION_PAIRS = Object.freeze([
  ...['Base32', 'Base45', 'Base58', 'Base62', 'Base64', 'Base85', 'Base92',
    'BCD', 'Base', 'Binary', 'Decimal', 'Float', 'Hex', 'Hex Content', 'Hexdump', 'Octal',
    'Charcode', 'HTML Entity', 'Punycode', 'Quoted Printable', 'Braille', 'Morse Code',
    'Bech32', 'COBS', 'Modhex', 'MessagePack'].map(name => [`To ${name}`, `From ${name}`]),
  ['Encode text', 'Decode text'], ['Escape Unicode Characters', 'Unescape Unicode Characters'],
  ['URL Encode', 'URL Decode'], ['Escape string', 'Unescape string'],
  ['Encode NetBIOS Name', 'Decode NetBIOS Name'], ['Citrix CTX1 Encode', 'Citrix CTX1 Decode'],
  ['To Case Insensitive Regex', 'From Case Insensitive Regex'],
  ['VarInt Encode', 'VarInt Decode'], ['CSV to JSON', 'JSON to CSV'], ['JSON to YAML', 'YAML to JSON'],
  ['BSON serialise', 'BSON deserialise'], ['PHP Serialize', 'PHP Deserialize'],
  ['Hex to PEM', 'PEM to Hex'], ['JWK to PEM', 'PEM to JWK'],
  ['Hex to Object Identifier', 'Object Identifier to Hex'],
  ['To UNIX Timestamp', 'From UNIX Timestamp'],
  ['UNIX Timestamp to Windows Filetime', 'Windows Filetime to UNIX Timestamp'],
  ['Gzip', 'Gunzip'], ['Tar', 'Untar'], ['Raw Deflate', 'Raw Inflate'], ['Zlib Deflate', 'Zlib Inflate'],
  ...['Bzip2', 'LZ4', 'LZMA', 'LZString'].map(name => [`${name} Compress`, `${name} Decompress`]),
  ...['AES', 'Ascon', 'Blowfish', 'CipherSaber2', 'DES', 'GOST', 'LS47', 'PRESENT',
    'RC2', 'RC6', 'SM4', 'TEA', 'Triple DES', 'Twofish', 'XTEA', 'XXTEA',
    'PGP', 'RSA', 'SM2', 'Fernet'].map(name => [`${name} Encrypt`, `${name} Decrypt`]),
  ['PGP Encrypt and Sign', 'PGP Decrypt and Verify'],
  ...['Affine Cipher', 'Bacon Cipher', 'Bifid Cipher', 'Rail Fence Cipher',
    'Cetacean Cipher', 'A1Z26 Cipher', 'Vigenère'].map(name => [`${name} Encode`, `${name} Decode`]),
  ['AES Key Wrap', 'AES Key Unwrap'], ['GOST Key Wrap', 'GOST Key Unwrap'],
  ...['AMF', 'CBOR', 'Protobuf', 'Rison'].map(name => [`${name} Encode`, `${name} Decode`])
].map(pair => Object.freeze(pair)));
