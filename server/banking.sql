CREATE DATABASE IF NOT EXISTS banking_app;

USE banking_app;

-- =========================================
-- USERS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    full_name VARCHAR(150) NOT NULL,

    email VARCHAR(150) NOT NULL UNIQUE,

    phone VARCHAR(30) NOT NULL UNIQUE,

    account_number CHAR(10) NOT NULL UNIQUE,

    password_hash VARCHAR(255) NOT NULL,

    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,

    address VARCHAR(255) NULL,

    city VARCHAR(100) NULL,

    state VARCHAR(100) NULL,

    country VARCHAR(100) NOT NULL DEFAULT 'Nigeria',

    profile_picture VARCHAR(255) NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ON UPDATE CURRENT_TIMESTAMP
);


-- =========================================
-- TRANSACTIONS TABLE
-- =========================================

CREATE TABLE IF NOT EXISTS transactions (

    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    user_id BIGINT UNSIGNED NOT NULL,

    type ENUM(
        'DEPOSIT',
        'WITHDRAWAL',
        'TRANSFER_IN',
        'TRANSFER_OUT'
    ) NOT NULL,

    amount DECIMAL(15, 2) NOT NULL,

    balance_after DECIMAL(15, 2) NOT NULL,

    reference VARCHAR(100) NOT NULL UNIQUE,

    related_account VARCHAR(10) NULL,

    description VARCHAR(255) NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_transactions_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);


-- =========================================
-- INDEXES
-- =========================================

CREATE INDEX idx_users_email
ON users(email);

CREATE INDEX idx_users_account_number
ON users(account_number);

CREATE INDEX idx_transactions_user
ON transactions(user_id);

CREATE INDEX idx_transactions_created
ON transactions(created_at);