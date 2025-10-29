# Security Implementation Plan

## Overview
Implementing comprehensive security improvements to protect against file size attacks, DNS timeouts, injection attacks, DoS, and security vulnerabilities.

---

## Stage 1: File Size Protection
**Goal**: Add file size limits to prevent memory exhaustion attacks
**Success Criteria**: 
- Files over 5MB are rejected before processing
- Memory usage stays bounded during upload
- Clear error message for oversized files (413 status)
**Tests**:
- Upload 1MB file (should succeed)
- Upload 6MB file (should fail with 413 status)
- Verify memory doesn't accumulate during rejection
**Status**: Complete
**Files Changed**: `api/validate-csv.js` (parseFormData function)
**Estimated Complexity**: Low

---

## Stage 2: DNS Timeout Protection
**Goal**: Add timeouts to DNS lookups to prevent hanging requests
**Success Criteria**:
- DNS queries timeout after 5 seconds
- Timeout treated as validation failure, not error
- Multiple concurrent timeouts don't block other requests
**Tests**:
- Mock DNS server that never responds
- Verify 5-second timeout triggers
- Test 100+ concurrent validations with timeouts
**Status**: Not Started
**Files Changed**: `api/validate-csv.js` (checkMXRecords function)
**Estimated Complexity**: Medium
**Dependencies**: None

---

## Stage 3: Input Sanitization
**Goal**: Sanitize email inputs to prevent injection and handle edge cases
**Success Criteria**:
- Email addresses are sanitized before processing
- Malformed emails handled gracefully
- Domain extraction validates @ symbol exists
**Tests**:
- Test emails with special chars: <, >, ", ', ;, \n, \r
- Test missing @ symbol
- Test multiple @ symbols
- Test empty domain after @
**Status**: Not Started
**Files Changed**: `api/validate-csv.js` (isValidEmail, getDomain, processCSV)
**Estimated Complexity**: Low

---

## Stage 4: Rate Limiting
**Goal**: Add per-IP rate limiting to prevent abuse
**Success Criteria**:
- Maximum 10 requests per minute per IP
- 429 status returned when limit exceeded
- Rate limit resets after time window
**Tests**:
- Send 10 requests rapidly (should succeed)
- Send 11th request (should get 429)
- Wait 60 seconds, verify reset
**Status**: Not Started
**Files Changed**: `api/validate-csv.js` (new middleware/function)
**Dependencies**: May need in-memory store for tracking
**Estimated Complexity**: Medium

---

## Stage 5: Security Headers
**Goal**: Add comprehensive security headers to all responses
**Success Criteria**:
- CSP header prevents XSS
- X-Frame-Options prevents clickjacking
- X-Content-Type-Options prevents MIME sniffing
- CORS remains functional for legitimate use
**Tests**:
- Verify all headers present in response
- Test CSP doesn't break functionality
- Verify CORS still works
**Status**: Not Started
**Files Changed**: `api/validate-csv.js` (handler function)
**Estimated Complexity**: Low

---

## Implementation Notes

### Key Decisions
- **File Size Limit**: 5MB (can hold ~250,000 emails, well above 300 limit)
- **DNS Timeout**: 5 seconds (typical queries <1s, allows for slow networks)
- **Rate Limit**: 10 requests/minute (generous for legitimate users)
- **Sanitization**: Whitelist approach - only allow safe characters

### Testing Strategy
1. Write failing tests first for each vulnerability
2. Implement minimal fix to pass test
3. Verify existing tests still pass
4. Commit with working code

### Rollback Strategy
Each stage is independent and can be:
- Reverted without affecting others
- Tested in isolation
- Deployed incrementally