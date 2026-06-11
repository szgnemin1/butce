/**
 * Web Crypto API-based end-to-end encryption and decryption utilities.
 * Uses PBKDF2 for key derivation and AES-GCM (256-bit) for strong encryption/decryption.
 * Automatically falls back to a pure JS SHA-256 and custom stream cipher if subtle crypto
 * is not available (e.g. non-secure/HTTP context on VDS).
 */

// Simple hex converters
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexToBuffer(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(hex.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * Derives an AES-GCM key from a plaintext password and salt
 */
async function deriveKey(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const passwordBuffer = enc.encode(password);
  
  // Import raw password bytes as a key
  const baseKey = await window.crypto.subtle.importKey(
    'raw',
    passwordBuffer,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  
  // PBKDF2 derive a 256-bit AES-GCM key
  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Pure JS SHA-256 Fallback
 */
function sha256Fallback(ascii: string): string {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(ascii);
  
  const hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
  ];

  const words: number[] = [];
  const totalLength = bytes.length;
  for (let i = 0; i < totalLength; i++) {
    words[i >> 2] |= (bytes[i] & 0xff) << (24 - (i % 4) * 8);
  }

  words[totalLength >> 2] |= 0x80 << (24 - (totalLength % 4) * 8);
  
  const blocksCount = ((totalLength + 8) >> 6) + 1;
  const totalWords = blocksCount * 16;
  for (let i = totalLength + 1; i < totalWords * 4; i++) {
    words[i >> 2] |= 0;
  }
  words[totalWords - 1] = totalLength * 8;

  for (let blockIndex = 0; blockIndex < blocksCount; blockIndex++) {
    const w = [];
    for (let i = 0; i < 16; i++) {
      w[i] = words[blockIndex * 16 + i] | 0;
    }
    for (let i = 16; i < 64; i++) {
      const s0 = ((w[i - 15] >>> 7) | (w[i - 15] << 25)) ^ ((w[i - 15] >>> 18) | (w[i - 15] << 14)) ^ (w[i - 15] >>> 3);
      const s1 = ((w[i - 2] >>> 17) | (w[i - 2] << 15)) ^ ((w[i - 2] >>> 19) | (w[i - 2] << 13)) ^ (w[i - 2] >>> 10);
      w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
    }

    let [a, b, c, d, e, f, g, h] = hash;

    for (let i = 0; i < 64; i++) {
      const S1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7));
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + S1 + ch + k[i] + w[i]) | 0;
      const S0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10));
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (S0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    hash[0] = (hash[0] + a) | 0;
    hash[1] = (hash[1] + b) | 0;
    hash[2] = (hash[2] + c) | 0;
    hash[3] = (hash[3] + d) | 0;
    hash[4] = (hash[4] + e) | 0;
    hash[5] = (hash[5] + f) | 0;
    hash[6] = (hash[6] + g) | 0;
    hash[7] = (hash[7] + h) | 0;
  }

  let result = '';
  for (let i = 0; i < 8; i++) {
    result += (hash[i] >>> 0).toString(16).padStart(8, '0');
  }

  return result;
}

/**
 * Derives a key stream for pure JS fallback symmetric cipher (SHA-256 CTR Mode emulator)
 */
function deriveKeyStream(password: string, saltHex: string, lengthNeeded: number): Uint8Array {
  const stream = new Uint8Array(lengthNeeded);
  let generated = 0;
  let counter = 0;
  while (generated < lengthNeeded) {
    const blockInput = `${password}:${saltHex}:${counter}`;
    const hashHex = sha256Fallback(blockInput);
    const hashBytes = hexToBuffer(hashHex);
    for (let i = 0; i < hashBytes.length && generated < lengthNeeded; i++) {
      stream[generated++] = hashBytes[i];
    }
    counter++;
  }
  return stream;
}

/**
 * Encrypts data in pure JS if Web Crypto is unavailable.
 */
function encryptFallback(plaintext: string, password: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);
  
  let saltHex = "";
  for (let i = 0; i < 16; i++) {
    saltHex += Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
  }
  
  const keyStream = deriveKeyStream(password, saltHex, data.length);
  const ciphertextBytes = new Uint8Array(data.length);
  for (let i = 0; i < data.length; i++) {
    ciphertextBytes[i] = data[i] ^ keyStream[i];
  }
  
  const ciphertextHex = bufferToHex(ciphertextBytes.buffer);
  return `${saltHex}-fallbackIV-${ciphertextHex}`;
}

/**
 * Decrypts data in pure JS if originally encrypted with fallback.
 */
function decryptFallback(encryptedStr: string, password: string): string {
  const parts = encryptedStr.split('-');
  if (parts.length !== 3) {
    throw new Error("Geçersiz şifreli veri biçimi.");
  }
  
  const saltHex = parts[0];
  const ciphertextBytes = hexToBuffer(parts[2]);
  
  const keyStream = deriveKeyStream(password, saltHex, ciphertextBytes.length);
  const decryptedBytes = new Uint8Array(ciphertextBytes.length);
  for (let i = 0; i < ciphertextBytes.length; i++) {
    decryptedBytes[i] = ciphertextBytes[i] ^ keyStream[i];
  }
  
  const decoder = new TextDecoder();
  return decoder.decode(decryptedBytes);
}

/**
 * Encrypts a plaintext string with a password.
 * Returns salt, iv, and ciphertext as a single hyphen-separated hex string.
 */
export async function encryptData(plaintext: string, password: string): Promise<string> {
  const cryptoAvailable = typeof window !== "undefined" && window.crypto && window.crypto.subtle;
  if (!cryptoAvailable) {
    return encryptFallback(plaintext, password);
  }

  try {
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(plaintext);
    
    // Generate secure random salt and IV
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    
    const key = await deriveKey(password, salt);
    
    // Encrypt content
    const ciphertextBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      dataBuffer
    );
    
    // Package together as Hex
    const saltHex = bufferToHex(salt);
    const ivHex = bufferToHex(iv);
    const ciphertextHex = bufferToHex(ciphertextBuffer);
    
    return `${saltHex}-${ivHex}-${ciphertextHex}`;
  } catch (err) {
    console.warn("Native encryption failed, falling back to pure JS cipher:", err);
    return encryptFallback(plaintext, password);
  }
}

/**
 * Decrypts a packaged encrypted string using a password.
 */
export async function decryptData(encryptedStr: string, password: string): Promise<string> {
  const parts = encryptedStr.split('-');
  if (parts.length !== 3) {
    throw new Error("Geçersiz şifreli veri biçimi.");
  }

  // If the data was encrypted with the JS fallback, use the JS fallback to decrypt
  if (parts[1] === "fallbackIV") {
    return decryptFallback(encryptedStr, password);
  }

  const cryptoAvailable = typeof window !== "undefined" && window.crypto && window.crypto.subtle;
  if (!cryptoAvailable) {
    return decryptFallback(encryptedStr, password);
  }

  try {
    const salt = hexToBuffer(parts[0]);
    const iv = hexToBuffer(parts[1]);
    const ciphertext = hexToBuffer(parts[2]);
    
    const key = await deriveKey(password, salt);
    
    // Decrypt content
    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv
      },
      key,
      ciphertext
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decryptedBuffer);
  } catch (err) {
    console.warn("Native decryption failed, trying pure JS fallback decryption:", err);
    try {
      return decryptFallback(encryptedStr, password);
    } catch (_fallbackErr) {
      throw new Error("Şifre çözülemedi. Şifre yanlış olabilir ya da veri hasar görmüş.");
    }
  }
}

/**
 * Super fast hashing (SHA-256) of password for check/saving settings
 */
export async function hashPassword(password: string): Promise<string> {
  const cryptoAvailable = typeof window !== "undefined" && window.crypto && window.crypto.subtle;
  if (cryptoAvailable) {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
      return bufferToHex(hashBuffer);
    } catch (e) {
      console.warn("Native hash failed, using JS fallback:", e);
    }
  }
  return sha256Fallback(password);
}

