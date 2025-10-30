# Domain Update & Bug Fix Implementation Plan

## Overview
Fix critical bugs and ensure consistent use of canonical domain: `https://email-validator.pattens.tech`

---

## Stage 1: Fix Stripe URL Pattern Bug
**Goal**: Fix "The string did not match the expected pattern" error on Stripe checkout
**Success Criteria**: 
- Stripe checkout page loads without errors
- User can proceed to payment
**Tests**: 
- Existing tests in `__tests__/api/create-checkout-session.test.js` pass
- Manual test: Upload CSV → Click "Unlock Full Report" → Stripe checkout loads
**Status**: Not Started

### Changes:
- `api/create-checkout-session.js` line 96: Change `${origin}?session_id=` to `${origin}/?session_id=`
- `api/create-checkout-session.js` line 97: Change `${origin}` to `${origin}/`

---

## Stage 2: Fix HTML Syntax Errors
**Goal**: Fix syntax errors in index.html meta tags and JSON-LD
**Success Criteria**:
- HTML validates
- JSON-LD validates with Google Rich Results Test
- No console errors related to meta tags
**Tests**:
- Manual validation with HTML validator
- Manual validation with Google Rich Results Test
- Browser console shows no errors
**Status**: Not Started

### Changes:
- `index.html` line 18: Fix `href="https://email-validator.pattens.tech>` to `href="https://email-validator.pattens.tech">`
- `index.html` line 34: Fix `content="https://email-validator.pattens.techassets/` to `content="https://email-validator.pattens.tech/assets/`
- `index.html` line 196: Fix `"url": "https://email-validator.pattens.tech,` to `"url": "https://email-validator.pattens.tech",`

---

## Stage 3: Verify Domain Consistency
**Goal**: Ensure all domain references use `https://email-validator.pattens.tech`
**Success Criteria**:
- All URLs in codebase point to correct domain
- Tests use correct domain
**Tests**:
- Manual search for any incorrect domain references
- Run all tests
**Status**: Not Started

### Changes:
- Verify all files use correct domain (already correct, just needs verification)

---

## Stage 4: Integration Testing
**Goal**: Verify all fixes work together in production-like environment
**Success Criteria**:
- All unit tests pass
- Manual end-to-end flow works
- No console errors
**Tests**:
- `npm test` passes
- Manual flow: Upload CSV → Validate → Payment → Success
**Status**: Not Started

### Testing Checklist:
- [ ] Run `npm test` - all tests pass
- [ ] Upload valid CSV file
- [ ] See validation results
- [ ] Click "Unlock Full Report"
- [ ] Stripe checkout loads correctly
- [ ] No console errors throughout flow