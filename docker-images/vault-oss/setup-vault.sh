#!/bin/bash

# Setup script for Vault OSS integration with lowcode platform
# This script initializes Vault with the necessary configuration

set -e

VAULT_ADDR=${VAULT_ADDR:-"http://localhost:8200"}
VAULT_TOKEN=${VAULT_TOKEN:-"root"}

echo "🔐 Setting up Vault OSS for Lowcode Platform..."
echo "Vault Address: $VAULT_ADDR"

# Wait for Vault to be ready
echo "⏳ Waiting for Vault to be ready..."
until curl -s "$VAULT_ADDR/v1/sys/health" > /dev/null 2>&1; do
  echo "Waiting for Vault..."
  sleep 2
done

echo "✅ Vault is ready!"

# Set Vault address and token
export VAULT_ADDR
export VAULT_TOKEN

# Enable KV v2 secrets engine (if not already enabled)
echo "🔧 Enabling KV v2 secrets engine..."
vault secrets enable -path=secret kv-v2 2>/dev/null || echo "KV v2 already enabled"

# Create a policy for the lowcode platform
echo "📝 Creating lowcode platform policy..."
vault policy write lowcode-platform - <<EOF
# Allow full access to secret/data/users/*
path "secret/data/users/*" {
  capabilities = ["create", "read", "update", "delete", "list"]
}

# Allow listing users
path "secret/metadata/users" {
  capabilities = ["list"]
}

# Allow versioning operations
path "secret/*" {
  capabilities = ["read", "list"]
}

# Allow destroy operations for cleanup
path "secret/destroy/users/*" {
  capabilities = ["update"]
}

# Allow metadata operations
path "secret/metadata/users/*" {
  capabilities = ["read", "list", "delete"]
}
EOF

# Create a token for the lowcode platform service
echo "🎫 Creating service token..."
LOWCODE_TOKEN=$(vault token create \
  -policy=lowcode-platform \
  -ttl=8760h \
  -renewable=true \
  -display-name="lowcode-platform-service" \
  -format=json | jq -r '.auth.client_token')

echo "✨ Setup completed successfully!"
echo ""
echo "📋 Configuration for your .env file:"
echo "VAULT_ENABLED=true"
echo "VAULT_ENDPOINT=$VAULT_ADDR"
echo "VAULT_TOKEN=$LOWCODE_TOKEN"
echo "VAULT_MOUNT=secret"
echo ""
echo "🔑 Service Token: $LOWCODE_TOKEN"
echo "⚠️  Store this token securely! It will not be shown again."
echo ""
echo "🎯 Test the integration:"
echo "curl -H \"X-Vault-Token: $LOWCODE_TOKEN\" \\"
echo "     -X POST \\"
echo "     -d '{\"data\": {\"value\": \"test-secret\"}}' \\"
echo "     $VAULT_ADDR/v1/secret/data/users/1/secrets/test"