# List App Mobile (Expo)

## Setup

1. **Install Dependencies:**

   ```bash
   npm install
   ```

2. **Environment COnfiguration:** Copy the example env file:

   ```bash
   cp .env.example .env
   ```

   **Important:** Update EXPO_PUBLIC_API_URL to your computer's LAN IP (e.g., 192.168.1.50:8000) so your phone can reach the backend.

3. **Run:**
   ```bash
   npx expo start
   ```

**Troubleshooting**
**Network Error on Login:** Ensure your computer's firewall allows port 8000, and that your phone is on the same WiFi.

**Swipe Gestures not working:** Run npx expo start --clear to reset the Reanimated cache.
