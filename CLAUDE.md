# Project Overview & Vibe Coding Guidelines

## Tech Stack
- **Backend**: Java 21, Spring Boot 3.3+, Gradle, Spring Data JPA, Lombok
- **Frontend**: React 18+, Vite, TypeScript, Tailwind CSS, Axios/TanStack Query
- **Database**: H2 (Dev) / PostgreSQL (Prod)

## Commands
- **Backend Build & Test**: `cd backend && ./gradlew test`
- **Backend Run**: `cd backend && ./gradlew bootRun`
- **Frontend Run**: `cd frontend && npm run dev`
- **Frontend Build**: `cd frontend && npm run build`

## Code Conventions

### Backend (Spring Boot)
1. Follow Clean Architecture / Controller-Service-Repository pattern.
2. Use `Record` types or Lombok `@Getter`/`@Builder` for DTOs.
3. Always implement ResponseEntity with appropriate HTTP status codes for REST APIs.
4. Entity classes must not be exposed directly to the API layer; map them to DTOs.
5. All new endpoints must include basic JUnit 5 integration/unit tests.

### Frontend (React)
1. Use Functional Components with Hooks.
2. Store API calls inside `src/api/` or custom hooks, not directly inside components.
3. Handle Loading and Error states explicitly for UI components.
4. Keep CSS scoped using Tailwind utility classes.

### Cross-Cutting Rules
- API endpoints should follow standard RESTful URI naming (e.g., `/api/v1/users`).
- Always run tests (`cd backend && ./gradlew test`) after making code changes.