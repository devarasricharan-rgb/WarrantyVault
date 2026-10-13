# Multi-stage Dockerfile for WarrantyVault Spring Boot Backend
FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /app

# Copy Maven Wrapper & POM
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline -B

# Copy source code and build production jar
COPY src/ src/
RUN ./mvnw clean package -DskipTests

# Runtime Stage
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Create directories for uploads and H2 database
RUN mkdir -p /app/uploads /app/data

# Copy built artifact from build stage
COPY --from=build /app/target/warrantyvault-backend-*.jar app.jar

EXPOSE 8080

ENV PORT=8080
ENV SPRING_PROFILES_ACTIVE=prod

ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "app.jar"]
