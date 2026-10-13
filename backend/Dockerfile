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

RUN mkdir -p /app/uploads

COPY --from=build /app/target/warrantyvault-backend-*.jar app.jar

EXPOSE 8080

ENV PORT=8080

# Force H2 in-memory DB via highest-priority JVM system properties
# These override any SPRING_DATASOURCE_URL env var set on Render
ENTRYPOINT ["java", \
  "-Djava.security.egd=file:/dev/./urandom", \
  "-Dspring.datasource.url=jdbc:h2:mem:warrantyvault;DB_CLOSE_DELAY=-1;MODE=MySQL", \
  "-Dspring.datasource.username=sa", \
  "-Dspring.datasource.password=", \
  "-Dspring.datasource.driver-class-name=org.h2.Driver", \
  "-Dspring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect", \
  "-Dspring.jpa.hibernate.ddl-auto=create-drop", \
  "-jar", "app.jar"]
