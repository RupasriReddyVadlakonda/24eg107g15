# SignBridge — MySQL + React + Spring Boot (Render/Docker ready)

A full-stack accessibility-focused starter for practical communication:
- React + Vite frontend
- Java 17 + Spring Boot + Maven backend
- MySQL persistence
- One Docker image that builds the React `dist/` folder and serves it from Spring Boot
- Render Blueprint and local Docker Compose

## Deploy directly to Render using Aiven MySQL

Render does not provide a native managed MySQL database in this Blueprint, so use your Aiven MySQL service (or another reachable managed MySQL provider).

1. Extract the ZIP and push the `SignBridge` folder to a GitHub repository.
2. In Render, select **New → Blueprint** and choose the repository. Render detects `render.yaml` and builds the root `Dockerfile`.
3. In the Blueprint setup prompts, enter the Aiven connection values:
   - `DB_HOST`: Aiven hostname (not a URL)
   - `DB_PORT`: usually `3306` (preconfigured in Render)
   - `DB_NAME`: database name
   - `DB_USERNAME`: database username
   - `DB_PASSWORD`: database password
4. `DB_SSL_MODE` defaults to `REQUIRED`, appropriate for managed MySQL providers that require TLS. Keep it that way for Aiven.
5. Deploy. The same service serves the React UI and `/api/*`; the health endpoint is `/api/health`.

You can also configure these variables in **Render → signbridge → Environment** instead of using Blueprint prompts. Do not commit database credentials. The generated `JWT_SECRET` is for configuration readiness; this starter currently does not enforce JWT-based authentication on its demo message APIs.

## Deploy without Blueprint

Create a Render **Web Service**, connect your GitHub repository, choose **Docker** as the runtime, and use the root-level `Dockerfile`. Add environment variables `SPRING_PROFILES_ACTIVE=prod`, `DB_HOST`, `DB_PORT=3306`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`, `DB_SSL_MODE=REQUIRED`, and a strong unique `JWT_SECRET`.

## Run locally with Docker Compose

Requirements: Docker Desktop or Docker Engine with Docker Compose.

```bash
docker compose up --build
```

Open http://localhost:8080. Compose starts MySQL and the app. The local MySQL password values in `docker-compose.yml` are for development only; replace them for shared environments. Stop with `docker compose down` (add `-v` only if you also want to delete the local database volume).

## Run without Docker (development)

Requirements: Java 17+, Maven 3.9+, Node 20+.

Backend (defaults to an in-memory H2 database in the `dev` profile):
```bash
cd backend
mvn spring-boot:run
```

Frontend (separate terminal):
```bash
cd frontend
npm install
npm run dev
```

Vite will use `http://localhost:8080` for the API only if you set `VITE_API_URL=http://localhost:8080` in `frontend/.env.local`; otherwise configure your local proxy/base as needed. For the included Docker deployment the UI and API are same-origin.

## MySQL `application.properties`

`backend/src/main/resources/application.properties` reads connection details from environment variables and defaults to TLS-required MySQL. You can supply a complete JDBC URL in `SPRING_DATASOURCE_URL` to override the generated URL.

## Included workflow / limitations

- Quick requests such as HELP, WATER, DOCTOR, FOOD and EMERGENCY
- Browser text-to-speech
- Message thread with visitor/staff role toggle and persistent messages
- PostgreSQL has been replaced with MySQL

This is a deployable starter rather than a fully security-hardened production platform. The included visitor/staff role toggle is a demo UI, not authentication. Before handling sensitive or medical information, implement and enforce authentication/authorization, rate limits, audit/privacy controls, and appropriate retention policies. Webcam sign recognition, AI-generated suggestions, and WebSocket push delivery are not implemented in this starter.
