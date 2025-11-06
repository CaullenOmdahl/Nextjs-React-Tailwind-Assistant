# Authentication Patterns

## Overview

Authentication verifies user identity and manages sessions. This is a security-critical part of your application that affects user experience, data protection, and regulatory compliance.

## Key Considerations

### Security
- **Password Storage**: Hashing algorithms (bcrypt, argon2, scrypt)
- **Session Management**: Token storage, expiration, rotation
- **Attack Prevention**: CSRF, XSS, brute force, session fixation
- **Secure Transmission**: HTTPS, secure cookies, token handling

### User Experience
- **Login Flow**: Simple vs multi-step, social login
- **Password Recovery**: Email reset, security questions, 2FA recovery
- **Session Persistence**: Remember me, automatic logout
- **Error Messages**: Balance security and helpful feedback

### Compliance
- **Data Privacy**: GDPR, CCPA, data minimization
- **Password Requirements**: Complexity rules, rotation policies
- **Audit Logging**: Track authentication events
- **Right to Deletion**: Account deletion workflows

### Scalability
- **Session Storage**: In-memory, database, Redis, JWT
- **Distributed Systems**: Shared sessions across servers
- **Rate Limiting**: Protect against brute force
- **Edge Compatibility**: Stateless authentication for edge deployments

## Common Approaches

### Session-Based Authentication
**Philosophy**: Server stores session state, client holds session ID

**Flow**:
1. User logs in with credentials
2. Server creates session, stores in database/Redis
3. Server sends session ID to client (cookie)
4. Client sends session ID with each request
5. Server validates session and retrieves user data

**When to Choose**:
- Traditional server-rendered applications
- Need server-side session management
- Want server control over session invalidation
- Simpler security model for traditional apps

**Tradeoffs**:
- ➕ Server has full control over sessions
- ➕ Easy to invalidate all sessions
- ➕ Session data can be any size
- ➕ Simpler mental model
- ➖ Requires session storage (database/Redis)
- ➖ Harder to scale horizontally
- ➖ Not ideal for stateless/edge environments
- ➖ CSRF protection needed

**Implementation Considerations**:
```typescript
// Session structure
interface Session {
  id: string
  userId: string
  createdAt: Date
  expiresAt: Date
  data?: Record<string, any> // Optional session data
}

// Security measures
- httpOnly cookies (prevent XSS)
- secure flag (HTTPS only)
- sameSite attribute (CSRF protection)
- Session rotation on login
- Absolute and idle timeouts
```

### JWT (JSON Web Token) Authentication
**Philosophy**: Stateless tokens containing user data, signed by server

**Flow**:
1. User logs in with credentials
2. Server generates JWT with user claims
3. Client stores JWT (localStorage, cookie, memory)
4. Client sends JWT with each request (header/cookie)
5. Server verifies JWT signature and extracts claims

**When to Choose**:
- Microservices architecture
- Stateless API servers
- Mobile/SPA applications
- Edge/serverless deployment
- Cross-domain authentication

**Tradeoffs**:
- ➕ Stateless (no server storage)
- ➕ Works well in distributed systems
- ➕ Can include custom claims
- ➕ Edge-compatible
- ➕ Cross-domain capable
- ➖ Hard to invalidate before expiry
- ➖ Token size limits (cookies have 4KB limit)
- ➖ Vulnerable if token stolen (XSS risk)
- ➖ Can't update user data mid-session

**Implementation Considerations**:
```typescript
// JWT claims
interface TokenPayload {
  sub: string       // User ID (subject)
  iat: number       // Issued at timestamp
  exp: number       // Expiration timestamp
  email: string     // Custom claim
  role: string      // Custom claim
}

// Security measures
- Short expiration times (15-30 min)
- Refresh token rotation
- Store in httpOnly cookies if possible
- Include JTI (JWT ID) for revocation lists
- Verify issuer and audience
```

### OAuth 2.0 / OpenID Connect
**Philosophy**: Delegate authentication to trusted third parties

**Flow**:
1. User clicks "Login with Google/GitHub/etc"
2. Redirect to OAuth provider
3. User authorizes application
4. Provider redirects back with authorization code
5. Exchange code for access/ID tokens
6. Use tokens to access user data

**When to Choose**:
- Want social login options
- Don't want to manage passwords
- Need to access user's data from provider
- Building B2B applications (SSO)

**Tradeoffs**:
- ➕ No password management
- ➕ Improved UX (fewer accounts)
- ➕ Provider handles security
- ➕ Can access provider APIs
- ➖ Dependency on third party
- ➖ User data privacy concerns
- ➖ Provider can change terms/pricing
- ➖ More complex implementation

**Providers**:
- **Social**: Google, GitHub, Facebook, Twitter, Apple
- **Enterprise**: Okta, Auth0, Azure AD, OneLogin
- **Regional**: WeChat (China), Line (Japan), Kakao (Korea)

### Magic Link / Passwordless
**Philosophy**: Authenticate via email/SMS link or code

**Flow**:
1. User enters email
2. Server generates token, sends email with link
3. User clicks link (or enters code)
4. Server verifies token and creates session
5. User is authenticated

**When to Choose**:
- Simplify user experience
- Reduce password fatigue
- Target less technical users
- Want better mobile UX

**Tradeoffs**:
- ➕ No password to remember
- ➕ No password storage risks
- ➕ Better mobile UX
- ➕ Reduces support requests
- ➖ Depends on email/SMS reliability
- ➖ Email can be compromised
- ➖ SMS costs and reliability issues
- ➖ Slower login process

**Implementation Considerations**:
```typescript
// Token generation
- Cryptographically secure random tokens
- Short expiration (10-15 minutes)
- Single use (invalidate after use)
- Rate limiting (prevent abuse)
- Email deliverability considerations
```

### Multi-Factor Authentication (MFA)
**Philosophy**: Verify identity with multiple methods

**Factors**:
1. **Something you know**: Password, PIN
2. **Something you have**: Phone, hardware token
3. **Something you are**: Biometric (fingerprint, face)

**Common MFA Methods**:
- **TOTP** (Time-based OTP): Google Authenticator, Authy
- **SMS Codes**: Text message verification
- **Email Codes**: Email verification
- **Push Notifications**: Approve on mobile device
- **Hardware Tokens**: YubiKey, security keys (WebAuthn)
- **Backup Codes**: One-time use emergency codes

**When to Choose**:
- Handling sensitive data
- Compliance requirements
- High-value accounts
- Optional for user security

**Tradeoffs**:
- ➕ Significantly increased security
- ➕ Reduces account takeover risk
- ➕ Compliance benefit
- ➖ More complex UX
- ➖ User support burden
- ➖ Account lockout risks
- ➖ SMS costs (if using SMS)

## Authorization Patterns

### Role-Based Access Control (RBAC)
Users have roles, roles have permissions:

```typescript
interface User {
  id: string
  roles: Role[]
}

interface Role {
  name: string
  permissions: Permission[]
}

// Check permission
function canAccess(user: User, permission: string): boolean {
  return user.roles.some(role =>
    role.permissions.some(p => p.name === permission)
  )
}
```

**Best for**: B2B apps, admin panels, simple permission models

### Attribute-Based Access Control (ABAC)
Access based on user/resource attributes:

```typescript
function canAccess(
  user: User,
  resource: Resource,
  action: string
): boolean {
  return evaluatePolicy({
    user: { id: user.id, department: user.department },
    resource: { type: resource.type, owner: resource.ownerId },
    action,
    environment: { time: new Date(), ip: request.ip }
  })
}
```

**Best for**: Complex permission logic, context-dependent access

### Resource-Based Access
Permissions attached to specific resources:

```typescript
interface Resource {
  id: string
  ownerId: string
  sharedWith: Array<{
    userId: string
    permission: 'read' | 'write' | 'admin'
  }>
}

function canAccess(user: User, resource: Resource): boolean {
  if (resource.ownerId === user.id) return true
  return resource.sharedWith.some(
    share => share.userId === user.id
  )
}
```

**Best for**: Collaborative tools, document sharing, multi-tenancy

## Session Management Patterns

### Access + Refresh Tokens
- **Access Token**: Short-lived (15 min), used for API requests
- **Refresh Token**: Long-lived (7 days), used to get new access token

**Benefits**: Balance security and UX
**Implementation**:
```typescript
// Login returns both tokens
{ accessToken: "...", refreshToken: "..." }

// When access token expires, use refresh token
POST /api/auth/refresh
{ refreshToken: "..." }
→ { accessToken: "...", refreshToken: "..." }
```

### Token Rotation
Refresh tokens are rotated on each use:

```typescript
// Old refresh token is invalidated when used
// New refresh token is issued
// Prevents token reuse attacks
```

### Sliding Session Expiration
Session extends on activity:

```typescript
// On each request, if session is still valid:
if (session.expiresAt - now < threshold) {
  session.expiresAt = now + sessionDuration
}
```

## Security Best Practices

### Password Handling
1. **Never** store plaintext passwords
2. Use strong hashing (bcrypt, argon2, scrypt)
3. Salt passwords individually
4. Implement password complexity requirements
5. Rate limit login attempts
6. Prevent timing attacks in comparisons

### Token Security
1. Use httpOnly cookies when possible
2. Set secure flag (HTTPS only)
3. Implement CSRF protection for cookies
4. Short expiration times
5. Rotate tokens regularly
6. Validate tokens on every request

### Account Security
1. Email verification for new accounts
2. Password reset via email tokens
3. Notify users of suspicious activity
4. Allow users to view active sessions
5. Implement account lockout after failed attempts
6. Provide account recovery mechanisms

## Common Pitfalls

1. **Storing JWTs in localStorage**
   - **Risk**: Vulnerable to XSS attacks
   - **Solution**: Use httpOnly cookies or in-memory storage

2. **No CSRF Protection**
   - **Risk**: Cross-site request forgery
   - **Solution**: CSRF tokens or SameSite cookies

3. **Weak Password Requirements**
   - **Risk**: Easy to brute force
   - **Solution**: Minimum length, complexity, check against breach databases

4. **No Rate Limiting**
   - **Risk**: Brute force attacks
   - **Solution**: Rate limit login attempts per IP/account

5. **Predictable Session IDs**
   - **Risk**: Session hijacking
   - **Solution**: Cryptographically secure random IDs

6. **No Session Invalidation**
   - **Risk**: Compromised sessions stay valid
   - **Solution**: Implement logout, session expiration, revocation

## Testing Strategies

### Unit Tests
- Password hashing/verification
- Token generation/validation
- Permission checking logic
- Rate limiting logic

### Integration Tests
- Login flow end-to-end
- Password reset flow
- Session management
- MFA flow

### Security Tests
- SQL injection attempts
- XSS payload testing
- CSRF attack simulation
- Brute force protection
- Session fixation tests

## Decision Framework

1. **Application Type**
   - Server-rendered → Session-based or Cookie JWT
   - SPA/Mobile API → JWT with refresh tokens
   - Microservices → JWT
   - Edge/Serverless → JWT

2. **Security Requirements**
   - High security → MFA + short sessions
   - Standard → Password + JWT
   - Low friction → Magic link

3. **User Base**
   - Consumers → Social login + traditional
   - Enterprise → OAuth/SAML/SSO
   - Technical → Multiple options

4. **Scalability Needs**
   - Single server → Any approach
   - Distributed → JWT preferred
   - Edge → Stateless JWT only

## Resources

### Standards & Specs
- OAuth 2.0 specification
- OpenID Connect specification
- JSON Web Token (JWT) spec
- WebAuthn specification

### Security Resources
- OWASP Authentication Cheat Sheet
- NIST Password Guidelines
- OWASP Top 10
- Have I Been Pwned API

### Libraries & Tools
- Passport.js (Node.js auth middleware)
- NextAuth.js (Next.js auth)
- Auth.js (framework-agnostic)
- Supabase Auth, Firebase Auth (Backend-as-a-Service)
- Auth0, Clerk, WorkOS (Auth-as-a-Service)
