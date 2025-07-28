// src/utils/crypto.js
import CryptoJS from 'crypto-js';

class CryptoUtils {
  // Generates a random 16-byte hex string as ID
  generateId() {
    return CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
  }

  // Returns a SHA256 hash of the input data (as string)
  hashData(data) {
    return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
  }

  // Encrypts data (object or string) using AES and the provided key
  encryptData(data, key) {
    const dataStr = typeof data === 'string' ? data : JSON.stringify(data);
    return CryptoJS.AES.encrypt(dataStr, key).toString();
  }

  // Decrypts AES-encrypted data using the provided key
  decryptData(encryptedData, key) {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, key);    
      const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
      // Try to parse as JSON, fallback to string
      try {
        return JSON.parse(decryptedStr);
      } catch {
        return decryptedStr;
      }
    } catch (err) {
      console.error('Decryption failed:', err);
      return null;
    }
  }
}

export const cryptoUtils = new CryptoUtils();
