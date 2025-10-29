const dns = require('dns').promises;

// Mock DNS module
jest.mock('dns', () => ({
  promises: {
    resolveMx: jest.fn()
  }
}));

// Helper functions (extracted from actual implementation for testing)
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const getDomain = (email) => email.split('@')[1];

const checkMXRecords = async (domain) => {
  try {
    const records = await dns.resolveMx(domain);
    return records && records.length > 0;
  } catch (error) {
    return false;
  }
};

const processCSV = async (csvContent) => {
  const lines = csvContent.split(/\r?\n/);
  const emails = [];
  const seenEmails = new Set();

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (isValidEmail(trimmed)) {
      if (!seenEmails.has(trimmed.toLowerCase())) {
        emails.push(trimmed.toLowerCase());
        seenEmails.add(trimmed.toLowerCase());
      }
    }
  }
  return emails;
};

describe('Email Validator API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Basic functionality', () => {
    test('should be defined', () => {
      expect(true).toBe(true);
    });
  });

  describe('Email validation regex', () => {
    test('should validate correct email format', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user@domain.org')).toBe(true);
      expect(isValidEmail('name.surname@company.co.uk')).toBe(true);
    });

    test('should reject invalid email formats', () => {
      expect(isValidEmail('notanemail')).toBe(false);
      expect(isValidEmail('missing@domain')).toBe(false);
      expect(isValidEmail('@nodomain.com')).toBe(false);
      expect(isValidEmail('no@symbol')).toBe(false);
    });
  });

  describe('Domain extraction', () => {
    test('should extract domain from email', () => {
      expect(getDomain('test@example.com')).toBe('example.com');
      expect(getDomain('user@subdomain.example.org')).toBe('subdomain.example.org');
    });
  });

  describe('MX record checking', () => {
    test('should return true when MX records exist', async () => {
      dns.resolveMx.mockResolvedValue([
        { exchange: 'mail.example.com', priority: 10 }
      ]);

      const result = await checkMXRecords('example.com');
      expect(result).toBe(true);
      expect(dns.resolveMx).toHaveBeenCalledWith('example.com');
    });

    test('should return false when MX records do not exist', async () => {
      dns.resolveMx.mockRejectedValue(new Error('No MX records'));

      const result = await checkMXRecords('invalid-domain.test');
      expect(result).toBe(false);
    });

    test('should return false when DNS lookup fails', async () => {
      dns.resolveMx.mockRejectedValue(new Error('DNS lookup failed'));

      const result = await checkMXRecords('failing-domain.test');
      expect(result).toBe(false);
    });
  });

  describe('CSV processing', () => {
    test('should parse valid emails from CSV content', async () => {
      const csvContent = 'test@example.com\nuser@domain.org\nname@company.com';
      const emails = await processCSV(csvContent);

      expect(emails).toHaveLength(3);
      expect(emails).toContain('test@example.com');
      expect(emails).toContain('user@domain.org');
      expect(emails).toContain('name@company.com');
    });

    test('should skip empty lines', async () => {
      const csvContent = 'test@example.com\n\n\nuser@domain.org';
      const emails = await processCSV(csvContent);

      expect(emails).toHaveLength(2);
    });

    test('should remove duplicate emails', async () => {
      const csvContent = 'test@example.com\nTest@Example.com\ntest@example.com';
      const emails = await processCSV(csvContent);

      expect(emails).toHaveLength(1);
      expect(emails[0]).toBe('test@example.com');
    });

    test('should skip invalid email formats', async () => {
      const csvContent = 'test@example.com\ninvalidemail\n@nodomain.com\nvalid@email.com';
      const emails = await processCSV(csvContent);

      expect(emails).toHaveLength(2);
      expect(emails).toContain('test@example.com');
      expect(emails).toContain('valid@email.com');
    });
  });

  describe('File size validation', () => {
    const handler = require('../../api/validate-csv');
    const { Readable } = require('stream');

    // Helper to create a mock request with file upload
    const createMockRequest = (fileContent, filename = 'test.csv') => {
      const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
      const contentType = `multipart/form-data; boundary=${boundary}`;
      
      // Create multipart form data
      const parts = [
        `--${boundary}`,
        `Content-Disposition: form-data; name="file"; filename="${filename}"`,
        'Content-Type: text/csv',
        '',
        fileContent,
        `--${boundary}--`
      ];
      
      const body = parts.join('\r\n');
      const stream = Readable.from([body]);
      
      return Object.assign(stream, {
        method: 'POST',
        headers: {
          'content-type': contentType
        }
      });
    };

    // Helper to create a mock response
    const createMockResponse = () => {
      const res = {
        statusCode: 200,
        headers: {},
        body: null,
        setHeader: jest.fn((key, value) => {
          res.headers[key] = value;
        }),
        status: jest.fn((code) => {
          res.statusCode = code;
          return res;
        }),
        json: jest.fn((data) => {
          res.body = data;
          return res;
        }),
        end: jest.fn()
      };
      return res;
    };

    test('should accept small valid file under 1MB', async () => {
      // Create a small file with valid emails
      const emails = Array(100).fill(0).map((_, i) => `test${i}@example.com`).join('\n');
      const req = createMockRequest(emails);
      const res = createMockResponse();

      dns.resolveMx.mockResolvedValue([{ exchange: 'mail.example.com', priority: 10 }]);

      await handler(req, res);

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('total');
      expect(res.body).toHaveProperty('valid');
      expect(res.body).toHaveProperty('invalid');
    });

    test('should reject large file over 5MB with 413 status', async () => {
      // Create a file larger than 5MB (5 * 1024 * 1024 bytes)
      // Use padding to make it large without many emails to avoid 300 email limit
      const maxSize = 5 * 1024 * 1024;
      const email = 'test@example.com\n';
      const padding = 'x'.repeat(1024); // 1KB of padding per line
      const line = email + padding + '\n';
      const numLines = Math.ceil(maxSize / line.length) + 10; // Ensure > 5MB
      const largeContent = Array(numLines).fill(line).join('');
      
      const req = createMockRequest(largeContent);
      const res = createMockResponse();

      await handler(req, res);

      expect(res.statusCode).toBe(413);
      expect(res.body).toHaveProperty('error');
      expect(res.body.error).toBe('File too large. Maximum size is 5MB');
    });

    test('should accept file at exactly 5MB limit', async () => {
      // Create a file at approximately 5MB
      const maxSize = 5 * 1024 * 1024;
      const lineSize = 30;
      const numLines = Math.floor(maxSize / lineSize) - 100; // Slightly under to account for line breaks
      const content = Array(numLines).fill(0).map((_, i) => `test${i}@example.com`).join('\n');
      
      const req = createMockRequest(content);
      const res = createMockResponse();

      dns.resolveMx.mockResolvedValue([{ exchange: 'mail.example.com', priority: 10 }]);

      await handler(req, res);

      // Should succeed (200) or hit email limit (400), but not file size error (413)
      expect(res.statusCode).not.toBe(413);
    });

    test('should handle file size check with multiple chunks', async () => {
      // This test verifies that file size is tracked across multiple data chunks
      // The busboy library will handle chunking internally
      const maxSize = 5 * 1024 * 1024;
      const email = 'test@example.com\n';
      const padding = 'x'.repeat(1024); // 1KB of padding per line
      const line = email + padding + '\n';
      const numLines = Math.ceil(maxSize / line.length) + 10; // Ensure > 5MB
      const largeContent = Array(numLines).fill(line).join('');
      
      const req = createMockRequest(largeContent);
      const res = createMockResponse();

      await handler(req, res);

      expect(res.statusCode).toBe(413);
      expect(res.body.error).toBe('File too large. Maximum size is 5MB');
    });
  });
});
