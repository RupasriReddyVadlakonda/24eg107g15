# Stage 1: build the React frontend
FROM node:20-alpine AS frontend-build
WORKDIR /workspace/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Stage 2: package Spring Boot with the built frontend in its static resources
FROM maven:3.9-eclipse-temurin-17 AS backend-build
WORKDIR /workspace/backend
COPY backend/pom.xml ./
COPY backend/src ./src
COPY --from=frontend-build /workspace/frontend/dist ./src/main/resources/static
RUN mvn -B -DskipTests package

# Stage 3: small runtime image
FROM eclipse-temurin:17-jre
WORKDIR /app
ENV PORT=8080
EXPOSE 8080
COPY --from=backend-build /workspace/backend/target/signbridge-0.0.1-SNAPSHOT.jar /app/signbridge.jar
ENTRYPOINT ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar /app/signbridge.jar"]
