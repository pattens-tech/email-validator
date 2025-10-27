# email-validator

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

Result:
	•	Total: 3 valid rows
	•	Valid: 2 (john@company.com, sarah@validomain.net)
	•	Invalid: 1 (test@fakeco12345.com)
	•	Skipped: 2 (blank line, invalid-email)
	•	Score: 66.7%
