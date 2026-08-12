# [APP_NAME] — Authentication Architecture

> Document version: 1.0
> Status: 📋 Review
> Last updated: 2026-08-12

---

## 1. Overview

Authentication is the security foundation for all user data. It must be:
- Secure against common attacks
- Smooth for the user (silent token refresh)
- Prepared for future auth methods (OAuth, OTP)

---

## 2. Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        MOBILE CLIENT                             │
│                                                                  │
│  ┌──────────────┐    ┌───────────────┐    ┌────────────────┐   │
│  │ Login/Signup │───▶│ Receive Tokens │───▶│ Store Securely │   │
│  └──────────────┘    └───────────────┘    └───────┬────────┘   │
│                                                    │             │
│                                            ┌───────▼────────┐   │
│                                            │ Axios Instance │   │
│                                            │ (Auto-attach   │   │
│                                            │  Bearer token) │   │
│                                            └───────┬────────┘   │
│                                                    │             │
│  ┌───────────────────────────────────────────────┐ │             │
│  │ Interceptor: on 401 → refresh → retry        │◀┘             │
│  └───────────────────────────────────────────────┘               │
└─────────────────────────────────────────────────────────────────┘
                               │
                               ▼  HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND                                   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                     JWT Auth Guard                         │   │
│  │  1. Extract Bearer token from Authorization header        │   │
│  │  2. Verify signature + expiry                             │   │
│  │  3. Extract userId from payload                           │   │
│  │  4. Attach user to request context                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│                              │                                    │
│  ┌──────────────────┐  ┌────▼─────────────┐                    │
│  │  Auth Module     │  │  Protected Route  │                    │
│  │  /auth/*         │  │  (any other API)  │                    │
│  │  (no guard)      │  │  @UseGuards(JWT)  │                    │
│  └──────────────────┘  └──────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. Token Strategy

### Dual Token System

| Token | Purpose | Storage | Lifetime | Rotation |
|-------|---------|---------|----------|----------|
| Access Token | API authentication | In-memory (Zustand) | 15 minutes | On refresh |
| Refresh Token | Obtain new access token | Secure storage (Keychain/EncryptedPrefs) | 7 days | On every use (rotation) |

### Why Short-Lived Access Tokens?

- **15 minutes** is short enough that a leaked access token has minimal damage window
- Long enough that most user sessions don't require frequent refreshes
- Silent refresh happens in the background — user never notices

### Refresh Token Rotation

Every time a refresh token is used, it's invalidated and a new one is issued. This means:
- A stolen refresh token can only be used once
- If both the legitimate user and attacker try to use the same refresh token, the second attempt fails → triggers revocation of the entire family

---

## 4. Token Payload (JWT)

### Access Token Payload

```json
{
  "sub": "user-uuid",
  "householdId": "household-uuid",
  "email": "user@example.com",
  "iat": 1691827200,
  "exp": 1691828100
}
```

**Minimal payload** — just enough to identify the user. No roles/permissions in Phase 1 (single-user, no authorization tiers).

### Refresh Token Payload

```json
{
  "sub": "user-uuid",
  "jti": "token-uuid",
  "iat": 1691827200,
  "exp": 1692432000
}
```

The `jti` (JWT ID) corresponds to the `RefreshToken.id` in the database, allowing individual token revocation.

---

## 5. Backend Implementation

### 5.1 Registration Flow

```
1. Validate input (name, email, password)
2. Check if email already exists → 409 if yes
3. Hash password (bcrypt, 12 rounds)
4. Create Household
5. Create User (linked to household)
6. Create UserPreference (defaults)
7. Generate access token
8. Generate refresh token + store in DB
9. Return { user, accessToken, refreshToken }
```

### 5.2 Login Flow

```
1. Validate input (email, password)
2. Find user by email
3. If not found → 401 "Invalid email or password"
4. Compare password hash (bcrypt)
5. If mismatch → 401 "Invalid email or password"
6. Generate access token
7. Generate refresh token + store in DB
8. Return { user, accessToken, refreshToken }
```

### 5.3 Token Refresh Flow

```
1. Receive refresh token
2. Verify JWT signature and expiry
3. Look up token in DB by jti
4. If not found or revoked → 401
5. Revoke current refresh token (set revokedAt)
6. Generate new access token
7. Generate new refresh token + store in DB
8. Return { accessToken, refreshToken }
```

### 5.4 Logout Flow

```
1. Receive refresh token
2. Find and revoke token in DB
3. Return success
```

### 5.5 Forgot Password Flow

```
1. Receive email
2. Find user by email
3. If not found → still return 200 (no enumeration)
4. Generate password reset token (random 64 bytes, hex)
5. Store hashed reset token in DB with 1-hour expiry
6. Send email with reset link: {FRONTEND_URL}/reset-password?token={token}
7. Return 200 "If this email is registered..."
```

### 5.6 Reset Password Flow

```
1. Receive token + new password
2. Hash the received token
3. Find matching reset record that hasn't expired
4. If not found → 400 "Invalid or expired token"
5. Hash new password
6. Update user's passwordHash
7. Delete reset token record
8. Revoke ALL user's refresh tokens (force re-login everywhere)
9. Return 200 "Password reset successful"
```

---

## 6. Mobile Implementation

### 6.1 Secure Storage

| Platform | Storage Mechanism | Encryption |
|----------|-------------------|-----------|
| iOS | Keychain Services | Hardware-backed (Secure Enclave on supported devices) |
| Android | EncryptedSharedPreferences | AES-256 (AndroidKeyStore-backed) |

**Library:** `react-native-keychain` or `react-native-encrypted-storage`

Stored items:
- `refreshToken` — the JWT refresh token string
- `user` — basic user info for immediate display on app open

**Access token is NOT stored persistently** — it lives only in memory (Zustand store). On app restart, a fresh access token is obtained via refresh.

### 6.2 Axios Interceptor (Token Attachment)

```typescript
// Request interceptor
api.interceptors.request.use((config) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});
```

### 6.3 Axios Interceptor (Auto-Refresh)

```typescript
// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = await getSecureRefreshToken();
        const { data } = await authApi.refresh({ refreshToken });
        
        // Store new tokens
        useAuthStore.getState().setTokens(data.accessToken, data.refreshToken);
        await setSecureRefreshToken(data.refreshToken);
        
        // Retry original request
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed — force logout
        await logout();
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);
```

### 6.4 App Startup Auth Check

```
App launches
    → Read refresh token from secure storage
    │
    ├── Token exists:
    │   → Call /auth/refresh
    │   ├── Success → Store access token → Navigate to Dashboard
    │   └── Failure → Clear storage → Navigate to Auth stack
    │
    └── No token:
        → Navigate to Auth stack (Welcome screen)
```

---

## 7. Password Security

| Measure | Implementation |
|---------|---------------|
| Hashing algorithm | bcrypt |
| Salt rounds | 12 (configurable) |
| Minimum password length | 8 characters |
| Complexity requirement | At least 1 uppercase, 1 lowercase, 1 number |
| Max length | 128 characters (prevent bcrypt DoS with huge inputs) |
| Timing attack prevention | bcrypt compare is constant-time |
| No plaintext storage | Only bcrypt hash stored |
| No password in logs | Password fields excluded from request logging |
| No password in response | Never return password-related fields |

---

## 8. Security Measures

### 8.1 Rate Limiting

| Endpoint | Limit | Window | Key |
|----------|-------|--------|-----|
| POST /auth/login | 5 attempts | 15 minutes | IP + email |
| POST /auth/register | 3 attempts | 15 minutes | IP |
| POST /auth/forgot-password | 3 attempts | 1 hour | IP |
| POST /auth/refresh | 30 attempts | 15 minutes | IP |

After limit exceeded: 429 response with `Retry-After` header.

### 8.2 No Email Enumeration

All auth endpoints that accept an email respond identically whether or not the email exists:
- Login: "Invalid email or password" (not "email not found")
- Forgot password: "If this email is registered..." (always 200)
- Register: Only exception — returns 409 if email exists (necessary for UX)

### 8.3 Refresh Token Security

- Stored in DB → can be individually revoked
- Rotated on every use → single-use tokens
- Family-based revocation → if reuse detected, revoke all tokens for user
- Hashed in DB (optional extra security — token stored as hash, validated by hashing incoming token)

### 8.4 Transport Security

- All API communication over HTTPS (TLS 1.2+)
- HSTS headers in production
- No sensitive data in URL query parameters

---

## 9. Account Deletion Authentication

Account deletion requires password re-verification:

```
1. User submits current password + "DELETE" confirmation string
2. Backend verifies password against stored hash
3. If correct → proceed with cascade deletion
4. If incorrect → 401 "Invalid password"
```

This prevents unauthorized account deletion if a device is compromised with an active session.

---

## 10. Future Auth Extensibility

The architecture supports future auth methods without major changes:

### Google / Apple Sign-In (Future)

```
Mobile SDK handles OAuth flow
    → Receives ID token from Google/Apple
    → Sends ID token to backend: POST /auth/social { provider, idToken }
    → Backend verifies ID token with provider
    → Creates or links user
    → Issues access + refresh tokens (same flow)
```

### Phone/OTP (Future)

```
POST /auth/otp/request { phone }
    → Send OTP via SMS provider
POST /auth/otp/verify { phone, otp }
    → Verify OTP
    → Create or find user
    → Issue tokens
```

### Required Changes for Social Auth

1. Add `authProvider` field to User model (`email`, `google`, `apple`)
2. Add social provider IDs to User model (`googleId`, `appleId`)
3. Password becomes optional (null for social-only users)
4. New auth strategies in Passport.js

**These don't affect the core token system** — once authenticated (regardless of method), the same JWT access/refresh flow is used.

---

## 11. Session Management

### Phase 1: Multiple Sessions Allowed

A user can be logged in on multiple devices simultaneously. Each device has its own refresh token.

### Logout from All Devices

Password reset triggers revocation of all refresh tokens → user must re-login on every device.

### Future: Session Management UI

Show active sessions (device, last active, location) with ability to revoke individual sessions.

---

## 12. Dependencies

| Backend | Purpose |
|---------|---------|
| `@nestjs/jwt` | JWT token creation/verification |
| `@nestjs/passport` | Authentication strategy framework |
| `passport-jwt` | JWT strategy for Passport |
| `bcrypt` | Password hashing |
| `crypto` | Reset token generation |

| Mobile | Purpose |
|--------|---------|
| `react-native-keychain` OR `react-native-encrypted-storage` | Secure token storage |
| `axios` | HTTP client with interceptors |
| `zustand` | Auth state (access token, user info) |
