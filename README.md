# Collaborative List App (Full Stack)

A modern, minimalist list management app featuring real-time collaboration, swipe gestures, and a secure backend.

## Architecture

- **Frontend:** React Native (Expo) + NativeWind (Tailwind) + Reanimated
- **Backend:** Python FastAPI + SQLAlchemy
- **Database:** PostgreSQL (Dockerized)
- **Auth:** OAuth2 with JWT (Secure Store on mobile)

## Quick Start (Docker)

1. **Clone the repo**
   ```bash
   git clone [https://github.com/yourusername/list-app.git](https://github.com/yourusername/list-app.git)
   cd list-app
   ```
2. **Setup Environment Variables** Copy the example file and fill in your secrets:

   ```bash
   cp .env.example .env
   ```

3. **Launch the Backend**

   ```bash
   docker-compose up --build
   ```

   The API will be available at http://localhost:8000. Docs: http://localhost:8000/docs

4. **Run the Mobile App** Open a new terminal:
   ```bash
   cd frontend
   npm install
   npx expo start --clear
   ```
