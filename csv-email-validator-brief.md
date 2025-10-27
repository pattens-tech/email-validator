# CSV Email Domain Validator - Project Brief

## Overview
A simple web application that validates email addresses from CSV files by checking MX records and returns a single percentage score of valid domains.

---

## Product Specification

### Core Functionality
- Upload CSV file containing email addresses
- Validate up to 300 emails per upload
- Check MX records for each email domain
- Display single percentage score of valid emails

### User Flow
1. User visits page
2. User uploads CSV file (drag & drop or file picker)
3. System shows "Validating..." loading state
4. System displays result: "84.7% valid emails"

---

## Technical Specifications

### File Requirements
- **Format:** CSV only (.csv extension)
- **Structure:** Single column, no headers
- **Content:** One email address per row
- **Limit:** Maximum 300 emails
- **Invalid rows:** Skip and don't count (e.g., blank lines, non-email text)

### Validation Logic
- **Check:** MX records only
- **Scoring:** `(valid emails / total valid email rows) × 100`



### Error Handling
- **0 valid emails:** Show "0%"
- **File too large:** "File exceeds 300 email limit"
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
- Validate max 300 emails
- Check MX records for each domain

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




---

## Validation Rules

### What is Valid?
✅ Domain has MX records  

### What is Invalid?
❌ Domain has no MX records  

### What is Skipped?
⏭️ Empty/blank rows  
⏭️ Non-email text  
⏭️ Duplicate emails (optional: count first occurrence only)  

---

## UI/UX Design

### Visual Style
- Match existing form template style
- Tailwind CSS framework
- Clean, minimal interface
- Responsive design

### Layout
```

├─────────────────────────────────┤
│                                 │
│    [Drag & Drop CSV Here]       │
│    or click to browse           │
│                                 │
├─────────────────────────────────┤
│                                 │
│          │
│                                 │
├─────────────────────────────────┤
│                                 │
│           84.7%                 │
│        Valid Emails             │
│                                 │
│         │
│                                 │
└─────────────────────────────────┘
```

### States
1. **Initial:** Upload area visible
3. **Results:** Large percentage

---

## Constraints & Limitations

### Performance
- Max 300 emails per upload
- Processing time: ~30-60 seconds
- Synchronous processing (no background jobs)

### Rate Limiting
- No authentication required

### Reliability
- MX validation only (not SMTP verification)
- Doesn't verify mailbox exists
- Doesn't check disposable email domains
- Fail-open on API errors (network issues don't fail validation)



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

```

**Result:**
- Total: 3 valid rows
- Valid: 2 (john@company.com, sarah@validomain.net)
- Invalid: 1 (test@fakeco12345.com)
- Skipped: 2 (blank line, invalid-email)
- **Score: 66.7%**

---


---

## Success Criteria

✅ User can upload CSV with up to 300 emails  
✅ System validates MX records for each domain  
✅ System displays single percentage score  
✅ Processing completes in under 60 seconds  
✅ Invalid rows are skipped gracefully  
