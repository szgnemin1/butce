/**
 * Web Crypto API-based end-to-end encryption and decryption utilities.
 * Uses PBKDF2 for key derivation and AES-GCM (256-bit) for strong encryption/decryption.
 * This guarantees zero-knowledge encryption: data is encrypted on client before upload.
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
 * Encrypts a plaintext string with a password.
 * Returns salt, iv, and ciphertext as a single hyphen-separated hex string.
 */
export async function encryptData(plaintext: string, password: string): Promise<string> {
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
    console.error("Encryption failed:", err);
    throw new Error("Veri şifrelenirken kritik bir hata oluştu.");
  }
}

/**
 * Decrypts a packaged encrypted string using a password.
 */
export async function decryptData(encryptedStr: string, password: string): Promise<string> {
  try {
    const parts = encryptedStr.split('-');
    if (parts.length !== 3) {
      throw new Error("Geçersiz şifreli veri biçimi.");
    }
    
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
    console.error("Decryption failed:", err);
    throw new Error("Şifre çözülemedi. Şifre yanlış olabilir ya da veri hasar görmüş.");
  }
}

/**
 * Super fast hashing (SHA-256) of password for check/saving settings
 */
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  return bufferToHex(hashBuffer);
}
