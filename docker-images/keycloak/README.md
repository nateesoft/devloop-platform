# Keycloak Integration for Lowcode Platform

This directory contains the complete setup for integrating Keycloak with the Lowcode Platform, including Google Gmail authentication.

## Quick Start

1. **Start Keycloak**:
   ```bash
   cd docker-images/keycloak
   docker-compose up -d
   ```

2. **Wait for Keycloak to be ready** (may take 1-2 minutes)

3. **Setup Realm and Configuration**:
   ```bash
   ./setup-keycloak.sh
   ```

4. **Configure Google OAuth** (optional):
   - Go to: http://localhost:9090/admin
   - Login: admin/admin123
   - Navigate to: Identity Providers → Google
   - Add your Google Client ID and Secret
   - Enable the provider

## What's Included

### Docker Setup
- **docker-compose.yml**: Keycloak container with proper configuration
- **Port**: 9090 (to avoid conflicts with other services)
- **Admin**: admin/admin123

### Keycloak Configuration
- **realm-export.json**: Pre-configured realm with:
  - Realm: `lowcode-platform` 
  - Client: `lowcode-portal`
  - Roles: admin, user, developer
  - Google Identity Provider (ready to configure)
  - User attribute mappers for role management

### Frontend Integration
- **@react-keycloak/web**: React Keycloak integration
- **KeycloakContext**: Context provider for authentication state
- **LoginPage**: Updated with Keycloak login buttons
- **Silent SSO**: For seamless authentication

## Configuration Details

### Client Configuration
```
Client ID: lowcode-portal
Client Type: Public
Redirect URIs: http://localhost:3000/*
Web Origins: http://localhost:3000
```

### User Roles
- **admin**: Full system access
- **user**: Standard user access  
- **developer**: Extended permissions for development

### Identity Provider (Google)
- **Provider**: Google OAuth 2.0
- **Sync Mode**: Import users from Google
- **Default Role**: user (assigned to new users)

## Frontend Usage

### Environment Variables
```env
NEXT_PUBLIC_KEYCLOAK_URL=http://localhost:9090
NEXT_PUBLIC_KEYCLOAK_REALM=lowcode-platform
NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=lowcode-portal
```

### Using Keycloak in Components
```tsx
import { useKeycloakAuth } from '@/contexts/KeycloakContext';

function MyComponent() {
  const { 
    user, 
    isAuthenticated, 
    login, 
    logout, 
    loginWithGoogle,
    hasRole 
  } = useKeycloakAuth();

  return (
    <div>
      {isAuthenticated ? (
        <div>Welcome, {user?.firstName}!</div>
      ) : (
        <div>
          <button onClick={login}>Login with Keycloak</button>
          <button onClick={loginWithGoogle}>Login with Google</button>
        </div>
      )}
    </div>
  );
}
```

## Google OAuth Setup

1. **Create Google OAuth Application**:
   - Go to: https://console.developers.google.com
   - Create new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials

2. **Configure Redirect URI**:
   ```
   http://localhost:9090/realms/lowcode-platform/broker/google/endpoint
   ```

3. **Add to Keycloak**:
   - Go to Keycloak Admin Console
   - Identity Providers → Google
   - Enter Client ID and Secret
   - Save and enable

## User Management

### Default Admin User
```
Username: admin
Email: admin@lowcode.local  
Password: admin123
Role: admin
```

### Adding New Users
1. Through Keycloak Admin Console
2. User self-registration (enabled by default)
3. Google social login (imports user automatically)

## Security Features

### Token Configuration
- **Access Token Lifespan**: 30 minutes
- **Refresh Token**: Available for token renewal
- **PKCE**: Enabled for security
- **Silent Check SSO**: For seamless authentication

### Session Management
- **Remember Me**: Enabled
- **Session Timeout**: Configurable
- **Brute Force Protection**: Enabled (30 attempts)

## Troubleshooting

### Keycloak Not Starting
```bash
# Check container status
docker-compose ps

# Check logs
docker-compose logs keycloak

# Restart container
docker-compose restart
```

### Frontend Connection Issues
1. Check environment variables in `.env.local`
2. Verify Keycloak is running on port 9090
3. Check browser console for CORS errors
4. Ensure realm and client IDs match

### Google Login Not Working
1. Verify Google OAuth credentials
2. Check redirect URI configuration
3. Enable Google+ API in Google Console
4. Check Keycloak logs for authentication errors

## URLs

- **Keycloak Admin**: http://localhost:9090/admin
- **Realm**: http://localhost:9090/realms/lowcode-platform
- **Auth Endpoint**: http://localhost:9090/realms/lowcode-platform/protocol/openid-connect/auth
- **Token Endpoint**: http://localhost:9090/realms/lowcode-platform/protocol/openid-connect/token

## Production Considerations

⚠️ **This is a development setup. For production:**

1. Use proper SSL/TLS certificates
2. Change default admin credentials
3. Configure proper database (PostgreSQL)
4. Set up proper Google OAuth domain verification
5. Configure session clustering for high availability
6. Enable audit logging
7. Set up proper backup strategies