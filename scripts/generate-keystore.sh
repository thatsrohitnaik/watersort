#!/bin/bash
# Generate Android Release Keystore
# Usage: ./scripts/generate-keystore.sh
# Store the keystore password securely in your password manager.
# DO NOT commit this file or the keystore to version control.

KEYSTORE_FILE="android/app/release.keystore"
KEY_ALIAS="water-sort-puzzle"
VALIDITY_DAYS=10000

if [ -f "$KEYSTORE_FILE" ]; then
  echo "Warning: Keystore already exists at $KEYSTORE_FILE"
  echo "Delete it first if you want to generate a new one."
  exit 1
fi

echo "Generating release keystore..."
echo "You will be prompted for:"
echo "  - Keystore password (create a strong one, store it safely)"
echo "  - Key password (can be same as keystore)"
echo "  - Distinguished name fields"

keytool -genkey -v \
  -keystore "$KEYSTORE_FILE" \
  -alias "$KEY_ALIAS" \
  -keyalg RSA \
  -keysize 2048 \
  -validity $VALIDITY_DAYS

echo ""
echo "Keystore generated at: $KEYSTORE_FILE"
echo ""
echo "NEXT STEPS:"
echo "1. Create android/gradle.properties with:"
echo "   WATERSORT_RELEASE_STORE_FILE=release.keystore"
echo "   WATERSORT_RELEASE_KEY_ALIAS=$KEY_ALIAS"
echo "   WATERSORT_RELEASE_STORE_PASSWORD=***"
echo "   WATERSORT_RELEASE_KEY_PASSWORD=***"
echo ""
echo "2. Run: npx expo run:android --variant release"
