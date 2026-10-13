# WarrantyVault Database Setup & Migration Guide

This directory contains the database initialization schema and migration verification scripts for MySQL 8.0+.

---

## 1. Creating the Target Database

Before running the application or migrations, ensure the MySQL database exists with `utf8mb4` encoding:

```sql
CREATE DATABASE IF NOT EXISTS `warrantyvault`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Alternatively, append `?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC` to your JDBC connection string so the MySQL driver creates the database catalog automatically upon connection (if user permissions allow).

---

## 2. Environment Variables & Credentials Safety

The backend requires the following environment variables in production:

| Variable | Description | Example |
|---|---|---|
| `DB_URL` | MySQL JDBC connection string | `jdbc:mysql://<host>:3306/warrantyvault?useSSL=true&serverTimezone=UTC` |
| `DB_USERNAME` | Database username | `warranty_user` |
| `DB_PASSWORD` | Database password | *(Never log or commit this value)* |
| `JWT_SECRET` | 256-bit (or longer) signing secret | *(Never log or commit this value)* |
| `PORT` | Web server listening port (Render default) | `8080` or `10000` |

> **Security Rules:**
> - Never hardcode or log `DB_PASSWORD` or `JWT_SECRET`.
> - Production `application.yml` has no fallback credentials; startup fails fast if these variables are absent.
> - Detailed health and actuator database info is hidden in production (`management.endpoint.health.show-details: never`).

---

## 3. Database Initialization Strategy

### Scenario A: New, Empty Database
1. Provision an empty MySQL database instance.
2. Ensure `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, and `JWT_SECRET` are configured.
3. Start the Spring Boot backend:
   - Flyway detects an empty schema, creates the `flyway_schema_history` table, and applies `V1__init.sql`.
   - All 4 tables (`users`, `products`, `repairs`, `notifications`) are created along with foreign keys and indexes.
   - Hibernate runs with `ddl-auto: validate` and confirms the schema matches the JPA entity models.

### Scenario B: Existing Database (with preexisting data)
**Important**: Do not start the application against an existing un-baselined database with default production settings, because `baseline-on-migrate: false` prevents accidental migrations or table collisions.

Follow this safe adoption procedure:
1. **Take a full database backup**:
   ```bash
   mysqldump -u <DB_USERNAME> -p --single-transaction --quick <DATABASE_NAME> > backup_before_flyway.sql
   ```
2. **Verify schema compatibility**:
   Run the read-only check script:
   ```bash
   mysql -u <DB_USERNAME> -p <DATABASE_NAME> < database/flyway-existing-schema-check.sql
   ```
   **Every query in this script must return zero rows.** If any rows are returned, address the schema discrepancies before proceeding.
3. **Baseline the existing database at version 1**:
   Baselining writes only the Flyway history tracking record—it **does not execute DDL**, drop tables, or modify existing records.

   **Using Maven Flyway Plugin (from `backend/` directory):**
   ```bash
   ./mvnw flyway:baseline \
     -Dflyway.url="$DB_URL" \
     -Dflyway.user="$DB_USERNAME" \
     -Dflyway.password="$DB_PASSWORD" \
     -Dflyway.baselineVersion=1
   ```

   **Using Standalone Flyway CLI:**
   ```bash
   flyway -url="$DB_URL" -user="$DB_USERNAME" -password="$DB_PASSWORD" -baselineVersion=1 baseline
   ```

   **Alternatively, via one-time startup environment variables:**
   Set `SPRING_FLYWAY_BASELINE_ON_MIGRATE=true` and `SPRING_FLYWAY_BASELINE_VERSION=1` for the initial run only, then remove or unset them for subsequent runs.

4. **Verify migration history status**:
   ```bash
   ./mvnw flyway:info \
     -Dflyway.url="$DB_URL" \
     -Dflyway.user="$DB_USERNAME" \
     -Dflyway.password="$DB_PASSWORD"
   ```
5. **Start the backend normally**:
   With the baseline established, subsequent boots will use `spring.jpa.hibernate.ddl-auto=validate` safely. Future schema modifications must be applied via incremental migration scripts (`V2__...sql`, `V3__...sql`, etc.).

---

## 4. Flyway Maven Plugin Commands

The backend includes `org.flywaydb:flyway-maven-plugin` preconfigured with MySQL support. Run these commands from the `backend/` directory:

| Task | Command |
|---|---|
| Check migration status | `./mvnw flyway:info -Dflyway.url="$DB_URL" -Dflyway.user="$DB_USERNAME" -Dflyway.password="$DB_PASSWORD"` |
| Baseline existing DB | `./mvnw flyway:baseline -Dflyway.url="$DB_URL" -Dflyway.user="$DB_USERNAME" -Dflyway.password="$DB_PASSWORD" -Dflyway.baselineVersion=1` |
| Apply pending migrations | `./mvnw flyway:migrate -Dflyway.url="$DB_URL" -Dflyway.user="$DB_USERNAME" -Dflyway.password="$DB_PASSWORD"` |
| Validate checksums | `./mvnw flyway:validate -Dflyway.url="$DB_URL" -Dflyway.user="$DB_USERNAME" -Dflyway.password="$DB_PASSWORD"` |
| Repair history metadata | `./mvnw flyway:repair -Dflyway.url="$DB_URL" -Dflyway.user="$DB_USERNAME" -Dflyway.password="$DB_PASSWORD"` |

---

## 5. Local Development

To run the application locally without connecting to production or setting production secrets:
```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```
The `dev` profile uses [application-dev.yml](file:///c:/Users/shash/OneDrive/Desktop/warranty%20appliction/backend/src/main/resources/application-dev.yml) with local development defaults (`localhost:3306`, H2 console, local test JWT secret) and will never inadvertently affect production databases.
