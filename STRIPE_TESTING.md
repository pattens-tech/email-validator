# Stripe Testing Guide

This guide explains how to test Stripe payment integration in this project using Stripe's test mode and test cards.

## Overview

This project integrates with Stripe for payment processing. To ensure reliable payment flows without handling real money, we use Stripe's test mode with designated test card numbers.

**Official Documentation**: https://docs.stripe.com/testing

## Test Mode vs Live Mode

- **Test Mode**: Uses test API keys (`sk_test_...`) and accepts only test card numbers. No real money is processed.
- **Live Mode**: Uses live API keys (`sk_live_...`) and processes real payments. Only use in production.

⚠️ **Important**: Never use real card numbers in test mode, and never use test cards in live mode.

## Running Tests

### Unit Tests (Mocked)

The existing tests mock Stripe API calls and don't require actual Stripe API access:

```bash
npm test
```

### Integration Tests with Stripe Test Mode

To run integration tests against actual Stripe test mode API (optional):

1. Set your Stripe test API key:
   ```bash
   export STRIPE_TEST_API_KEY=sk_test_your_key_here
   ```

2. Run the tests:
   ```bash
   npm test
   ```

## Test Card Numbers

Use these test card numbers in Stripe's test mode to simulate different payment scenarios:

### Successful Payments

| Card Type | Number | Use Case |
|-----------|--------|----------|
| Visa | `4242 4242 4242 4242` | Always succeeds |
| Visa (debit) | `4000 0566 5566 5556` | Debit card success |
| Mastercard | `5555 5555 5555 4444` | Always succeeds |
| Mastercard (debit) | `5200 8282 8282 8210` | Debit card success |
| Mastercard (prepaid) | `5105 1051 0510 5100` | Prepaid card success |
| American Express | `3782 822463 10005` | Always succeeds |
| Discover | `6011 1111 1111 1117` | Always succeeds |
| Diners Club | `3056 9309 0259 04` | Always succeeds |
| JCB | `3566 0020 2036 0505` | Always succeeds |

### Payment Failures

| Card Number | Error Type | Description |
|-------------|------------|-------------|
| `4000 0000 0000 0002` | Generic decline | Card declined for generic reason |
| `4000 0000 0000 9995` | Insufficient funds | Card has insufficient funds |
| `4000 0000 0000 9987` | Lost card | Card reported as lost |
| `4000 0000 0000 9979` | Stolen card | Card reported as stolen |
| `4000 0000 0000 0069` | Expired card | Card has expired |
| `4000 0000 0000 0127` | Incorrect CVC | CVC check fails |
| `4000 0000 0000 0119` | Processing error | Generic processing error |

### Authentication Required (3D Secure)

| Card Number | Behavior |
|-------------|----------|
| `4000 0025 0000 3155` | Requires authentication |
| `4000 0027 6000 3184` | Authentication succeeds |

## Using Test Cards

When testing payments manually or programmatically:

1. **Card Number**: Use one of the test card numbers above
2. **Expiration Date**: Use any future date (e.g., `12/34`)
3. **CVC**: Use any 3 digits (or 4 for Amex)
4. **ZIP/Postal Code**: Use any valid format

Example:
```
Card: 4242 4242 4242 4242
Exp: 12/34
CVC: 123
ZIP: 12345
```

## Test Helpers

The project includes test helpers to make Stripe testing easier:

### Importing Test Helpers

```javascript
const {
  STRIPE_TEST_CARDS,
  STRIPE_TEST_PAYMENT_METHODS,
  createTestCard,
  createTestBillingDetails,
  createTestEmailData,
} = require('./__tests__/helpers/stripe-test-helpers');
```

### Using Test Card Constants

```javascript
// Get a successful Visa test card number
const visaCard = STRIPE_TEST_CARDS.VISA_SUCCESS; // '4242424242424242'

// Get a card that will be declined
const declinedCard = STRIPE_TEST_CARDS.GENERIC_DECLINE; // '4000000000000002'
```

### Creating Test Card Objects

```javascript
// Create a test card with default values
const card = createTestCard(STRIPE_TEST_CARDS.VISA_SUCCESS);
// Returns: { number: '4242424242424242', exp_month: '12', exp_year: '2034', cvc: '123' }

// Create a test card with custom values
const customCard = createTestCard(
  STRIPE_TEST_CARDS.MASTERCARD_SUCCESS,
  '06', // month
  '2030', // year
  '456'  // cvc
);
```

### Creating Test Billing Details

```javascript
const billing = createTestBillingDetails('customer@example.com', 'John Doe');
// Returns billing details with address for UK (GB)
```

### Creating Test Email Data

```javascript
const emails = createTestEmailData(10); // Creates 10 test email entries
```

## Payment Flow Testing

### 1. Successful Payment Flow

```javascript
test('should process successful payment', async () => {
  const emails = createTestEmailData(5);
  
  // Create checkout session
  const response = await createCheckoutSession(emails);
  
  expect(response.sessionId).toBeDefined();
  expect(response.url).toContain('checkout.stripe.com');
  
  // In manual testing, use card: 4242 4242 4242 4242
});
```

### 2. Declined Payment Flow

```javascript
test('should handle declined payment', async () => {
  // Use GENERIC_DECLINE card: 4000 0000 0000 0002
  // Payment will be declined with appropriate error message
});
```

### 3. Insufficient Funds Flow

```javascript
test('should handle insufficient funds', async () => {
  // Use INSUFFICIENT_FUNDS card: 4000 0000 0000 9995
  // Payment will be declined with insufficient funds error
});
```

## Manual Testing Checklist

When testing the Stripe integration manually:

- [ ] Navigate to the application
- [ ] Upload a CSV file with test emails
- [ ] Click "Unlock Full Report" or payment button
- [ ] Verify Stripe checkout page loads
- [ ] Use test card `4242 4242 4242 4242`
- [ ] Enter expiration date in the future (e.g., `12/34`)
- [ ] Enter any CVC (e.g., `123`)
- [ ] Enter any billing details
- [ ] Complete payment
- [ ] Verify redirect to success page
- [ ] Check Stripe dashboard for test mode payment

## Simulating Different Scenarios

### Test Successful Payment
- Card: `4242 4242 4242 4242`
- Expected: Payment succeeds, user redirected to success page

### Test Declined Payment
- Card: `4000 0000 0000 0002`
- Expected: Payment declined, error message shown

### Test Insufficient Funds
- Card: `4000 0000 0000 9995`
- Expected: Insufficient funds error shown

### Test Expired Card
- Card: `4000 0000 0000 0069`
- Expected: Expired card error shown

### Test Wrong CVC
- Card: `4000 0000 0000 0127`
- Expected: CVC check fails, error shown

## Best Practices

1. **Always Use Test Mode**: Never test with live API keys or real cards
2. **Test All Scenarios**: Test both success and failure cases
3. **Verify Error Handling**: Ensure proper error messages are shown to users
4. **Check Metadata**: Verify email data is correctly stored in session metadata
5. **Monitor Test Dashboard**: Use Stripe Dashboard in test mode to verify transactions
6. **Clean Up**: Test mode transactions don't need cleanup but can be deleted from dashboard
7. **Document Changes**: Update tests when payment flow changes

## Stripe Dashboard

View test transactions in the Stripe Dashboard:
1. Login to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Toggle to **Test Mode** (switch in top right)
3. Navigate to **Payments** → **Checkout sessions**
4. View test transactions and their details

## Environment Variables

Required environment variables:

```bash
# For production (live mode)
STRIPE_SECRET_KEY=sk_live_...

# For testing (test mode) - optional, used for integration tests
STRIPE_TEST_API_KEY=sk_test_...
```

⚠️ **Security Note**: Never commit API keys to version control. Use environment variables or secret management.

## Troubleshooting

### Issue: "Invalid API Key"
- **Solution**: Ensure you're using a test API key (`sk_test_...`) in test mode

### Issue: "Card declined"
- **Solution**: This is expected behavior for certain test cards. See the payment failures table above

### Issue: "Invalid card number"
- **Solution**: Ensure you're using a valid test card number from the list above

### Issue: Tests failing with "Network error"
- **Solution**: Check that Stripe API is accessible. The mocked tests should still pass.

## Additional Resources

- [Stripe Testing Documentation](https://docs.stripe.com/testing)
- [Stripe Test Cards](https://docs.stripe.com/testing#cards)
- [Stripe Checkout Documentation](https://docs.stripe.com/payments/checkout)
- [Stripe API Reference](https://docs.stripe.com/api)
- [Stripe Node.js Library](https://github.com/stripe/stripe-node)

## Support

For issues related to:
- **Stripe Integration**: Check Stripe documentation or contact Stripe support
- **Test Implementation**: Review test files in `__tests__/` directory
- **Application Issues**: Open an issue in the project repository
