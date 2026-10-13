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

# Create directories for uploads and H2 database file
RUN mkdir -p /app/uploads /app/data

# Copy built artifact from build stage
COPY --from=build /app/target/warrantyvault-backend-*.jar app.jar

EXPOSE 8080

ENV PORT=8080

# Java -D system properties have HIGHEST priority and override ALL environment variables on Render
ENTRYPOINT ["java", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-Dspring.datasource.url=jdbc:h2:file:/app/data/warrantyvault;AUTO_SERVER=TRUE;DB_CLOSE_ON_EXIT=FALSE", \
  "-Dspring.datasource.username=sa", \
  "-Dspring.datasource.password=", \
  "-Dspring.datasource.driver-class-name=org.h2.Driver", \
  "-Dspring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect", \
  "-Dspring.jpa.hibernate.ddl-auto=update", \
  "-jar", "app.jar"]
