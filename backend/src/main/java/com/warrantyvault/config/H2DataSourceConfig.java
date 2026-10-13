package com.warrantyvault.config;

import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.jdbc.datasource.embedded.EmbeddedDatabaseBuilder;
import org.springframework.jdbc.datasource.embedded.EmbeddedDatabaseType;

import javax.sql.DataSource;

/**
 * Forces H2 embedded database regardless of any environment variables.
 * This @Primary @Bean causes Spring Boot DataSourceAutoConfiguration to back off,
 * so no SPRING_DATASOURCE_URL or DB_URL env var can override this.
 */
@Configuration
public class H2DataSourceConfig {

    @Bean
    @Primary
    @ConditionalOnMissingBean(name = "customDataSource")
    public DataSource dataSource() {
        return new EmbeddedDatabaseBuilder()
                .setType(EmbeddedDatabaseType.H2)
                .setName("warrantyvault")
                .build();
    }
}
