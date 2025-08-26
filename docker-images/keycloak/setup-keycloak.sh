#!/bin/bash

# Setup script for Keycloak with Lowcode Platform integration
set -e

KEYCLOAK_URL=${KEYCLOAK_URL:-"http://localhost:9191"}
ADMIN_USER=${ADMIN_USER:-"admin"}
ADMIN_PASS=${ADMIN_PASS:-"admin123"}
REALM_NAME="lowcode-platform"

echo "🔐 Setting up Keycloak for Lowcode Platform..."
echo "Keycloak URL: $KEYCLOAK_URL"

# Wait for Keycloak to be ready
echo "⏳ Waiting for Keycloak to be ready..."
until curl -s "$KEYCLOAK_URL/health/ready" > /dev/null 2>&1; do
  echo "Waiting for Keycloak..."
  sleep 5
done

echo "✅ Keycloak is ready!"

# Get admin access token
echo "🔑 Getting admin access token..."
ADMIN_TOKEN=$(curl -s -X POST "$KEYCLOAK_URL/realms/master/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=$ADMIN_USER" \
  -d "password=$ADMIN_PASS" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" | jq -r '.access_token')

if [ "$ADMIN_TOKEN" == "null" ] || [ -z "$ADMIN_TOKEN" ]; then
  echo "❌ Failed to get admin token"
  exit 1
fi

echo "✅ Got admin token"

# Check if realm exists
echo "🔍 Checking if realm '$REALM_NAME' exists..."
REALM_EXISTS=$(curl -s -H "Authorization: Bearer $ADMIN_TOKEN" \
  "$KEYCLOAK_URL/admin/realms/$REALM_NAME" \
  -w "%{http_code}" -o /dev/null)

if [ "$REALM_EXISTS" == "200" ]; then
  echo "⚠️  Realm '$REALM_NAME' already exists"
  echo "📝 Updating existing realm configuration..."
else
  echo "🆕 Creating new realm '$REALM_NAME'..."
fi

# Import/Update realm
echo "📥 Importing realm configuration..."
curl -s -X POST "$KEYCLOAK_URL/admin/realms" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d @realm-export.json > /dev/null

echo "✅ Realm configuration imported"

# Get realm-specific admin token
echo "🔑 Getting realm admin token..."
REALM_TOKEN=$(curl -s -X POST "$KEYCLOAK_URL/realms/$REALM_NAME/protocol/openid-connect/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=$ADMIN_USER" \
  -d "password=$ADMIN_PASS" \
  -d "grant_type=password" \
  -d "client_id=admin-cli" | jq -r '.access_token')

echo "✅ Setup completed successfully!"
echo ""
echo "📋 Configuration Summary:"
echo "Realm: $REALM_NAME"
echo "Admin Console: $KEYCLOAK_URL/admin"
echo "Realm URL: $KEYCLOAK_URL/realms/$REALM_NAME"
echo "Client ID: lowcode-portal"
echo "Client Secret: lowcode-portal-secret-2024"
echo ""
echo "🔧 Frontend Environment Variables:"
echo "NEXT_PUBLIC_KEYCLOAK_URL=$KEYCLOAK_URL"
echo "NEXT_PUBLIC_KEYCLOAK_REALM=$REALM_NAME"
echo "NEXT_PUBLIC_KEYCLOAK_CLIENT_ID=lowcode-portal"
echo ""
echo "⚠️  To enable Google Login:"
echo "1. Go to: $KEYCLOAK_URL/admin/master/console/#/$REALM_NAME/identity-providers"
echo "2. Edit Google provider"
echo "3. Add your Google OAuth Client ID and Secret"
echo "4. Enable the provider"
echo ""
echo "🧪 Test URLs:"
echo "Auth: $KEYCLOAK_URL/realms/$REALM_NAME/protocol/openid-connect/auth"
echo "Token: $KEYCLOAK_URL/realms/$REALM_NAME/protocol/openid-connect/token"
echo "Userinfo: $KEYCLOAK_URL/realms/$REALM_NAME/protocol/openid-connect/userinfo"