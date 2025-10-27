# CSV Email Domain Validator - Project Brief

## Overview
A simple web application that validates email addresses from CSV files by checking MX records and returns a single percentage score of valid domains.

---

## Product Specification

### Core Functionality
- Upload CSV file containing email addresses
- Validate up to 1,000 emails per upload
- Check MX records for each email domain
- Display single percentage score of valid emails

### User Flow
1. User visits page
2. User uploads CSV file (drag & drop or file picker)
3. System shows "Validating..." loading state
4. System displays result: "84.7% valid" with count "847 valid out of 1,000 emails"

---

## Technical Specifications

### File Requirements
- **Format:** CSV only (.csv extension)
- **Structure:** Single column, no headers
- **Content:** One email address per row
- **Limit:** Maximum 1,000 emails
- **Invalid rows:** Skip and don't count (e.g., blank lines, non-email text)

### Validation Logic
- **Check:** MX records only
- **Personal emails:** Include in validation (gmail, yahoo count as valid if MX exists)
- **Scoring:** `(valid emails / total valid email rows) × 100`

### Rate Limiting
- **Restriction:** 1 upload per IP address per minute
- **Implementation:** Track IP + timestamp on server
- **Error message:** "Please wait before uploading another file"

### Error Handling
- **0 valid emails:** Show "0%"
- **File too large:** "File exceeds 1,000 email limit"
- **Invalid format:** "Please upload a valid CSV file"
- **No emails found:** "No valid email addresses found in file"
- **Invalid rows:** Skip silently, don't count toward total

---

## Architecture

### Frontend
**File:** `csv-validator.html`

**Components:**
- File upload area (drag & drop + file picker)
- Loading spinner with "Validating..." text
- Results display:
  - Large percentage score
  - Email count breakdown
- Error message display

**Technology:**
- HTML5
- Tailwind CSS (blue brand color: `#0078d4`)
- Vanilla JavaScript (fetch API)

### Backend
**File:** `vercel-email-validator/api/validate-csv.js`

**Responsibilities:**
- Parse uploaded CSV file
- Extract email addresses
- Validate max 1,000 emails
- Check MX records for each domain
- Track IP addresses for rate limiting
- Return validation results

**API Endpoint:**
```
POST /api/validate-csv
```

**Request:**
```
Content-Type: multipart/form-data
Body: CSV file
```

**Response:**
```json
{
  "total": 1000,
  "valid": 847,
  "invalid": 153,
  "percentage": 84.7,
  "skipped": 5
}
```

**Error Response:**
```json
{
  "error": "Rate limit exceeded",
  "message": "Please wait before uploading another file"
}
```

### Rate Limiting Implementation
- Store IP + timestamp in memory (ephemeral)
- Check: `if (lastUpload[ip] > Date.now() - 60000) → reject`
- Clean up old entries periodically

---

## Validation Rules

### What is Valid?
✅ Email has correct format (`user@domain.com`)  
✅ Domain has MX records  

### What is Invalid?
❌ Incorrect email format  
❌ Domain has no MX records  
❌ Domain doesn't exist  

### What is Skipped?
⏭️ Empty/blank rows  
⏭️ Non-email text  
⏭️ Duplicate emails (optional: count first occurrence only)  

---

## UI/UX Design

### Visual Style
- Match existing form template style
- Tailwind CSS framework
- Brand color: `#0078d4` (blue)
- Clean, minimal interface
- Responsive design

### Layout
```
┌─────────────────────────────────┐
│   CSV Email Domain Validator    │
├─────────────────────────────────┤
│                                 │
│    [Drag & Drop CSV Here]       │
│    or click to browse           │
│                                 │
├─────────────────────────────────┤
│                                 │
│          Loading...             │
│      [Progress Spinner]         │
│                                 │
├─────────────────────────────────┤
│                                 │
│           84.7%                 │
│        Valid Emails             │
│                                 │
│   847 valid out of 1,000        │
│                                 │
└─────────────────────────────────┘
```

### States
1. **Initial:** Upload area visible
2. **Loading:** Spinner with "Validating..." message
3. **Results:** Large percentage + breakdown
4. **Error:** Red error message with retry option

---

## Constraints & Limitations

### Performance
- Max 1,000 emails per upload
- Processing time: ~30-60 seconds
- Synchronous processing (no background jobs)

### Rate Limiting
- 1 upload per IP per minute
- No authentication required
- Ephemeral rate limit storage

### Reliability
- MX validation only (not SMTP verification)
- Doesn't verify mailbox exists
- Doesn't check disposable email domains
- Fail-open on API errors (network issues don't fail validation)

---

## Development Time Estimate

**Total: 1.5 - 2 hours**

- Backend API: 30-45 minutes
- Frontend UI: 45-60 minutes
- Testing & polish: 15-30 minutes

---

## File Structure

```
project-root/
├── csv-validator.html
└── vercel-email-validator/
    └── api/
        └── validate-csv.js
```

---

## Example CSV Input

```
john@company.com
jane@business.org
test@fakeco12345.com

invalid-email
sarah@validomain.net
```

**Result:**
- Total: 3 valid rows
- Valid: 2 (john@company.com, sarah@validomain.net)
- Invalid: 1 (test@fakeco12345.com)
- Skipped: 2 (blank line, invalid-email)
- **Score: 66.7%**

---

## Future Enhancements (Out of Scope for MVP)

- Download results CSV with valid/invalid flags
- Check for disposable email domains
- SMTP verification
- Bulk processing (>1,000 emails)
- User accounts with history
- API key authentication
- Async processing with job queue

---

## Success Criteria

✅ User can upload CSV with up to 1,000 emails  
✅ System validates MX records for each domain  
✅ System displays single percentage score  
✅ Rate limiting prevents abuse  
✅ Page matches existing design style  
✅ Processing completes in under 60 seconds  
✅ Invalid rows are skipped gracefully  
