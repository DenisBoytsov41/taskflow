from Crypto.Cipher import AES
import base64
import os

SECRET_KEY = os.getenv("ENCRYPTION_KEY", "thisisasecretkey").encode("utf-8")

def decrypt_password(encrypted_password: str) -> str:
    try:
        encrypted_data = base64.b64decode(encrypted_password)
        iv = encrypted_data[:16]
        cipher = AES.new(SECRET_KEY, AES.MODE_CBC, iv)
        decrypted = cipher.decrypt(encrypted_data[16:])
        return decrypted.decode("utf-8").rstrip("\x00")
    except Exception as e:
        raise ValueError("Ошибка при расшифровке пароля: " + str(e))
