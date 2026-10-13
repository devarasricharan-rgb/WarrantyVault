CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'ROLE_USER',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE products (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL,
    model_number VARCHAR(100) DEFAULT NULL,
    serial_number VARCHAR(100) DEFAULT NULL,
    purchase_price DECIMAL(12, 2) NOT NULL,
    purchase_date DATE NOT NULL,
    warranty_duration_months INT NOT NULL,
    warranty_start_date DATE NOT NULL,
    warranty_expiry_date DATE NOT NULL,
    description VARCHAR(1000) DEFAULT NULL,
    receipt_file_name VARCHAR(255) DEFAULT NULL,
    receipt_original_name VARCHAR(255) DEFAULT NULL,
    receipt_content_type VARCHAR(100) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_product_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_product_user (user_id),
    INDEX idx_product_expiry (warranty_expiry_date),
    INDEX idx_product_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE repairs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    product_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    issue_title VARCHAR(200) NOT NULL,
    issue_description VARCHAR(2000) NOT NULL,
    request_date DATE NOT NULL,
    service_center_name VARCHAR(150) NOT NULL,
    service_center_contact VARCHAR(150) DEFAULT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'REQUESTED',
    cost DECIMAL(10, 2) DEFAULT NULL,
    warranty_claim BOOLEAN NOT NULL DEFAULT FALSE,
    completion_date DATE DEFAULT NULL,
    notes VARCHAR(2000) DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_repair_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
    CONSTRAINT fk_repair_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_repair_product (product_id),
    INDEX idx_repair_user (user_id),
    INDEX idx_repair_status (status),
    INDEX idx_repair_request_date (request_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    product_id BIGINT DEFAULT NULL,
    title VARCHAR(200) NOT NULL,
    message VARCHAR(1000) NOT NULL,
    type VARCHAR(30) NOT NULL DEFAULT 'EXPIRY_WARNING',
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    reminder_window_days INT DEFAULT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_notification_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_notification_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL,
    INDEX idx_notification_user (user_id),
    INDEX idx_notification_read (is_read),
    INDEX idx_notification_user_prod_window (user_id, product_id, reminder_window_days)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
