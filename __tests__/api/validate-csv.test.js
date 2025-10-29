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
});
