const dns = require('dns').promises;
const { promisify } = require('util');

// Parse multipart form data
async function parseFormData(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        req.on('data', chunk => chunks.push(chunk));
        req.on('end', () => {
            try {
                const buffer = Buffer.concat(chunks);
                const boundary = req.headers['content-type'].split('boundary=')[1];
                const parts = buffer.toString().split(`--${boundary}`);

                for (const part of parts) {
                    if (part.includes('filename=')) {
                        const content = part.split('\r\n\r\n')[1];
                        if (content) {
                            resolve(content.split('\r\n--')[0]);
                            return;
                        }
                    }
                }
                reject(new Error('No file found'));
            } catch (error) {
                reject(error);
            }
        });
        req.on('error', reject);
    });
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Check MX records for a domain
async function checkMXRecords(domain) {
    try {
        const records = await dns.resolveMx(domain);
        return records && records.length > 0;
    } catch (error) {
        // Domain doesn't have MX records or DNS lookup failed
        return false;
    }
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
    const skipped = lines.length - total;

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
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }

    try {
        // Parse the uploaded CSV file
        const csvContent = await parseFormData(req);

        if (!csvContent) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }

        // Extract emails from CSV
        const emails = await processCSV(csvContent);

        if (emails.length === 0) {
            res.status(400).json({ error: 'No valid email addresses found in file' });
            return;
        }

        if (emails.length > 300) {
            res.status(400).json({ error: 'File exceeds 300 email limit' });
            return;
        }

        // Validate emails
        const result = await validateEmails(emails);

        res.status(200).json(result);

    } catch (error) {
        console.error('Validation error:', error);
        res.status(500).json({ error: 'Error processing file. Please try again.' });
    }
};
