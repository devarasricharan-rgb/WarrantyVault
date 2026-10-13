# WarrantyVault Database Setup Guide

This directory contains the database initialization schema for MySQL 8.0+.

## Option 1: Automatic Schema Initialization via Hibernate
By default in `backend/src/main/resources/application.yml`, Spring Boot has:
```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: update
```
If you start the backend pointing to a running MySQL instance, Hibernate will automatically create or update all tables (`users`, `products`, `repairs`, `notifications`) and constraints on startup.

## Option 2: Manual Script Execution
You can manually run `schema.sql` against your MySQL server:

```powershell
# Using MySQL Command Line Client:
mysql -u root -p < ".\database\schema.sql"
```

Or execute `schema.sql` inside MySQL Workbench, DBeaver, or phpMyAdmin.

## Environment Variables for MySQL
When running the Spring Boot backend locally or in production, configure these variables:
- `DB_URL`: `jdbc:mysql://localhost:3306/warrantyvault?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC`
- `DB_USERNAME`: `root`
- `DB_PASSWORD`: `your_mysql_password`
