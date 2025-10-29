# Email Validator

A beautiful, modern web application that validates email addresses from CSV files by checking MX records. Features an animated gradient background with smooth hero-to-upload transitions.

## Features

### User Experience
- **Hero Landing Page**: Welcome screen with clear value proposition
- **Smooth Transitions**: Animated hero → upload interface transition
- **Drag & Drop Upload**: Simple CSV file upload with visual feedback
- **Real-time Validation**: Validates up to 300 emails per upload using MX record checks
- **Progress Tracking**: Visual progress bar during validation
- **Clean Results**: Single percentage score showing valid email addresses
- **Terms & Privacy Modal**: Accessible modal with keyboard navigation

### Design
- **Animated Background**: Multiple gradient orbs with smooth animations
- **Twinkling Stars**: Canvas-based star field effect
- **Bottom Glow**: Elegant glow effect at the bottom of the page
- **Responsive**: Mobile-first design that works on all devices
- **Accessible**: ARIA labels, keyboard navigation, focus management

### Technical
- **SEO Optimized**: Comprehensive meta tags and Schema.org markup
- **Fast Loading**: Tailwind CSS via CDN
- **Modern Stack**: Vanilla JavaScript, no frameworks needed
- **Serverless**: Vercel serverless functions for backend

## Live Demo

Visit: [https://pattens-tech.github.io/email-validator/](https://pattens-tech.github.io/email-validator/)

## How It Works

1. **Land on Hero**: See the value proposition and "verify now" button
2. **Upload CSV**: Click to transition to upload interface
3. **Drag & Drop**: Upload your CSV file (or click to browse)
4. **Validation**: System validates each email's domain by checking MX records
5. **Results**: Get instant percentage of valid email addresses

## Technical Stack

### Frontend
- **HTML5**: Semantic markup with ARIA accessibility
- **Tailwind CSS**: Utility-first CSS framework (CDN)
- **Vanilla JavaScript**: No dependencies, pure JS
- **Canvas API**: For animated star field
- **CSS Animations**: Smooth transitions and gradient animations

### Backend
- **Node.js**: Serverless function (Vercel)
- **DNS MX Validation**: Checks domain mail exchange records
- **Rate Limited**: Max 300 emails per request

## File Structure

```
email-validator/
├── index.html              # Main application (hero + upload interface)
├── api/
│   └── validate-csv.js    # Backend API endpoint
├── assets/                 # Images and icons
├── vercel.json            # Vercel configuration
├── package.json           # Node.js dependencies
├── test-emails.csv        # Sample CSV file
└── README.md              # This file
```

## CSV Format

Your CSV file should contain one email address per line:

```
john@company.com
jane@business.org
test@example.com
```

**Requirements**:
- One email per line
- Max 300 emails per upload
- Empty lines are skipped
- Invalid formats are skipped
- Duplicates are automatically removed

## Validation Logic

- **Valid**: Domain has MX records (can receive email)
- **Invalid**: Domain has no MX records (cannot receive email)
- **Skipped**: Empty lines, invalid email formats, duplicates

**Score Calculation**: `(valid emails / total valid email rows) × 100`

## Deployment

### Deploy to Vercel (Recommended)

1. Fork this repository
2. Visit [vercel.com](https://vercel.com)
3. Import your forked repository
4. Deploy!

### Or use Vercel CLI:

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to production
vercel --prod
```

## Local Development

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Run locally:
   ```bash
   vercel dev
   ```

3. Open [http://localhost:3000](http://localhost:3000)

## API Endpoint

### POST `/api/validate-csv`

**Request:**
- Content-Type: `multipart/form-data`
- Body: CSV file with email addresses

**Success Response:**
```json
{
  "total": 100,
  "valid": 87,
  "invalid": 13,
  "percentage": 87.0,
  "skipped": 0
}
```

**Error Responses:**
- `400`: Invalid file format or no emails found
- `400`: File exceeds 300 email limit
- `500`: Server error

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- **File Size**: ~15KB (gzipped)
- **Load Time**: < 1s on 3G
- **Validation Time**: 30-60 seconds for 300 emails
- **No Dependencies**: Uses CDN for Tailwind CSS

## Limitations

- Maximum 300 emails per upload
- MX validation only (does not verify mailbox existence)
- Synchronous processing (no background jobs)
- No authentication required (public tool)
- No data storage (privacy-focused)

## SEO Features

- Comprehensive meta tags (title, description, keywords)
- Open Graph tags for social sharing
- Twitter Card tags
- Schema.org structured data (WebApplication, Organization, BreadcrumbList)
- Canonical URL
- Mobile-optimized

## Accessibility

- ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader compatible
- High contrast colors
- Visible focus indicators

## Social Links

- GitHub: [github.com/pattens-tech](https://github.com/pattens-tech)
- X (Twitter): [x.com/pattens-tech](https://x.com/pattens-tech)

## License

MIT License - feel free to use this project for any purpose

## Author

**PATTENS**
- GitHub: [@pattens-tech](https://github.com/pattens-tech)
- X: [@pattens-tech](https://x.com/pattens-tech)

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## Acknowledgments

- Animated gradient background inspired by modern design trends
- Built with accessibility and performance in mind
- Optimized for SEO and social sharing
