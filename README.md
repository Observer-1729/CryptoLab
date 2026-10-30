# CryptoLab — Encoding & Cryptography Toolkit

CryptoLab is a responsive, browser-based toolkit for exploring common data encodings, classical substitution ciphers and SHA-256 hashing. It is built with plain HTML, CSS and vanilla JavaScript. All transformations run locally in the browser; no backend, database or account is required.

## Features

- **Base64:** Unicode-safe encoding and strict decoding validation.
- **URL:** URL-component encoding and decoding with malformed-input handling.
- **Binary:** UTF-8 bytes to 8-bit binary and back.
- **Hexadecimal:** UTF-8 bytes to hexadecimal and back.
- **Caesar cipher:** Encrypt, decrypt, configurable shifts and all 25 brute-force shifts.
- **ROT13:** Reversible 13-position alphabet rotation.
- **Vigenère cipher:** Keyword-based encryption and decryption.
- **Morse code:** Letters, digits and common punctuation in both directions.
- **SHA-256:** 256-bit digest generation through the browser Web Crypto API.
- Searchable dashboard, recent tools, responsive navigation, copy, clear, swap, counters and learning notes.

## Technologies

- HTML5 semantic markup
- CSS3 (responsive layout, custom properties, transitions)
- Vanilla JavaScript (ES6+)
- `TextEncoder` / `TextDecoder` for UTF-8 conversion
- Web Crypto API (`crypto.subtle.digest`) for SHA-256

No frontend framework or third-party JavaScript dependency is used. The Google Fonts stylesheet is an optional visual enhancement; the application works with system fallback fonts if it cannot load.

## Run locally

1. Download or clone this project.
2. Open `index.html` in a modern browser.

For the SHA-256 tool, use a secure context. Browsers generally expose Web Crypto on `https://` and `http://localhost`. A simple local server is recommended:

```bash
# Python
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Encoding, encryption and hashing

- **Encoding** changes how data is represented. It is reversible and does not require a secret key. Base64, URL encoding, binary and hexadecimal are examples.
- **Encryption** protects confidentiality by using a cryptographic algorithm and a key. The intended recipient decrypts the ciphertext with the appropriate key.
- **Hashing** maps data to a fixed-length digest. A secure hash function is designed to be one-way; a digest is not decrypted back into the original input.

## Security limitations

CryptoLab is an educational project, not a security product. Base64, URL encoding, binary and hexadecimal are not encryption. Caesar, ROT13 and Vigenère are classical ciphers and are not secure against modern analysis. SHA-256 is a general-purpose hash, not a password encryption function; password storage should use a dedicated password-hashing scheme such as Argon2id, scrypt or PBKDF2 with unique salts and appropriate parameters.

Do not enter sensitive or confidential information into educational demos on shared devices. The application is designed to process text locally and contains no code that sends user input to a server, but browser extensions, device compromise, clipboard history and the surrounding environment are outside its control.

## Project structure

```text
cryptolab/
├── index.html
├── style.css
├── script.js
└── README.md
```
