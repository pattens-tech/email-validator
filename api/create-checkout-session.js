const Stripe = require('stripe');

// Initialize Stripe with secret key from environment variable
const stripe = new Stripe(process.env.sk_test_51SNjUMCmTraQU9pzvX0oCkdah2Zn5ImLpcPhTRk5lRrZ0PRXDTPJnbZrloayGPwvI1AGjpmKhlopWe3cCANfe6M400zw0I5yH7);

// Constants
const PRODUCT_ID = 'prod_TKOJcY2oaB32Ja';
const MAX_METADATA_SIZE = 500 * 1024; // Stripe metadata limit is 500KB per key

// Sanitize email data for metadata storage
function sanitizeEmailData(emails) {
    if (!Array.isArray(emails)) {
        return [];
    }
    
    // Limit to 300 emails and sanitize each entry
    return emails.slice(0, 300).map(item => {
        if (!item || typeof item !== 'object') {
            return null;
        }
        
        const email = String(item.email || '').trim();
        const status = String(item.status || '').trim();
        
        // Basic validation
        if (!email || (status !== 'Valid' && status !== 'Invalid')) {
            return null;
        }
        
        return { email, status };
    }).filter(item => item !== null);
}

// Vercel serverless function handler
module.exports = async (req, res) => {
    // Set headers for all responses
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');
    
    // Security headers (matching validate-csv.js pattern)
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Parse request body
        const { emails } = req.body;

        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return res.status(400).json({ error: 'Invalid email data' });
        }

        // Sanitize email data
        const sanitizedEmails = sanitizeEmailData(emails);
        
        if (sanitizedEmails.length === 0) {
            return res.status(400).json({ error: 'No valid email data provided' });
        }

        // Convert emails to JSON string for metadata
        const emailsJson = JSON.stringify(sanitizedEmails);
        
        // Check metadata size limit
        if (emailsJson.length > MAX_METADATA_SIZE) {
            return res.status(400).json({ error: 'Email data too large for processing' });
        }

         // Get the origin for success/cancel URLs
        const origin = req.headers.origin || req.headers.referer?.replace(/\/$/, '') || 'https://email-validator.pattens.tech';

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'gbp',
                        product: PRODUCT_ID,
                        unit_amount: 999, // £9.99 in pence
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${origin}/?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/`,
            metadata: {
                emails: emailsJson,
                emailCount: sanitizedEmails.length.toString(),
            },
        });

        return res.status(200).json({ 
            sessionId: session.id,
            url: session.url 
        });

    } catch (error) {
        console.error('Checkout session error:', error);
        
        // Handle Stripe-specific errors
        if (error.type === 'StripeCardError') {
            return res.status(400).json({ error: error.message });
        }
        
        return res.status(500).json({ 
            error: error.message || 'Error creating checkout session. Please try again.' 
        });
    }
};
