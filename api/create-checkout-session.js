const Stripe = require('stripe');

// Initialize Stripe with environment variable or fallback to test key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_51SNjUMCmTraQU9pzvX0oCkdah2Zn5ImLpcPhTRk5lRrZ0PRXDTPJnbZrloayGPwvI1AGjpmKhlopWe3cCANfe6M400zw0I5yH7');

// Set security headers
function setSecurityHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
}

// Validate and sanitize email data
function validateEmailData(emails) {
    if (!Array.isArray(emails) || emails.length === 0) {
        return null;
    }

    // Filter valid email objects
    const validEmails = emails.filter(item => {
        return (
            item &&
            typeof item === 'object' &&
            typeof item.email === 'string' &&
            item.email.trim() !== '' &&
            typeof item.status === 'string' &&
            (item.status === 'Valid' || item.status === 'Invalid')
        );
    });

    return validEmails.length > 0 ? validEmails : null;
}

module.exports = async (req, res) => {
    // Set security headers for all responses
    setSecurityHeaders(res);

    // Handle OPTIONS request (CORS preflight)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { emails } = req.body;

        // Validate email data
        if (!emails || !Array.isArray(emails) || emails.length === 0) {
            return res.status(400).json({ error: 'Invalid email data' });
        }

        const validatedEmails = validateEmailData(emails);
        
        if (!validatedEmails) {
            return res.status(400).json({ error: 'No valid email data provided' });
        }

        // Get origin from request headers
        const origin = req.headers.origin || 'https://email-validator.pattens.tech';

        // Create Stripe checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            line_items: [
                {
                    price_data: {
                        currency: 'gbp',
                        product_data: {
                            name: 'Email Validation Report',
                            description: `Full validation report for ${validatedEmails.length} email${validatedEmails.length > 1 ? 's' : ''}`,
                        },
                        unit_amount: 999, // £9.99 in pence
                    },
                    quantity: 1,
                },
            ],
            success_url: `${origin}/?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/`,
            metadata: {
                emailCount: validatedEmails.length.toString(),
                validEmails: validatedEmails.filter(e => e.status === 'Valid').length.toString(),
                invalidEmails: validatedEmails.filter(e => e.status === 'Invalid').length.toString(),
            },
        });

        return res.status(200).json({
            sessionId: session.id,
            url: session.url,
        });

    } catch (error) {
        console.error('Stripe error:', error);
        return res.status(500).json({ 
            error: error.message || 'Failed to create checkout session'
        });
    }
};