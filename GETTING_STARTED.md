# EMI Insight - Getting Started Guide

## Prerequisites
- Java 17+ installed
- Maven 3.6+
- PostgreSQL/MySQL database
- Postman (optional, for API testing)

---

## 1. Database Setup

### Create Database
```sql
CREATE DATABASE emi_insight;
```

### Create Tables

```sql
-- Users Table
CREATE TABLE users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  salary DOUBLE,
  monthly_expense DOUBLE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Loans Table
CREATE TABLE loans (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  loan_id VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  principal DOUBLE NOT NULL,
  interest_rate DOUBLE NOT NULL,
  tenure_months INT NOT NULL,
  emi DOUBLE NOT NULL,
  remaining_principal DOUBLE,
  interest_paid DOUBLE,
  emi_paid_count INT DEFAULT 0,
  remaining_emi_month INT,
  loan_status VARCHAR(50) DEFAULT 'ACTIVE',
  start_date DATE,
  emi_pay_day INT,
  last_payment_date DATE,
  next_payment_date DATE,
  user_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Payments Table
CREATE TABLE Payment_tbl (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  payment_id VARCHAR(255) UNIQUE NOT NULL,
  amount DOUBLE NOT NULL,
  principal_paid DOUBLE,
  interest_paid DOUBLE,
  payment_date DATE,
  type VARCHAR(50),
  loan_id BIGINT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (loan_id) REFERENCES loans(id)
);
```

---

## 2. Configuration

### Update `application.properties`
Located in `src/main/resources/application.properties`

```properties
# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/emi_insight
spring.datasource.username=root
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect
spring.jpa.properties.hibernate.format_sql=true

# Server
server.port=8080
spring.application.name=EMI_Insight

# JWT Secret (Change this in production!)
jwt.secret=your_secret_key_min_32_characters_long
jwt.expiration=86400000

# Logging
logging.level.root=INFO
logging.level.com.example.emi_insight=DEBUG
```

### For PostgreSQL
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/emi_insight
spring.datasource.username=postgres
spring.datasource.password=your_password
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect
```

---

## 3. Build & Run

### Build Project
```bash
cd "d:\Courses\SpringBoot\EMI Insight"

# Clean build
./mvnw clean build

# Compile only
./mvnw clean compile
```

### Run Application
```bash
# Using Maven
./mvnw spring-boot:run

# Or build JAR and run
./mvnw clean package -DskipTests
java -jar target/EMI_Insight-0.0.1-SNAPSHOT.jar
```

The API will be available at: `http://localhost:8080`

---

## 4. Verify Installation

### Check Application Health
```bash
curl http://localhost:8080/actuator/health
```

Expected response:
```json
{
  "status": "UP"
}
```

---

## 5. Testing the API

### Option 1: Using Postman
1. Open Postman
2. Import `Postman_Collection.json` into your workspace
3. Set variables:
   - `token`: Leave empty (will be populated after login)
   - `loanId`: Leave empty (will be populated after creating a loan)
4. Start with "Auth" folder and work through the workflows

### Option 2: Using cURL
See `QUICK_REFERENCE.md` for cURL examples

### Option 3: Using VS Code REST Client
Create `.http` file with requests:
```http
### Register
POST http://localhost:8080/auth/register
Content-Type: application/json

{
  "username": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}

### Login
POST http://localhost:8080/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

---

## 6. First Test Workflow

### Step 1: Register New User
```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Demo User",
    "email": "demo@example.com",
    "password": "demoPassword123"
  }'
```

### Step 2: Login
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "demo@example.com",
    "password": "demoPassword123"
  }'
```

Save the `token` from response.

### Step 3: Update Profile with Salary
```bash
TOKEN="<token_from_login>"

curl -X PUT http://localhost:8080/auth/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Demo User",
    "salary": 500000.00,
    "monthlyExpense": 50000.00
  }'
```

### Step 4: Create a Loan
```bash
curl -X POST http://localhost:8080/loans \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Home Loan",
    "principal": 2000000.00,
    "interestRate": 7.5,
    "tenureMonths": 240,
    "startDate": "2026-03-01",
    "emiPayDay": 15
  }'
```

Save the `loanId` from response.

### Step 5: Get Loan Details
```bash
LOAN_ID="<loan_id_from_creation>"

curl -X GET http://localhost:8080/loans/$LOAN_ID \
  -H "Authorization: Bearer $TOKEN"
```

### Step 6: Simulate Prepayment (with Recommendation)
```bash
curl -X POST http://localhost:8080/loans/$LOAN_ID/simulate-prepayment \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"extraAmount": 100000.00}'
```

You should see a response with:
- `interestSaved`
- `monthsReduced`
- `newClosingDate`
- `recommendation` (TENURE_REDUCTION or EMI_REDUCTION)
- `reason` (explaining the recommendation)

---

## 7. Troubleshooting

### Issue: Database Connection Failed
**Solution:**
- Verify database is running
- Check credentials in `application.properties`
- Ensure database exists: `CREATE DATABASE emi_insight;`

### Issue: Port Already in Use
**Solution:**
```bash
# Change port in application.properties
server.port=8081

# Or kill existing process
lsof -ti:8080 | xargs kill -9
```

### Issue: JWT Token Expired
**Solution:**
- Re-login to get new token
- Check `jwt.expiration` value in `application.properties`
- Default: 24 hours (86400000 ms)

### Issue: emiPayDay Validation Error
**Solution:**
- Ensure `emiPayDay` is between 1-28
- Cannot use 29, 30, or 31 to handle all months uniformly

### Issue: Payment Date Mismatch
**Solution:**
- Payment can ONLY be made on the scheduled `nextPaymentDate`
- Check loan details: `GET /loans/{loanId}` to see `nextPaymentDate`
- Make payment exactly on that date

---

## 8. Project Structure

```
EMI Insight/
├── src/main/java/com/example/emi_insight/
│   ├── controller/           # REST endpoints
│   ├── service/              # Business logic
│   ├── entity/               # JPA entities
│   ├── dto/                  # Data transfer objects
│   ├── repository/           # Database access
│   ├── util/                 # Utilities (JWT, etc.)
│   └── config/               # Spring configuration
├── src/main/resources/
│   └── application.properties # Configuration
├── src/test/                 # Test files
├── pom.xml                   # Maven dependencies
├── API_DOCUMENTATION.md      # Complete API docs
├── QUICK_REFERENCE.md        # Quick reference guide
├── Postman_Collection.json   # Postman collection
└── GETTING_STARTED.md        # This file
```

---

## 9. Important Files

| File | Purpose |
|------|---------|
| `API_DOCUMENTATION.md` | Complete API endpoint documentation |
| `QUICK_REFERENCE.md` | Quick reference for developers |
| `Postman_Collection.json` | Postman API collection for testing |
| `application.properties` | Server configuration |
| `pom.xml` | Maven dependencies |

---

## 10. Next Steps

1. **Review API Documentation:**
   - Open `API_DOCUMENTATION.md`
   - Understand all endpoints and their behavior

2. **Test with Postman:**
   - Import `Postman_Collection.json`
   - Follow example workflows

3. **Implement Frontend:**
   - React/Angular/Vue web application
   - Mobile application
   - Connect to API endpoints

4. **Add Tests:**
   - Unit tests for services
   - Integration tests for controllers
   - Use JUnit 5 + Mockito

5. **Deploy:**
   - Docker containerization
   - Cloud deployment (AWS, Azure, GCP)
   - Production hardening (security, monitoring)

---

## 11. Development Tips

### Enable Debug Logging
```properties
# application.properties
logging.level.com.example.emi_insight=DEBUG
logging.level.org.springframework.web=DEBUG
logging.level.org.springframework.security=DEBUG
```

### View SQL Queries
```properties
# application.properties
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE
```

### Hot Reload (Dev Tools)
Add Spring Boot DevTools for automatic restart:
```xml
<!-- pom.xml -->
<dependency>
  <groupId>org.springframework.boot</groupId>
  <artifactId>spring-boot-devtools</artifactId>
  <scope>runtime</scope>
  <optional>true</optional>
</dependency>
```

---

## 12. Performance Optimization

### Add Database Indexes
```sql
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_loan_user_id ON loans(user_id);
CREATE INDEX idx_loan_status ON loans(loan_status);
CREATE INDEX idx_payment_loan_id ON Payment_tbl(loan_id);
```

### Connection Pooling
Already configured with HikariCP in Spring Boot. Adjust if needed:
```properties
spring.datasource.hikari.maximum-pool-size=10
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.connection-timeout=20000
```

---

## 13. Security Checklist

- [ ] Change JWT secret in production
- [ ] Never commit sensitive config to git
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS in production
- [ ] Implement rate limiting
- [ ] Add request validation
- [ ] Enable CORS carefully
- [ ] Use strong password policies
- [ ] Implement audit logging
- [ ] Keep dependencies updated

---

## 14. Useful Commands

```bash
# Build without tests
./mvnw clean package -DskipTests

# Run tests
./mvnw test

# Generate project info
./mvnw project-info-reports:dependencies

# Check for security vulnerabilities
./mvnw org.owasp:dependency-check-maven:aggregate

# Format source code
./mvnw spotless:apply
```

---

## 15. Resources

- **Spring Boot Docs:** https://spring.io/projects/spring-boot
- **Spring Data JPA:** https://spring.io/projects/spring-data-jpa
- **Spring Security:** https://spring.io/projects/spring-security
- **JWT:** https://jwt.io/
- **REST Best Practices:** https://restfulapi.net/

---

**Setup Status: ✅ Complete**
**Ready to: Start development & testing**

For issues or questions, refer to:
1. `API_DOCUMENTATION.md` - Detailed API reference
2. `QUICK_REFERENCE.md` - Common tasks & solutions
3. This guide - Setup & troubleshooting
