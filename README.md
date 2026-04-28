# 🔐 OAuth 2.0 + OpenID Connect Server

A production-style **OAuth 2.0 Authorization Server** with **OpenID Connect (OIDC)** support built using **Node.js, Express, MongoDB**, and **JWT (RS256 + JWKS)**.

This project mimics real-world providers like Google Auth and includes:

* Authorization Code Flow + PKCE
* Access Token, ID Token, Refresh Token
* JWKS endpoint for public key distribution
* Session-based authentication
* Secure token validation

---

# 🚀 Features

* 🔑 OAuth 2.0 Authorization Code Flow
* 🔐 PKCE (Proof Key for Code Exchange)
* 🪪 OpenID Connect (OIDC)
* 🧾 ID Token (JWT)
* 🔄 Refresh Token with rotation
* 🔑 RS256 signing (public/private key)
* 🌐 JWKS endpoint
* 🛡️ CSRF protection using `state`
* 🔒 Nonce validation (OIDC security)
* 🍪 Session-based login

---

# 🏗️ Tech Stack

* Node.js
* Express.js
* MongoDB + Mongoose
* JSON Web Token (`jsonwebtoken`)
* JOSE (`jose`)
* Express Session
* Node.js Crypto

---

# 📂 Project Structure

```bash
backend/
│── config/
│   ├── db.js                # MongoDB connection
│   └── keys.js              # RSA key loading (private/public)
│
│── controllers/
│   ├── authController.js    # User login/register
│   └── oauthController.js   # OAuth + OIDC logic
│
│── middlewares/
│   ├── authMiddleware.js    # Protect routes (JWT)
│   └── errorMiddleware.js   # Global error handler
│
│── models/
│   ├── userModel.js
│   ├── clientModel.js
│   ├── authCodeModel.js
│   └── refreshTokenModel.js
│
│── routes/
│   ├── authRoutes.js
│   └── oauthRoutes.js
│
│── server.js                # Entry point
```

---

# 🔑 OAuth Flow (PKCE)

## 1️⃣ Authorization Request

```http
GET /api/oauth/authorize
```

Example:

```bash
http://localhost:5000/api/oauth/authorize?\
client_id=abc123&\
redirect_uri=http://localhost:5173/callback&\
response_type=code&\
scope=openid profile email&\
state=random_state&\
nonce=random_nonce&\
code_challenge=xyz&\
code_challenge_method=S256
```

---

## 2️⃣ Token Exchange

```http
POST /api/oauth/token
```

Body:

```json
{
  "client_id": "abc123",
  "code": "authorization_code",
  "redirect_uri": "http://localhost:5173/callback",
  "code_verifier": "original_verifier"
}
```

Response:

```json
{
  "access_token": "...",
  "id_token": "...",
  "refresh_token": "...",
  "token_type": "Bearer",
  "expires_in": 900
}
```

---

## 3️⃣ User Info

```http
GET /api/oauth/userinfo
Authorization: Bearer <access_token>
```

---

## 4️⃣ Refresh Token

```http
POST /api/oauth/refresh
```

---

## 5️⃣ JWKS Endpoint

```http
GET /api/oauth/jwks
```

Used by clients to verify JWT signatures.

---

# 🔐 Security Features

### ✅ PKCE

Prevents authorization code interception

### ✅ State (CSRF Protection)

Prevents Cross-Site Request Forgery attacks

### ✅ Nonce

Prevents replay attacks (OIDC)

### ✅ Expiring Auth Codes

5-minute expiry

### ✅ Refresh Token Rotation

Old tokens are invalidated after use

### ✅ RS256 + JWKS

Secure public/private key cryptography

---

# 🔑 Key Management

### ⚠️ IMPORTANT

Private keys are **NOT stored in the repository**

They are loaded like this:

```js
fs.readFileSync("./keys/private.pem");
```

---

## `.gitignore`

```bash
node_modules/
.env
.env.*

# keys (CRITICAL)
keys/
*.pem
```

---

# ▶️ Getting Started

## 1️⃣ Clone

```bash
git clone https://github.com/your-username/oauth-server.git
cd oauth-server
```

---

## 2️⃣ Install

```bash
npm install
```

---

## 3️⃣ Environment Variables

Create `.env`

```env
PORT=5000
MONGO_URI=your_mongodb_uri
SESSION_SECRET=your_session_secret
JWT_SECRET=optional_if_not_using_RS256
```

---

## 4️⃣ Generate RSA Keys

```bash
mkdir keys

openssl genrsa -out keys/private.pem 2048
openssl rsa -in keys/private.pem -pubout -out keys/public.pem
```

---

## 5️⃣ Run Server

```bash
npm run server
```

---

# 🧪 Testing

Use:

* Postman
* cURL
* Frontend client (React)

---

# 🧠 What You Built

This project demonstrates:

* OAuth 2.0 Authorization Server
* OpenID Connect (OIDC)
* PKCE security
* JWT (RS256) signing
* JWKS implementation
* Refresh token rotation
* Secure authentication architecture

---

# 📌 Future Improvements

* Consent screen (Allow / Deny)
* `.well-known/openid-configuration` (OIDC discovery)
* Role-based scopes
* Rate limiting
* Docker deployment
* Key rotation with multiple JWKS keys

---

# 👨‍💻 Author

**Gourav Saini**
Frontend & Full Stack Developer

---

# 📄 License

MIT License

