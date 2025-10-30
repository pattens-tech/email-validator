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


# Stage 4 Improved status

Update the statuses used to determine to the user if the email address is classed as valid or not using the following list. 

If any Fail status is detected on checking, immediately return an invalid email and stop further checks for that email.
If any Pass status is detected on checking, immediately return an valid email and stop further checks for that email.


**To to Implement / update (Fail status):**
- Success (Pass)
- ServerIsCatchAll (Pass)
- Duplicate (Ignore)
- CatchAllValidationTimeout (Ignore)
- AtSignNotFound
- DnsConnectionFailure
- DnsQueryTimeout
- DomainDoesNotExist
- DomainIsMisconfigured
- DomainHasNullMx
- DomainPartCompliancyFailure
- DoubleDotSequence
- InvalidAddressLength
- InvalidCharacterInSequence
- InvalidLocalPartLength
- UnhandledException

## Email Validation Status Codes

| Code                                       | Simple Name              | Description                                                        | Pass/Fail |
| ------------------------------------------ | ------------------------ | ------------------------------------------------------------------ | --------- |
| AtSignNotFound                             | Missing @                | The email is missing the @ symbol.                                 | Fail      |
| CatchAllValidationTimeout                  | Timeout (Catch-All)      | Verification took too long when checking for fake addresses.       | Ignore    |
| DnsConnectionFailure                       | DNS Error                | Could not connect to DNS to check the domain.                      | Fail      |
| DnsQueryTimeout                            | DNS Timeout              | DNS check took too long.                                           | Fail      |
| DomainDoesNotExist                         | No Domain                | The domain in the email doesn't exist.                             | Fail      |
| DomainIsMisconfigured                      | Broken Domain            | The domain has bad DNS setup and can't receive emails.             | Fail      |
| DomainHasNullMx                            | No Mail Server           | The domain doesn't have any mail servers.                          | Fail      |
| DomainIsWellKnownDea                       | Disposable Domain        | The domain is for disposable or temporary emails. Avoid using.     | Ignore    |
| DomainPartCompliancyFailure                | Bad Domain Format        | The domain part of the email isn't formatted correctly.            | Fail      |
| DoubleDotSequence                          | Double Dot               | The email has two dots in a row, which is invalid.                 | Fail      |
| Duplicate                                  | Duplicate Email          | This email has already been checked earlier in the list.           | Ignore    |
| InvalidAddressLength                       | Wrong Length             | The full email address is too short or too long.                   | Fail      |
| InvalidCharacterInSequence                 | Invalid Character        | The email has a character that's not allowed.                      | Fail      |
| InvalidEmptyQuotedWord                     | Empty Quotes             | The email has empty quotes in it.                                  | Ignore    |
| InvalidFoldingWhiteSpaceSequence           | Bad Whitespace           | The email has an invalid space sequence.                           | Ignore    |
| InvalidLocalPartLength                     | Wrong Local Length       | The part before the @ is too short or too long.                    | Fail      |
| InvalidWordBoundaryStart                   | Bad Word Boundary        | There's a misplaced boundary in the email.                         | Ignore    |
| IspSpecificSyntaxFailure                   | ISP Format Error         | The email doesn't follow the provider's required format.           | Ignore    |
| LocalEndPointRejected                      | Local Reject             | The mail server rejected the local endpoint. Retry later.          | Ignore    |
| LocalSenderAddressRejected                 | Sender Rejected          | The mail server rejected the sender address. Retry later.          | Ignore    |
| MailboxDoesNotExist                        | No Mailbox               | The mailbox doesn't exist.                                         | Ignore    |
| MailboxHasInsufficientStorage              | Mailbox Full             | The mailbox is full or the mail server is out of space.            | Ignore    |
| MailboxIsDea                               | Disposable Mailbox       | The mailbox is from a temporary email service. Avoid using.        | Ignore    |
| MailboxTemporarilyUnavailable              | Mailbox Unavailable      | The mailbox is temporarily unavailable (often due to greylisting). | Ignore    |
| MailboxValidationTimeout                   | Timeout (Mailbox)        | It took too long to verify the mailbox.                            | Ignore    |
| MailExchangerIsHoneypot                    | Honeypot                 | The email is a trap used to catch spammers. Avoid using.           | Ignore    |
| MailExchangerIsParked                      | Parked Server            | The mail server is inactive or parked.                             | Ignore    |
| MailExchangerIsWellKnownDea                | Disposable Server        | The mail server is for disposable emails.                          | Ignore    |
| OverrideMatch                              | Custom Rule Match        | The email matched a custom rule.                                   | Ignore    |
| ServerDoesNotAllowMultipleRecipients       | Multi-Recipient Block    | The mail server might accept fake emails; can't confirm mailbox.   | Ignore    |
| ServerDoesNotSupportInternationalMailboxes | No International Support | The mail server doesn't support non-English email names.           | Ignore    |
| ServerIsCatchAll                           | Catch-All                | The mail server accepts all emails, even fake ones.                | Pass      |
| ServerTemporaryUnavailable                 | Server Unavailable       | The mail server is temporarily down.                               | Ignore    |
| SmtpConnectionFailure                      | SMTP Error               | Couldn't connect to the mail server.                               | Ignore    |
| SmtpConnectionTimeout                      | SMTP Timeout             | Took too long to connect to the mail server.                       | Ignore    |
| SmtpDialogError                            | SMTP Response Error      | The mail server gave an invalid reply.                             | Ignore    |
| Success                                    | Valid                    | The email is valid and safe to send to.                            | Pass      |
| UnacceptableDomainLiteral                  | Bad Domain Literal       | The domain can't receive external mail.                            | Ignore    |
| UnbalancedCommentParenthesis               | Unbalanced Brackets      | The email has mismatched brackets.                                 | Ignore    |
| UnexpectedQuotedPairSequence               | Bad Quoted Pair          | The email has unexpected special characters in quotes.             | Ignore    |
| UnhandledException                         | Unknown Error            | Something went wrong during checking.                              | Fail      |
| UnmatchedQuotedPair                        | Unmatched Quote          | A quoted character isn't properly closed.                          | Ignore    |





