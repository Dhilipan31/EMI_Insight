# EMI Insight API - Advanced Features & Edge Cases

## Table of Contents
1. [Payment Schedule Logic](#1-payment-schedule-logic)
2. [Salary-Based Recommendations](#2-salary-based-recommendations)
3. [Edge Cases & Handling](#3-edge-cases--handling)
4. [Financial Calculations](#4-financial-calculations)
5. [Data Integrity](#5-data-integrity)
6. [Performance Considerations](#6-performance-considerations)
7. [Advanced Scenarios](#7-advanced-scenarios)

---

## 1. Payment Schedule Logic

### How nextPaymentDate is Calculated

#### During Loan Creation
```
IF startDate.dayOfMonth >= emiPayDay:
  nextPaymentDate = startDate + 1 month, then set day to emiPayDay
ELSE:
  nextPaymentDate = startDate with dayOfMonth set to emiPayDay
```

**Example 1:** Start on March 5, emiPayDay = 15
- Result: nextPaymentDate = March 15 (same month)

**Example 2:** Start on March 20, emiPayDay = 15
- Result: nextPaymentDate = April 15 (next month)

**Example 3:** Start on March 15, emiPayDay = 15
- Result: nextPaymentDate = April 15 (edge case - exactly on payment day)

#### After Each EMI Payment
```
nextPaymentDate = currentNextPaymentDate + 1 month
```

**Note:** The calculation preserves the day of month:
```
nextPaymentDate(May 15).plusMonths(1) = June 15
nextPaymentDate(Jan 31).plusMonths(1) = Feb 28/29 (Java LocalDate handles this)
```

### Payment Date Edge Cases

#### Case 1: Month with Fewer Days
```
Scheduled: January 31
After payment: nextPaymentDate = February 28/29 (Java auto-adjusts)
After next: nextPaymentDate = March 28/29
```

**Recommendation:** Use emiPayDay 1-28 to avoid month-end issues.

#### Case 2: Payment on Non-Scheduled Date
```
Scheduled nextPaymentDate: 2026-04-15
Today: 2026-04-14
Payment request with paymentDate: 2026-04-14

Error: "Payment can only be made on the scheduled date: 2026-04-15"
```

#### Case 3: Late Payment (Day After Scheduled)
```
Scheduled nextPaymentDate: 2026-04-15
Today: 2026-04-16
Payment request with paymentDate: 2026-04-16

Error: "Payment can only be made on the scheduled date: 2026-04-15"
```

**Handling:**
- Implement late payment fees (not in current system)
- Reschedule payment date manually (admin feature, future)

---

## 2. Salary-Based Recommendations

### Complete Recommendation Algorithm

```
INPUT:
  - User salary
  - User monthly expense
  - All active loans' EMI amounts
  - Prepayment amount
  - Current outstanding balance

CALCULATION:
  1. Total Monthly EMI = SUM(EMI for all ACTIVE loans)
  2. Disposable Income = Salary - Monthly Expense - Total Monthly EMI
  3. Disposable % = (Disposable Income / Salary) × 100

  4. Simulate prepayment impact:
     - New Outstanding = Current Outstanding - Prepayment
     - New Remaining Months = calculateRemainingMonths(New Outstanding)
     - Interest Saved = Calculate difference
     - Months Reduced = Current Remaining - New Remaining

  5. Recommendation:
     IF Disposable % > 30%:
       RECOMMEND: TENURE_REDUCTION (high financial flexibility)
       REASON: Focus on interest savings
     ELSE:
       RECOMMEND: EMI_REDUCTION (tight cash flow)
       REASON: Focus on monthly cash flow relief

OUTPUT:
  - recommendation: TENURE_REDUCTION | EMI_REDUCTION | N/A
  - reason: Explanation with calculated percentage
  - interestSaved: Amount saved
  - monthsReduced: Duration reduction
  - newClosingDate: Projected payoff date
```

### Example Scenarios

#### Scenario 1: High Disposable Income
```
User Profile:
  - Salary: 500,000/month
  - Monthly Expense: 50,000

Loans:
  - Home Loan EMI: 20,000
  - Car Loan EMI: 5,000
  - Total EMI: 25,000

Calculation:
  Disposable = 500,000 - 50,000 - 25,000 = 425,000
  Percentage = (425,000 / 500,000) × 100 = 85%

Result:
  recommendation: "TENURE_REDUCTION"
  reason: "Disposable income (85%) is greater than 30% of salary..."
```

#### Scenario 2: Tight Cash Flow
```
User Profile:
  - Salary: 200,000/month
  - Monthly Expense: 120,000

Loans:
  - Home Loan EMI: 40,000
  - Total EMI: 40,000

Calculation:
  Disposable = 200,000 - 120,000 - 40,000 = 40,000
  Percentage = (40,000 / 200,000) × 100 = 20%

Result:
  recommendation: "EMI_REDUCTION"
  reason: "Disposable income (20%) is less than or equal to 30%..."
```

#### Scenario 3: No Salary Information
```
User Profile:
  - Salary: null
  - Monthly Expense: null

Result:
  recommendation: "N/A"
  reason: "User has not set salary or monthly expense"

Action: User must first set salary via PUT /auth/profile
```

### Important Notes

1. **Simulation Only:** The `/simulate-prepayment` endpoint does NOT persist anything
2. **Recommendation is Advisory:** User chooses final prepayment mode
3. **Real Prepayment:** `/prepayment` endpoint applies actual prepayment
4. **Multi-Loan Logic:** Considers ALL active loans in disposable income calculation

---

## 3. Edge Cases & Handling

### Case A: Multiple Loans with Different Payment Dates

```
Situation:
  - Loan 1: emiPayDay = 10
  - Loan 2: emiPayDay = 20
  - Loan 3: emiPayDay = 30

Database:
  Loan 1 nextPaymentDate: 2026-04-10
  Loan 2 nextPaymentDate: 2026-04-20
  Loan 3 nextPaymentDate: 2026-04-30

Payment Logic:
  - Each loan payment validated independently
  - No cross-loan blocking
  - Disposable income considers ALL active EMIs
```

### Case B: Loan Closure During Payment

```
Scenario:
  Outstanding Principal: 100,000
  Schedule EMI: 15,000 (final installment)

Payment Processing:
  Amount Paid: 15,000
  Principal Portion: 100,000 (entire balance)
  Interest Portion: 0

  New Outstanding = 0
  Status: CLOSED
  EMI: 0
  Remaining Months: 0
```

### Case C: Zero / Null Salary

```
User Setup:
  salary = null
  monthlyExpense = 50,000

Simulation Result:
  - Cannot calculate
  - recommendation: "N/A"
  - reason: "User has not set salary..."

Workaround:
  PUT /auth/profile with salary > 0
```

### Case D: Negative Disposable Income

```
Example:
  Salary: 300,000
  Monthly Expense: 200,000
  Total EMI: 150,000

Result:
  Disposable = 300,000 - 200,000 - 150,000 = -50,000
  Percentage < 0% → Treated as ≤ 30%
  recommendation: "EMI_REDUCTION"

⚠️ Warning: User is over-leveraged and needs to reduce expenses or income is declining
```

### Case E: Payment Attempt on Non-Existent Loan

```
Request:
  POST /loans/invalid-loan-id/payments

Response:
  Status: 400 Bad Request
  Message: "Loan not found for this user"

Handling: Validate loanId ownership before payment
```

### Case F: Large Prepayment Amount

```
Scenario:
  Outstanding: 500,000
  Prepayment Request: 1,000,000

Processing:
  New Outstanding = MAX(500,000 - 1,000,000, 0) = 0
  Remaining Months = 0
  Loan Status: CLOSED

Result: Loan closes immediately with excess amount ignored
```

---

## 4. Financial Calculations

### EMI Calculation Formula

Used during loan creation:

```
EMI = [P × r × (1+r)^n] / [(1+r)^n - 1]

Where:
  P = Principal (loan amount)
  r = Monthly interest rate = Annual Rate / (12 × 100)
  n = Tenure in months

Example:
  P = 2,000,000
  Annual Rate = 7.5% → r = 0.75/100 = 0.00625
  n = 240 months

  Factor = (1.00625)^240 = 4.453
  EMI = [2,000,000 × 0.00625 × 4.453] / [4.453 - 1]
      = 55,662.5 / 3.453
      = 14,094.84 (rounded to 2 decimals)
```

### Interest Calculation (Per Payment)

For each EMI payment:

```
Monthly Interest Rate = Annual Rate / (12 × 100)
Interest Due = Outstanding Principal × Monthly Interest Rate
Interest Paid = MIN(Payment Amount, Interest Due)
Principal Paid = Payment Amount - Interest Paid

Example:
  Outstanding: 1,850,000
  Annual Rate: 7.5%
  Monthly Rate: 0.00625
  Interest Due: 1,850,000 × 0.00625 = 11,562.50

  Payment: 14,094.84
  Interest Paid: MIN(14,094.84, 11,562.50) = 11,562.50
  Principal Paid: 14,094.84 - 11,562.50 = 2,532.34
  New Outstanding: 1,850,000 - 2,532.34 = 1,847,467.66
```

### Remaining Months Calculation

For remaining term after prepayment:

```
IF Outstanding ≤ 0:
  Remaining Months = 0
ELSE IF Annual Rate = 0:
  Remaining Months = CEIL(Outstanding / EMI)
ELSE:
  r = Annual Rate / (12 × 100)
  Ratio = (Outstanding × r) / EMI
  IF Ratio ≥ 1:
    Throw Exception "EMI too low"
  ELSE:
    Remaining Months = CEIL(-LN(1 - Ratio) / LN(1 + r))
```

### Rounding

All monetary calculations rounded to 2 decimal places using HALF_UP:
```
14094.8372 → 14094.84
14094.8342 → 14094.83
```

---

## 5. Data Integrity

### Transaction Handling

Payment operations are `@Transactional` to ensure:

```
1. Loan entity updated
2. Payment entity created
3. BOTH succeed or BOTH fail
4. No orphaned records
```

**Implementation:**
```java
@Transactional
public PaymentEntity addEmiPayment(String loanId, PaymentRequestDTO request) {
    // All operations atomic
    // If exception: entire transaction rolled back
}
```

### Concurrent Payment Prevention

**Current Implementation:** No explicit locking
**Recommendation:** Add optimistic locking for production:

```java
@Version
private Long version;  // Add to LoanEntity
```

### Field Validation

| Field | Rule | Enforce |
|-------|------|---------|
| `emiPayDay` | 1-28 | In service |
| `paymentDate` | Must = nextPaymentDate | In service |
| `amount` | > 0 | In service |
| `salary` | ≥ 0 | In service |
| `monthlyExpense` | ≥ 0 | In service |

### Audit Trail

All entities have:
```java
@CreationTimestamp - Set at creation, immutable
@UpdateTimestamp - Updated on every change
```

---

## 6. Performance Considerations

### Query Optimization

**Current Implementation:**
- `findAllByUser(UserEntity)` - N+1 risk on dashboard

**Optimization:**
```java
@Query("SELECT l FROM LoanEntity l FETCH JOIN l.user WHERE l.user = :user")
List<LoanEntity> findAllByUser(@Param("user") UserEntity user);
```

### Index Recommendations

```sql
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_loans_user_id ON loans(user_id);
CREATE INDEX idx_loans_status ON loans(loan_status);
CREATE INDEX idx_payments_loan_id ON Payment_tbl(loan_id);
CREATE INDEX idx_payments_date ON Payment_tbl(payment_date);
```

### Caching Opportunities

**Short-term Cache (5 minutes):**
- Dashboard summary
- User profile
- Loan details

**Implementation:**
```java
@Cacheable(value = "loanDetails", key = "#loanId")
public LoanDetailsResponseDTO getLoanDetails(String loanId) { ... }
```

---

## 7. Advanced Scenarios

### Scenario A: Early Loan Closure

```
Situation:
  - User wants to close loan 5 years early
  - Outstanding: 900,000
  - Prepayment: 900,000
  - Mode: TENURE_REDUCTION

Steps:
  1. Simulate: POST /simulate-prepayment?extraAmount=900000
     → Shows interest saved, recommendation

  2. User approves and executes:
     POST /prepayment with amount: 900,000, mode: TENURE_REDUCTION

  3. System updates:
     - remainingPrincipal = 0
     - loanStatus = CLOSED
     - remainingEmiMonth = 0
     - emi = 0

  4. Dashboard shows loan as CLOSED
```

### Scenario B: Switching Prepayment Strategy Mid-Stream

```
Loan Status:
  - Tenure Remaining: 60 months
  - Outstanding: 500,000 (after 180 payments made)

Strategy Change:
  Payment 1-180: TENURE_REDUCTION (reduced year to year)
  Payment 181-240: TENURE_REDUCTION (can't switch mid-payment)

⚠️ Note: Each prepayment is independent
       Future prepayments can use different mode
```

### Scenario C: Multi-Loan Portfolio Optimization

```
User Has:
  1. Home Loan: 1,800,000 outstanding @ 7.5% (150 months left)
  2. Car Loan: 200,000 outstanding @ 8.5% (40 months left)
  3. Personal Loan: 100,000 outstanding @ 10% (20 months left)

Strategy:
  1. Simulate each loan's prepayment independently
  2. Use recommendations to prioritize:
     - High interest (personal) vs. Large outstanding (home)
     - Check disposable income (applies to all)

  3. If disposable income > 30%:
     Option 1: Prepay Personal Loan → Closes early, least interest
     Option 2: Prepay Home Loan → Saves most total interest

     Recommendation: TENURE_REDUCTION (focus on interest savings)
```

### Scenario D: Salary Reduction Impact

```
Before:
  Salary: 500,000
  Monthly Expense: 50,000
  Total EMI: 100,000
  Disposable: 350,000 (70%)
  Recommendation: TENURE_REDUCTION

After Job Loss:
  Salary: 0 (or significantly reduced)
  Disposable: Negative
  Recommendation: EMI_REDUCTION

  Action: Prepay to reduce monthly obligations
```

### Scenario E: Interest Rate Refinancing (Not Implemented)

```
Current Limitation:
  - Cannot change interest_rate mid-loan
  - Cannot refinance existing loan

Future Enhancement:
  - Allow loan rate change
  - Create new loan with better rate
  - Settle old loan with new loan proceeds
  - Track refinancing history
```

### Scenario F: Partial Payment Handling

```
Current Behavior:
  - Must pay exact EMI amount
  - Partial payments REJECTED

Error Response:
  "EMI amount must match loan EMI: 14094.84"

Future Enhancement:
  - Allow overpayment
  - Calculate unapplied amount
  - Apply to next month or principal reduction
```

---

## Complex Query Examples

### Get Dashboard with Loan Breakdown
```sql
SELECT
    u.user_id,
    SUM(l.remaining_principal) as total_outstanding,
    SUM(l.emi) as total_monthly_emi,
    COUNT(CASE WHEN l.loan_status = 'ACTIVE' THEN 1 END) as active_loans,
    MAX(l.next_payment_date) as next_due_date
FROM loans l
JOIN users u ON l.user_id = u.id
WHERE u.user_id = ?
GROUP BY u.user_id;
```

### Get Payment History for Loan
```sql
SELECT
    p.payment_id,
    p.amount,
    p.principal_paid,
    p.interest_paid,
    p.payment_date,
    p.type
FROM Payment_tbl p
WHERE p.loan_id = (
    SELECT id FROM loans WHERE loan_id = ?
)
ORDER BY p.payment_date ASC;
```

---

## Best Practices for API Consumers

1. **Always Check Recommendations**
   - Simulate before actual prepayment
   - Consider user's financial situation
   - Explain recommendation to user

2. **Handle Payment Date Strictly**
   - Set reminder for nextPaymentDate
   - Payment must be on exact date
   - Communicate schedule clearly

3. **Monitor Disposable Income**
   - Update salary/expense regularly
   - Track recommendation changes
   - Alert user if goes negative

4. **Use Transaction Boundaries**
   - Prepayment = atomic operation
   - Simulate = read-only, safe to repeat

5. **Validate Input Thoroughly**
   - emiPayDay 1-28
   - Amount > 0
   - Dates in correct format

---

**Version:** 2.0
**Last Updated:** March 1, 2026
**Status:** Advanced Reference Document
