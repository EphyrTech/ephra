# Security Guidelines for Ephra

## Environment Variables

This project uses environment variables to manage sensitive configuration. **Never commit actual environment files to the repository.**

### Required Environment Files

Create these files locally (they are gitignored):

1. **`.env`** - Development environment
2. **`.env.staging`** - Staging environment  
3. **`.env.production`** - Production environment

### Template Files

Use these template files as a starting point:

- `.env.example` - Contains all required environment variables with example values
- Copy `.env.example` to `.env` and fill in your actual values

### Sensitive Variables

The following variables contain sensitive information and should never be hardcoded:

- `JWT_SECRET` - JWT signing secret
- `DATABASE_PASSWORD` - Database password
- `STRIPE_SECRET_KEY` - Stripe secret key
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `SMTP_PASSWORD` - Email password
- All API keys and tokens

### Infrastructure Secrets

Kubernetes secrets and credentials are managed through:

- Template files (`.yaml.template`) for structure
- Environment variable substitution for actual values
- External secret management systems in production

## Development Setup

1. Copy environment template:
   ```bash
   cp .env.example .env
   ```

2. Fill in your development values in `.env`

3. Never commit `.env` files to git

## Production Deployment

- Use proper secret management (Kubernetes secrets, AWS Secrets Manager, etc.)
- Rotate secrets regularly
- Use least-privilege access principles
- Monitor for secret exposure

## Reporting Security Issues

If you discover a security vulnerability, please email security@ephra.com instead of creating a public issue.
