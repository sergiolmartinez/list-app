# Contributing to List App

Thank you for your interest in improving the List App!

## How to Run Locally

Please refer to the `README.md` for Docker setup instructions.

## Development Standards

### Backend (Python)

- **Formatter:** We use `black`. Please run `black .` before committing.
- **Migrations:** Never edit the SQL schema manually. Always use `alembic revision --autogenerate`.
- **Imports:** Clean up unused imports.

### Frontend (React Native)

- **Styling:** Use `NativeWind` (Tailwind classes). Avoid `StyleSheet.create` unless necessary for animations.
- **State:** Use standard React Hooks. Complex global state should use `Zustand`.
- **Type Safety:** No `any` types allowed in final code. Define interfaces in `services/api.ts` or component props.

## Workflow

1. Fork the repo.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes.
4. Open a Pull Request.
