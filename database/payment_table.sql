-- Create Payment table
CREATE TABLE IF NOT EXISTS Payment (
    ID BIGINT PRIMARY KEY AUTO_INCREMENT,
    AccountID BIGINT,
    Amount DOUBLE NOT NULL,
    TransactionID VARCHAR(255) UNIQUE,
    Gateway VARCHAR(100),
    Content NVARCHAR(1000),
    ReferenceCode VARCHAR(255),
    Status VARCHAR(50) NOT NULL,
    PaymentMethod VARCHAR(50),
    TransactionDate VARCHAR(50),
    SubscriptionID BIGINT,
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    UpdatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (AccountID) REFERENCES Account(ID) ON DELETE SET NULL,
    FOREIGN KEY (SubscriptionID) REFERENCES Subscription(ID) ON DELETE SET NULL,
    INDEX idx_transaction_id (TransactionID),
    INDEX idx_account_id (AccountID),
    INDEX idx_status (Status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert sample Premium subscription if not exists
INSERT INTO Subscription (Name, Description, Price, TimeOfExpiration, isActive, CreatedAt, UpdatedAt)
SELECT 'Premium', 'Gói Premium với đầy đủ tính năng AI', 29000.0, 30, TRUE, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM Subscription WHERE Name = 'Premium');
