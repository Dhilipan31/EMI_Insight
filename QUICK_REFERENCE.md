# EMI Insight API - Quick Reference Guide

## 📋 Quick Links
- **API Documentation:** See `API_DOCUMENTATION.md` for complete details
- **Postman Collection:** Import `Postman_Collection.json` into Postman for testing
- **Base URL:** `http://localhost:8080`

---

## 🔐 Authentication Flow

```
1. Register → /auth/register (POST)
2. Login → /auth/login (POST) → Get JWT Token
3. Use Token → Include in Authorization header: "Bearer <token>"
```

---

## 📱 Endpoint Summary

### Authentication (No Token Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Create new user account |
| POST | `/auth/login` | Login and get JWT token |

### Authentication (Token Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/auth/profile` | Get user profile info |
| PUT | `/auth/profile` | Update profile (name, salary, expense) |

### Loans (Token Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/loans` | Create new loan |
| GET | `/loans/all` | Get all user loans |
| GET | `/loans/{loanId}` | Get specific loan details |

### Payments (Token Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/loans/{loanId}/payments` | Make EMI payment (date must match schedule) |
| POST | `/loans/{loanId}/prepayment` | Make additional prepayment |
| POST | `/loans/{loanId}/simulate-prepayment` | Simulate prepayment + get recommendation |

### Dashboard (Token Required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Get dashboard summary |

---

## 🎯 Key Features

### 1. User Profile Management (NEW)
```bash
# Get profile
GET /auth/profile
Header: Authorization: Bearer <token>

# Update profile
PUT /auth/profile
Header: Authorization: Bearer <token>
Body: {
  "username": "Jane Doe",
  "salary": 600000.00,
  "monthlyExpense": 55000.00
}
```

### 2. Loan Creation with Payment Schedule (ENHANCED)
```bash
POST /loans
Body: {
  "name": "Home Loan",
  "principal": 2000000.00,
  "interestRate": 7.5,
  "tenureMonths": 240,
  "startDate": "2026-03-01",
  "emiPayDay": 15  # Day of month (1-28) - NEW
}
```

### 3. EMI Payment with Date Validation (ENHANCED)
```bash
POST /loans/{loanId}/payments
Body: {
  "amount": 14094.84,
  "type": "EMI",
  "paymentDate": "2026-04-15"
}

# ⚠️ IMPORTANT: Payment date MUST match today AND nextPaymentDate
# Otherwise: "Payment can only be made on the scheduled date: 2026-04-15"
```

After successful payment:
- `lastPaymentDate` → Set to today
- `nextPaymentDate` → Auto-calculated (one month later)
- `emiPaidCount` → Incremented
- `remainingPrincipal` → Updated

### 4. Prepayment Simulation with Smart Recommendations (NEW)
```bash
POST /loans/{loanId}/simulate-prepayment
Body: {
  "extraAmount": 100000.00
}

Response includes:
{
  "interestSaved": 45000.00,
  "monthsReduced": 12,
  "newClosingDate": "2034-03-15",
  "recommendation": "TENURE_REDUCTION",  # NEW
  "reason": "Disposable income (35.50%) is greater than 30%..."  # NEW
}
```

**Recommendation Logic:**
- **Disposable Income = Salary - Monthly Expense - Total Monthly EMI**
- If **> 30% of salary** → Recommend `TENURE_REDUCTION` (save interest)
- If **≤ 30% of salary** → Recommend `EMI_REDUCTION` (maintain flexibility)

---

## 📊 Data Models

### User
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "username": "John Doe",
  "email": "john@example.com",
  "salary": 500000.00,           // NEW
  "monthlyExpense": 50000.00     // NEW
}
```

### Loan
```json
{
  "loanId": "loan-550e8400-e29b-41d4-a716",
  "name": "Home Loan",
  "principal": 2000000.00,
  "interestRate": 7.5,
  "tenureMonths": 240,
  "emi": 14094.84,
  "remaining_principal": 1850000.00,
  "interest_paid": 50000.00,
  "emi_paid_count": 5,
  "loan_status": "ACTIVE",
  "startDate": "2026-03-01",
  "emiPayDay": 15,               // NEW (1-28)
  "lastPaymentDate": "2026-04-15",          // NEW
  "nextPaymentDate": "2026-05-15"           // NEW
}
```

---

## ⚡ Common Workflows

### Workflow 1: Set up User Profile with Salary
```bash
# 1. Register
POST /auth/register
→ Get user account

# 2. Update profile with salary info
PUT /auth/profile
Body: { "salary": 500000, "monthlyExpense": 50000 }

# 3. Create loan
POST /loans
Body: { ..., "emiPayDay": 15 }
→ nextPaymentDate calculated automatically
```

### Workflow 2: Make EMI Payment on Scheduled Date
```bash
# 1. Check loan details
GET /loans/{loanId}
→ See nextPaymentDate (e.g., 2026-04-15)

# 2. On that date, make payment
POST /loans/{loanId}/payments
Body: {
  "amount": 14094.84,
  "type": "EMI",
  "paymentDate": "2026-04-15"  # Must match today
}
→ lastPaymentDate updated
→ nextPaymentDate auto-calculated to 2026-05-15
```

### Workflow 3: Simulate Prepayment with Recommendations
```bash
# 1. Set user salary/expense (if not done)
PUT /auth/profile
Body: { "salary": 500000, "monthlyExpense": 50000 }

# 2. Simulate prepayment
POST /loans/{loanId}/simulate-prepayment
Body: { "extraAmount": 100000 }

# 3. Get recommendation
Response: {
  "recommendation": "TENURE_REDUCTION",
  "reason": "Disposable income (35.50%) > 30%..."
}

# 4. If satisfied, make actual prepayment
POST /loans/{loanId}/prepayment
Body: { "amount": 100000, "mode": "TENURE_REDUCTION", ... }
```

---

## ❌ Common Errors & Solutions

### 1. Payment Date Mismatch
**Error:** `"Payment can only be made on the scheduled date: 2026-04-15"`
**Solution:**
- Check loan's `nextPaymentDate`
- Make payment exactly on that date
- Ensure `paymentDate` in request matches today

### 2. Invalid emiPayDay
**Error:** `"emiPayDay must be between 1 and 28"`
**Solution:**
- Use day of month between 1-28
- Day 29-31 not supported (to handle all months uniformly)

### 3. EMI Amount Mismatch
**Error:** `"EMI amount must match loan EMI"`
**Solution:**
- Query loan details: `GET /loans/{loanId}`
- Pay exactly the `emi` amount shown

### 4. Loan Already Closed
**Error:** `"Loan already closed"`
**Solution:**
- Check loan status: `GET /loans/{loanId}`
- Create new loan if needed

### 5. No Authorization Token
**Error:** `"Authenticated user not found"`
**Solution:**
- Login to get token: `POST /auth/login`
- Include token in header: `Authorization: Bearer <token>`

---

## 🧪 Testing with cURL

### Quick Test Sequence
```bash
# 1. Register
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"Test","email":"test@example.com","password":"pass123"}'

# 2. Login (save token)
TOKEN=$(curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}' | jq -r '.token')

# 3. Update profile
curl -X PUT http://localhost:8080/auth/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"salary":500000,"monthlyExpense":50000}'

# 4. Create loan
LOAN=$(curl -X POST http://localhost:8080/loans \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Loan","principal":100000,"interestRate":7.5,"tenureMonths":60,"startDate":"2026-03-01","emiPayDay":15}' | jq -r '.loanId')

# 5. Get loan details
curl -X GET http://localhost:8080/loans/$LOAN \
  -H "Authorization: Bearer $TOKEN"

# 6. Simulate prepayment
curl -X POST http://localhost:8080/loans/$LOAN/simulate-prepayment \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"extraAmount":10000}'
```

---

## 📈 Database Schema (New Fields)

### users table
```sql
ALTER TABLE users ADD COLUMN salary DOUBLE;
ALTER TABLE users ADD COLUMN monthly_expense DOUBLE;
```

### loans table
```sql
ALTER TABLE loans ADD COLUMN emi_pay_day INT;
ALTER TABLE loans ADD COLUMN last_payment_date DATE;
ALTER TABLE loans ADD COLUMN next_payment_date DATE;
```

---

## 🔄 Field Update Logic

### After EMI Payment
| Field | Action |
|-------|--------|
| `lastPaymentDate` | Set to payment date |
| `nextPaymentDate` | Add 1 month |
| `emiPaidCount` | Increment by 1 |
| `remainingPrincipal` | Reduce by principal paid |
| `interestPaid` | Add interest component |
| `remainingEmiMonth` | Decrement by 1 |
| `loanStatus` | CLOSED if balance = 0 |

### After Prepayment (TENURE_REDUCTION)
| Field | Action |
|-------|--------|
| `remainingPrincipal` | Reduce by prepayment amount |
| `remainingEmiMonth` | Recalculated based on new balance |
| `loanStatus` | CLOSED if balance = 0 |

### After Prepayment (EMI_REDUCTION)
| Field | Action |
|-------|--------|
| `remainingPrincipal` | Reduce by prepayment amount |
| `emi` | Recalculated based on new balance & remaining tenure |
| `loanStatus` | CLOSED if balance = 0 |

---

## 📞 Support & Documentation

- **Full API Docs:** `API_DOCUMENTATION.md`
- **Postman Collection:** `Postman_Collection.json`
- **Git Repository:** Commit changes with meaningful messages
- **Build:** `./mvnw clean compile`
- **Test:** `./mvnw test` (when tests are added)

---

**Version:** 2.0 (EMI Payment Schedule + Recommendations)
**Status:** Production Ready
**Last Updated:** March 1, 2026
