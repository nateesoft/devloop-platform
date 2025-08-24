# Vault OSS Integration

This directory contains the setup for integrating HashiCorp Vault OSS with the Lowcode Platform for secure secret management.

## Quick Start

1. **Start Vault**:
   ```bash
   docker-compose up -d
   ```

2. **Setup Vault for Lowcode Platform**:
   ```bash
   ./setup-vault.sh
   ```

3. **Update your backend .env file** with the generated token from the setup script.

## What's Included

- **docker-compose.yml**: Vault OSS container with development configuration
- **setup-vault.sh**: Automated setup script that configures Vault for the platform
- **README.md**: This documentation

## Configuration Details

### Vault Container
- **Port**: 8200 (HTTP)
- **UI**: http://localhost:8200/ui
- **Root Token**: `root` (development only)
- **Storage**: Docker volumes for data persistence

### Lowcode Platform Integration
- **Secrets Engine**: KV v2 at `secret/`
- **Path Structure**: `secret/data/users/{userId}/secrets/{secretName}`
- **Policy**: Restricted access to user-specific secret paths

## Security Notes

⚠️ **Development Only**: This setup uses development mode with a static root token. DO NOT use in production.

For production:
1. Use proper Vault initialization and unsealing
2. Enable TLS/HTTPS
3. Use proper authentication methods (AppRole, Kubernetes, etc.)
4. Implement proper key rotation policies
5. Use sealed storage backends (Consul, etcd, etc.)

## API Examples

### Store a Secret
```bash
curl -H "X-Vault-Token: YOUR_TOKEN" \
     -X POST \
     -d '{"data": {"value": "my-secret-value"}}' \
     http://localhost:8200/v1/secret/data/users/1/secrets/api-key
```

### Retrieve a Secret
```bash
curl -H "X-Vault-Token: YOUR_TOKEN" \
     http://localhost:8200/v1/secret/data/users/1/secrets/api-key
```

### List User Secrets
```bash
curl -H "X-Vault-Token: YOUR_TOKEN" \
     -X LIST \
     http://localhost:8200/v1/secret/metadata/users/1/secrets
```

## Troubleshooting

### Vault Not Starting
- Check if port 8200 is available
- Ensure Docker has sufficient resources
- Check container logs: `docker-compose logs vault`

### Setup Script Fails
- Ensure Vault is fully started before running setup
- Check if `jq` is installed (required for token parsing)
- Verify VAULT_ADDR environment variable

### Integration Issues
- Verify the service token in your .env file
- Check Vault logs for authentication errors
- Ensure the correct API endpoints are being used

## Features Supported

✅ **Secret Storage**: Store/retrieve secrets securely  
✅ **Versioning**: Multiple versions of secrets with history  
✅ **User Isolation**: Secrets are isolated per user  
✅ **Metadata**: Store additional metadata with secrets  
✅ **Access Control**: Policy-based access restrictions  
✅ **Fallback**: Graceful fallback to database storage  

## Next Steps

After setup:
1. Start your backend service with Vault configuration
2. Create secrets through the frontend UI
3. Monitor Vault logs to verify integration
4. Consider implementing secret rotation policies