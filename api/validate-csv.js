const dns = require('dns').promises;
const busboy = require('busboy');

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const DNS_TIMEOUT_MS = 5000; // 5 seconds

// Parse multipart form data
async function parseFormData(req) {
    return new Promise((resolve, reject) => {
        const bb = busboy({ headers: req.headers });
        const FILE_TOO_LARGE_ERROR = 'File too large. Maximum size is 5MB';
        let csvContent = '';
        let fileReceived = false;
        let fileSize = 0;
        let fileSizeExceeded = false;

        bb.on('file', (fieldname, file, info) => {
            const { filename, encoding, mimeType } = info;

            // Check if it's a CSV file
            if (!filename.endsWith('.csv')) {
                file.resume(); // drain the file stream
                reject(new Error('Please upload a valid CSV file'));
                return;
            }

            fileReceived = true;

            file.on('data', (data) => {
                if (fileSizeExceeded) {
                    return; // Already rejected, ignore further data
                }
                
                fileSize += data.length;
                
                if (fileSize > MAX_FILE_SIZE) {
                    fileSizeExceeded = true;
                    file.resume(); // drain the file stream
                    reject(new Error(FILE_TOO_LARGE_ERROR));
                    return;
                }
                
                csvContent += data.toString('utf8');
            });

            file.on('end', () => {
                // File processing complete
            });
        });

        bb.on('finish', () => {
            if (!fileReceived || !csvContent) {
                reject(new Error('No file uploaded'));
                return;
            }
            resolve(csvContent);
        });

        bb.on('error', (error) => {
            reject(error);
        });

        req.pipe(bb);
    });
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Check MX records for a domain with timeout protection
async function checkMXRecords(domain) {
    // Create timeout promise that resolves to false
    const timeoutPromise = new Promise((resolve) => {
        setTimeout(() => resolve(false), DNS_TIMEOUT_MS);
    });
    
    // Create DNS lookup promise
    const dnsPromise = dns.resolveMx(domain)
        .then(records => records && records.length > 0)
        .catch(() => false); // DNS errors return false
    
    // Race DNS lookup against timeout
    return Promise.race([dnsPromise, timeoutPromise]);
}

// Extract domain from email
function getDomain(email) {
    return email.split('@')[1];
}

// Process CSV and validate emails
async function processCSV(csvContent) {
    const lines = csvContent.split(/\r?\n/);
    const emails = [];
    const seenEmails = new Set();

    // Parse CSV and extract unique valid email addresses
    for (const line of lines) {
        const trimmed = line.trim();

        // Skip empty lines
        if (!trimmed) {
            continue;
        }

        // Check if it's a valid email format
        if (isValidEmail(trimmed)) {
            // Skip duplicates
            if (!seenEmails.has(trimmed.toLowerCase())) {
                emails.push(trimmed.toLowerCase());
                seenEmails.add(trimmed.toLowerCase());
            }
        }
    }

    return emails;
}

// Main validation function
async function validateEmails(emails) {
    const maxEmails = 300;
    const emailsToValidate = emails.slice(0, maxEmails);

    // Group emails by domain for efficient validation
    const domainMap = new Map();
    for (const email of emailsToValidate) {
        const domain = getDomain(email);
        if (!domainMap.has(domain)) {
            domainMap.set(domain, []);
        }
        domainMap.get(domain).push(email);
    }

    // Validate MX records for each unique domain
    const domainValidation = new Map();
    const validationPromises = Array.from(domainMap.keys()).map(async (domain) => {
        const hasValidMX = await checkMXRecords(domain);
        domainValidation.set(domain, hasValidMX);
    });

    await Promise.all(validationPromises);

    // Count valid and invalid emails
    let validCount = 0;
    let invalidCount = 0;

    for (const email of emailsToValidate) {
        const domain = getDomain(email);
        if (domainValidation.get(domain)) {
            validCount++;
        } else {
            invalidCount++;
        }
    }

    const total = emailsToValidate.length;
    const percentage = total > 0 ? (validCount / total) * 100 : 0;

    return {
        total,
        valid: validCount,
        invalid: invalidCount,
        percentage,
        skipped: emails.length - emailsToValidate.length
    };
}

// Vercel serverless function handler
module.exports = async (req, res) => {
    // Set headers for all responses
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Parse the uploaded CSV file
        const csvContent = await parseFormData(req);

        if (!csvContent) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Extract emails from CSV
        const emails = await processCSV(csvContent);

        if (emails.length === 0) {
            return res.status(400).json({ error: 'No valid email addresses found in file' });
        }

        if (emails.length > 300) {
            return res.status(400).json({ error: 'File exceeds 300 email limit' });
        }

        // Validate emails
        const result = await validateEmails(emails);

        return res.status(200).json(result);

    } catch (error) {
        console.error('Validation error:', error);
        
        // Return 413 status for file size errors
        const FILE_TOO_LARGE_ERROR = 'File too large. Maximum size is 5MB';
        if (error.message === FILE_TOO_LARGE_ERROR) {
            return res.status(413).json({ error: error.message });
        }
        
        return res.status(500).json({ error: error.message || 'Error processing file. Please try again.' });
    }
};
