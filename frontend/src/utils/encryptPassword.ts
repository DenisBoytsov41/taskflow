import CryptoJS from "crypto-js";

const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY || "thisisasecretkey";

export const encryptPassword = (password: string): string => {
  const key = CryptoJS.enc.Utf8.parse(SECRET_KEY);
  const iv = CryptoJS.lib.WordArray.random(16);

  const encrypted = CryptoJS.AES.encrypt(password, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7,
  });

  const encryptedWordArray = iv.concat(encrypted.ciphertext);
  return CryptoJS.enc.Base64.stringify(encryptedWordArray);
};
