# EMI Insight Backend - API Documentation

## Base URL
```
http://localhost:8080
```

## Authentication
All endpoints (except `/auth/register` and `/auth/login`) require a valid JWT token in the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

---

# 1. AUTHENTICATION ENDPOINTS

## 1.1 Register User
**Endpoint:** `POST /auth/register`
**Authentication:** Not required
**Description:** Create a new user account

### Request
```json
{
  "username": "John Doe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Response (201 Created)
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "username": "John Doe",
  "email": "john@example.com",
  "token": null
}
```

### Error Response (400 Bad Request)
```json
{
  "message": "Email is already registered"
}
```

### cURL Example
```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

---

## 1.2 Login User
**Endpoint:** `POST /auth/login`
**Authentication:** Not required
**Description:** Authenticate user and receive JWT token

### Request
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

### Response (200 OK)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "username": "John Doe",
  "email": "john@example.com"
}
```

### Error Response (401 Unauthorized)
```json
{
  "message": "Invalid email or password"
}
```

### cURL Example
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

---

## 1.3 Get User Profile
**Endpoint:** `GET /auth/profile`
**Authentication:** Required
**Description:** Retrieve authenticated user's profile information

### Request
```
No body required
```

### Response (200 OK)
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "username": "John Doe",
  "email": "john@example.com",
  "salary": 500000.00,
  "monthlyExpense": 50000.00
}
```

### Error Response (401 Unauthorized)
```json
{
  "message": "Authenticated user not found"
}
```

### cURL Example
```bash
curl -X GET http://localhost:8080/auth/profile \
  -H "Authorization: Bearer <jwt_token>"
```

---

## 1.4 Update User Profile
**Endpoint:** `PUT /auth/profile`
**Authentication:** Required
**Description:** Update authenticated user's profile (name, salary, monthly expense)

### Request
```json
{
  "username": "Jane Doe",
  "salary": 600000.00,
  "monthlyExpense": 55000.00
}
```

**Notes:**
- All fields are optional
- `salary` and `monthlyExpense` must be >= 0
- Only authenticated user can modify their own data

### Response (200 OK)
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "username": "Jane Doe",
  "email": "john@example.com",
  "salary": 600000.00,
  "monthlyExpense": 55000.00
}
```

### Error Response (401 Unauthorized)
```json
{
  "message": "Authenticated user not found"
}
```

### cURL Example
```bash
curl -X PUT http://localhost:8080/auth/profile \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "Jane Doe",
    "salary": 600000.00,
    "monthlyExpense": 55000.00
  }'
```

---

# 2. LOAN MANAGEMENT ENDPOINTS

## 2.1 Create Loan
**Endpoint:** `POST /loans`
**Authentication:** Required
**Description:** Create a new loan with EMI payment schedule

### Request
```json
{
  "name": "Home Loan",
  "principal": 2000000.00,
  "interestRate": 7.5,
  "tenureMonths": 240,
  "startDate": "2026-03-01",
  "emiPayDay": 15
}
```

**Field Validation:**
- `principal`: Must be > 0
- `interestRate`: Annual interest rate (%)
- `tenureMonths`: Total loan tenure in months
- `startDate`: Loan start date (format: YYYY-MM-DD)
- `emiPayDay`: **NEW** - Day of month for EMI payment (1-28, required)

### Response (201 Created)
```json
{
  "loanId": "loan-550e8400-e29b-41d4-a716",
  "name": "Home Loan",
  "principal": 2000000.00,
  "interestRate": 7.5,
  "tenureMonths": 240,
  "emi": 14094.84,
  "startDate": "2026-03-01"
}
```

### Error Response (400 Bad Request)
```json
{
  "message": "emiPayDay must be between 1 and 28"
}
```

### cURL Example
```bash
curl -X POST http://localhost:8080/loans \
  -H "Authorization: Bearer <jwt_token>" \
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

---

## 2.2 Get All User Loans
**Endpoint:** `GET /loans/all`
**Authentication:** Required
**Description:** Retrieve all loans belonging to authenticated user

### Request
```
No body required
```

### Response (200 OK)
```json
[
  {
    "loanId": "loan-550e8400-e29b-41d4-a716",
    "name": "Home Loan",
    "principal": 2000000.00,
    "interestRate": 7.5,
    "tenureMonths": 240,
    "emi": 14094.84,
    "startDate": "2026-03-01"
  },
  {
    "loanId": "loan-660e8400-e29b-41d4-a716",
    "name": "Car Loan",
    "principal": 500000.00,
    "interestRate": 8.5,
    "tenureMonths": 60,
    "emi": 9709.25,
    "startDate": "2026-03-01"
  }
]
```

### cURL Example
```bash
curl -X GET http://localhost:8080/loans/all \
  -H "Authorization: Bearer <jwt_token>"
```

---

## 2.3 Get Loan Details
**Endpoint:** `GET /loans/{loanId}`
**Authentication:** Required
**Description:** Retrieve detailed information for a specific loan

### Request
```
No body required
```

**Path Parameters:**
- `loanId`: Loan identifier (from creation response)

### Response (200 OK)
```json
{
  "loanId": "loan-550e8400-e29b-41d4-a716",
  "outstandingBalance": 1850000.00,
  "interestPaid": 50000.00,
  "amortizationSummary": {
    "totalPaid": 100000.00,
    "principalPaid": 50000.00,
    "paidInstallments": 5,
    "remainingInstallments": 235,
    "emi": 14094.84
  }
}
```

**Response Fields:**
- `outstandingBalance`: Remaining principal
- `interestPaid`: Total interest paid so far
- `amortizationSummary`:
  - `totalPaid`: Total amount paid (principal + interest)
  - `principalPaid`: Principal portion paid
  - `paidInstallments`: Number of EMIs paid
  - `remainingInstallments`: Remaining EMI payments
  - `emi`: Monthly EMI amount

### cURL Example
```bash
curl -X GET http://localhost:8080/loans/loan-550e8400-e29b-41d4-a716 \
  -H "Authorization: Bearer <jwt_token>"
```

---

# 3. PAYMENT ENDPOINTS

## 3.1 Make EMI Payment
**Endpoint:** `POST /loans/{loanId}/payments`
**Authentication:** Required
**Description:** Record an EMI payment for a loan

### Request
```json
{
  "amount": 14094.84,
  "type": "EMI",
  "paymentDate": "2026-04-15"
}
```

**Field Validation:**
- `amount`: Must match loan EMI amount and be > 0
- `type`: Must be "EMI"
- `paymentDate`: **NEW VALIDATION** - Must match today's date AND scheduled `nextPaymentDate`

**Payment Date Logic:**
- Payment can **ONLY** be made on the scheduled due date
- If today is not the `nextPaymentDate`, payment is rejected
- Error: `"Payment date must be today. Expected: 2026-04-15, but provided: 2026-04-20"`

### Response (201 Created)
```json
{
  "paymentId": "payment-770e8400-e29b-41d4-a716",
  "loanId": "loan-550e8400-e29b-41d4-a716",
  "amount": 14094.84,
  "type": "EMI",
  "paymentDate": "2026-04-15"
}
```

**Entity Updates After Payment:**
- `lastPaymentDate` → Set to payment date
- `nextPaymentDate` → Automatically calculated (one month later, same day)
- `emiPaidCount` → Incremented by 1
- `remainingPrincipal` → Reduced by principal portion
- Interest and principal portions calculated automatically

### Error Responses (400 Bad Request)
```json
{
  "message": "Payment can only be made on the scheduled date: 2026-04-15"
}
```

```json
{
  "message": "Amount must be greater than 0"
}
```

```json
{
  "message": "EMI amount must match loan EMI"
}
```

### cURL Example
```bash
curl -X POST http://localhost:8080/loans/loan-550e8400-e29b-41d4-a716/payments \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 14094.84,
    "type": "EMI",
    "paymentDate": "2026-04-15"
  }'
```

---

## 3.2 Make Prepayment
**Endpoint:** `POST /loans/{loanId}/prepayment`
**Authentication:** Required
**Description:** Make an additional prepayment toward a loan

### Request
```json
{
  "amount": 100000.00,
  "paymentDate": "2026-04-20",
  "mode": "TENURE_REDUCTION"
}
```

**Field Validation:**
- `amount`: Must be > 0
- `paymentDate`: Date of prepayment
- `mode`: Either "TENURE_REDUCTION" or "EMI_REDUCTION"
  - `TENURE_REDUCTION`: Reduces loan tenure, keeps EMI same
  - `EMI_REDUCTION`: Reduces monthly EMI, keeps tenure same

### Response (201 Created)
```json
{
  "paymentId": "payment-880e8400-e29b-41d4-a716",
  "loanId": "loan-550e8400-e29b-41d4-a716",
  "amount": 100000.00,
  "type": "PRE_PAYMENT",
  "paymentDate": "2026-04-20"
}
```

### Error Response (400 Bad Request)
```json
{
  "message": "Loan already closed"
}
```

### cURL Example (TENURE_REDUCTION)
```bash
curl -X POST http://localhost:8080/loans/loan-550e8400-e29b-41d4-a716/prepayment \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100000.00,
    "paymentDate": "2026-04-20",
    "mode": "TENURE_REDUCTION"
  }'
```

### cURL Example (EMI_REDUCTION)
```bash
curl -X POST http://localhost:8080/loans/loan-550e8400-e29b-41d4-a716/prepayment \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100000.00,
    "paymentDate": "2026-04-20",
    "mode": "EMI_REDUCTION"
  }'
```

---

## 3.3 Simulate Prepayment with Salary-Based Recommendation
**Endpoint:** `POST /loans/{loanId}/simulate-prepayment`
**Authentication:** Required
**Description:** Simulate prepayment impact and receive financial recommendations

**NEW FEATURE:** Provides salary-based recommendations based on disposable income

### Request
```json
{
  "extraAmount": 100000.00
}
```

**Field Validation:**
- `extraAmount`: Amount to prepay (must be > 0)

### Response (200 OK)
```json
{
  "interestSaved": 45000.00,
  "monthsReduced": 12,
  "newClosingDate": "2034-03-15",
  "recommendation": "TENURE_REDUCTION",
  "reason": "Disposable income (35.50%) is greater than 30% of salary. Recommended to use prepayment to reduce tenure and save on interest."
}
```

### Recommendation Logic

**Disposable Income Calculation:**
```
Disposable Income = Salary - Monthly Expense - Total Monthly EMI (all active loans)
Percentage = (Disposable Income / Salary) × 100
```

**Recommendation Rules:**
1. **If Disposable Income > 30% of salary:**
   - Recommendation: `TENURE_REDUCTION`
   - Reason: High disposable income, prioritize interest savings

2. **If Disposable Income ≤ 30% of salary:**
   - Recommendation: `EMI_REDUCTION`
   - Reason: Tight cash flow, maintain flexibility

3. **If salary/expense not set:**
   - Recommendation: `N/A`
   - Reason: `"User has not set salary or monthly expense"`

### Response Fields
- `interestSaved`: Estimated interest savings
- `monthsReduced`: Number of months tenure reduced
- `newClosingDate`: Projected loan closing date after prepayment
- `recommendation`: `TENURE_REDUCTION` or `EMI_REDUCTION` (NEW)
- `reason`: Detailed explanation of recommendation (NEW)

### Note
**Simulation does NOT persist** to database - it's read-only analysis

### cURL Example
```bash
curl -X POST http://localhost:8080/loans/loan-550e8400-e29b-41d4-a716/simulate-prepayment \
  -H "Authorization: Bearer <jwt_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "extraAmount": 100000.00
  }'
```

---

# 4. DASHBOARD ENDPOINT

## 4.1 Get Dashboard Summary
**Endpoint:** `GET /dashboard`
**Authentication:** Required
**Description:** Get comprehensive dashboard with all loans summary

### Request
```
No body required
```

### Response (200 OK)
```json
{
  "totalOutstanding": 2850000.00,
  "totalMonthlyEmi": 23804.09,
  "totalInterestRemaining": 1200000.00,
  "debtFreeDate": "2044-03-15",
  "highestInterestLoan": {
    "loanId": "loan-550e8400-e29b-41d4-a716",
    "name": "Home Loan",
    "interestRate": 7.5
  },
  "loanDistribution": [
    {
      "name": "Home Loan",
      "amount": 1850000.00
    },
    {
      "name": "Car Loan",
      "amount": 1000000.00
    }
  ]
}
```

**Response Fields:**
- `totalOutstanding`: Sum of all outstanding loan balances
- `totalMonthlyEmi`: Sum of all active loan EMIs
- `totalInterestRemaining`: Estimated remaining interest
- `debtFreeDate`: Projected date when all loans will be closed
- `highestInterestLoan`: Loan with highest interest rate
- `loanDistribution`: Breakdown of outstanding balance by loan

### cURL Example
```bash
curl -X GET http://localhost:8080/dashboard \
  -H "Authorization: Bearer <jwt_token>"
```

---

# 5. ERROR HANDLING

## Standard Error Response Format
All error responses follow this format:

```json
{
  "message": "Error description"
}
```

## Common HTTP Status Codes

| Status | Meaning | Scenario |
|--------|---------|----------|
| 200 | OK | Successful GET/PUT request |
| 201 | Created | Successful POST request (resource created) |
| 400 | Bad Request | Invalid input, validation failed |
| 401 | Unauthorized | Missing/invalid JWT token, authentication failed |
| 404 | Not Found | Loan not found for user |

## Common Error Messages

| Error | Status | Cause |
|-------|--------|-------|
| `"Authenticated user not found"` | 401 | Invalid or missing JWT token |
| `"emiPayDay must be between 1 and 28"` | 400 | Invalid emiPayDay in loan creation |
| `"Payment can only be made on the scheduled date: YYYY-MM-DD"` | 400 | EMI payment attempted on wrong date |
| `"Loan not found for this user"` | 400 | loanId doesn't belong to authenticated user |
| `"Email is already registered"` | 400 | Email already exists |
| `"Invalid email or password"` | 401 | Login credentials incorrect |
| `"Loan already closed"` | 400 | Cannot make payment on closed loan |
| `"EMI amount must match loan EMI"` | 400 | Payment amount doesn't match EMI |

---

# 6. AUTHENTICATION TOKEN USAGE

## Getting Token
```bash
# 1. Login to get token
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }' \
  | jq '.token'
```

## Using Token in Headers
```bash
# Store token in variable
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Use in API calls
curl -X GET http://localhost:8080/loans/all \
  -H "Authorization: Bearer $TOKEN"
```

---

# 7. COMPLETE WORKFLOW EXAMPLE

### Step 1: Register User
```bash
curl -X POST http://localhost:8080/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "John Doe",
    "email": "john@example.com",
    "password": "securePassword123"
  }'
```

### Step 2: Login User
```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securePassword123"
  }'

# Response includes token - save it as $TOKEN
```

### Step 3: Update Profile with Salary
```bash
curl -X PUT http://localhost:8080/auth/profile \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "John Doe",
    "salary": 500000.00,
    "monthlyExpense": 50000.00
  }'
```

### Step 4: Create Loan
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

# Response includes loanId - save it as $LOAN_ID
```

### Step 5: Get Loan Details
```bash
curl -X GET http://localhost:8080/loans/$LOAN_ID \
  -H "Authorization: Bearer $TOKEN"
```

### Step 6: Simulate Prepayment with Recommendation
```bash
curl -X POST http://localhost:8080/loans/$LOAN_ID/simulate-prepayment \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "extraAmount": 100000.00
  }'
```

### Step 7: Make EMI Payment (on scheduled date)
```bash
curl -X POST http://localhost:8080/loans/$LOAN_ID/payments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 14094.84,
    "type": "EMI",
    "paymentDate": "2026-04-15"
  }'
```

### Step 8: Get Dashboard
```bash
curl -X GET http://localhost:8080/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

---

# 8. DATA TYPES & FORMATS

## Date Format
All dates use ISO 8601 format: `YYYY-MM-DD`
```
"2026-03-01"
"2026-04-15"
```

## Numeric Types
- **Monetary values** (salary, principal, EMI, etc.): `Double`
  - Example: `2000000.00`, `14094.84`
- **Interest rate** (annual %): `Double`
  - Example: `7.5` (represents 7.5% per annum)
- **Days/Months**: `Integer`
  - Example: `15` (day of month), `240` (months)

## Enumerations
- **Loan Status**: `ACTIVE`, `CLOSED`
- **Payment Type**: `EMI`, `PRE_PAYMENT`
- **Prepayment Mode**: `TENURE_REDUCTION`, `EMI_REDUCTION`

---

# 9. FIELD CONSTRAINTS & VALIDATION

| Field | Type | Min | Max | Required | Notes |
|-------|------|-----|-----|----------|-------|
| `username` | String | - | 255 | Yes | For registration |
| `email` | String | - | 255 | Yes | Must be unique |
| `password` | String | 6 | 255 | Yes | - |
| `salary` | Double | 0 | - | No | Can be null initially |
| `monthlyExpense` | Double | 0 | - | No | Can be null initially |
| `principal` | Double | > 0 | - | Yes | Loan amount |
| `interestRate` | Double | 0 | - | Yes | Annual % |
| `tenureMonths` | Integer | > 0 | - | Yes | Total months |
| `emiPayDay` | Integer | 1 | 28 | Yes | **NEW** - Day of month |
| `amount` | Double | > 0 | - | Yes | Payment amount |

---

# 10. RATE LIMITING & BEST PRACTICES

- No built-in rate limiting (consider implementing if needed)
- Tokens have expiration - re-login if token expires
- Use batch operations where possible
- Cache loan details locally to reduce API calls
- Implement proper error handling in client applications

---

# 11. CHANGELOG - NEW FEATURES

## Version 2.0 - User Profile & Payment Schedule Management

### New Fields Added

**UserEntity:**
- `salary` - User's annual salary
- `monthlyExpense` - User's monthly expenses

**LoanEntity:**
- `emiPayDay` - Day of month for EMI payment (1-28)
- `lastPaymentDate` - Date of last EMI paid
- `nextPaymentDate` - Calculated due date for next EMI

**LoanRequestDTO:**
- `emiPayDay` - Required field for loan creation

### New Endpoints

- `GET /auth/profile` - Retrieve user profile
- `PUT /auth/profile` - Update user profile

### Enhanced Endpoints

- `POST /loans` - Now requires `emiPayDay` parameter
- `POST /loans/{loanId}/payments` - Date validation for scheduled payments
- `POST /loans/{loanId}/simulate-prepayment` - Now includes salary-based recommendations

### Enhanced Features

- **Payment Date Validation**: EMI can only be paid on scheduled date
- **Automatic Date Calculations**: `nextPaymentDate` automatically calculated after each payment
- **Salary-Based Recommendations**: Smart recommendations based on disposable income
- **Payment Tracking**: Track `lastPaymentDate` and `emiPaidCount` automatically

---

**API Version:** 2.0
**Last Updated:** March 1, 2026
**Status:** Production Ready
