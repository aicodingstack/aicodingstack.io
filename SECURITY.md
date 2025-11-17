# Security Policy

## Reporting Security Vulnerabilities

The AI Coding Stack team takes security seriously. We appreciate your efforts to responsibly disclose your findings and will make every effort to acknowledge your contributions.

### How to Report a Security Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them using one of the following methods:

1. **GitHub Security Advisories** (Preferred)
   - Navigate to the [Security tab](https://github.com/aicodingstack/aicodingstack.io/security) of this repository
   - Click "Report a vulnerability"
   - Fill out the form with details about the vulnerability

2. **Email**
   - Send an email to: security@aicodingstack.io
   - Include the word "SECURITY" in the subject line
   - Provide detailed information about the vulnerability

### What to Include in Your Report

To help us better understand and resolve the issue, please include as much of the following information as possible:

- **Type of vulnerability** (e.g., XSS, CSRF, injection, etc.)
- **Full paths of affected source files**
- **Location of the affected source code** (tag/branch/commit or direct URL)
- **Step-by-step instructions to reproduce the issue**
- **Proof-of-concept or exploit code** (if possible)
- **Impact of the vulnerability** (what an attacker could achieve)
- **Suggested remediation** (if you have ideas)

### What to Expect

After you submit a vulnerability report, you can expect:

1. **Acknowledgment**: We'll acknowledge receipt of your report within 48 hours
2. **Assessment**: We'll investigate and assess the severity within 5 business days
3. **Updates**: We'll keep you informed about our progress
4. **Resolution**: We'll work on a fix and release it as soon as possible
5. **Credit**: With your permission, we'll credit you in the security advisory

## Supported Versions

We release security updates for the following versions:

| Version | Supported          |
| ------- | ------------------ |
| Latest (main branch) | ✅ |
| Older versions | ❌ |

We recommend always using the latest version of AI Coding Stack.

## Security Best Practices for Contributors

If you're contributing to this project, please follow these security guidelines:

### Code Contributions

- **Validate all inputs**: Never trust user input
- **Sanitize outputs**: Prevent XSS by properly escaping/sanitizing data
- **Avoid exposing secrets**: Never commit API keys, tokens, or credentials
- **Use dependencies wisely**: Only add well-maintained, trusted dependencies
- **Follow secure coding practices**: Use linters and follow TypeScript best practices

### Manifest Contributions

- **Verify URLs**: Ensure all URLs point to legitimate, official sources
- **Check for malicious content**: Don't include URLs to malware or phishing sites
- **Validate data**: Ensure all data is accurate and from trusted sources

### Pull Requests

- **Review dependencies**: Check for known vulnerabilities before adding dependencies
- **Test security**: Test your changes for potential security issues
- **Document security considerations**: Note any security implications in your PR

## Known Security Considerations

### Current Architecture

AI Coding Stack is a static Next.js website deployed on Cloudflare Pages:

- **No user authentication**: The site doesn't handle user credentials
- **No user data collection**: We don't store personal information
- **Static content**: Most content is statically generated
- **External URLs**: We link to external tools and services
- **API calls**: Limited server-side API calls for data fetching

### Potential Security Concerns

1. **External URLs**: Manifest files contain URLs to third-party sites
   - Mitigation: We validate URLs during CI/CD
   - Manual review of all URL additions

2. **Dependency vulnerabilities**: npm packages may have vulnerabilities
   - Mitigation: Dependabot automatic updates
   - Regular security audits with `npm audit`

3. **XSS risks**: User-contributed content could introduce XSS
   - Mitigation: All content is sanitized and validated
   - JSON schema validation for manifests

## Security Updates and Advisories

Security updates will be announced through:

- **GitHub Security Advisories**: [Security tab](https://github.com/aicodingstack/aicodingstack.io/security/advisories)
- **Release notes**: Tagged releases with security fixes
- **GitHub Discussions**: Security announcements (if applicable)

## Vulnerability Disclosure Policy

We follow a **coordinated disclosure** approach:

1. **Report received**: Acknowledge receipt within 48 hours
2. **Investigation**: Assess and validate the vulnerability
3. **Fix development**: Develop and test a fix
4. **Private disclosure**: Share details with affected parties if applicable
5. **Public disclosure**: Publish security advisory after fix is deployed
6. **Credit**: Credit reporter in advisory (with permission)

### Disclosure Timeline

- **Critical vulnerabilities**: Aim to fix within 7 days
- **High severity**: Aim to fix within 14 days
- **Medium severity**: Aim to fix within 30 days
- **Low severity**: Aim to fix within 60 days

## Security-Related Configuration

### Environment Variables

If you're deploying AI Coding Stack, ensure:

- Never commit `.env` files
- Use secrets management for API tokens
- Rotate credentials regularly
- Use least-privilege access for API keys

### Cloudflare Configuration

- Use HTTPS only (enforced by Cloudflare)
- Enable security headers
- Configure CSP (Content Security Policy)
- Enable DDoS protection

## Contact

For security concerns or questions not covered here:

- **Security Reports**: Use GitHub Security Advisories
- **General Security Questions**: Open a GitHub Discussion
- **Urgent Issues**: security@aicodingstack.io

## Acknowledgments

We'd like to thank the following individuals for responsibly disclosing security vulnerabilities:

*(This section will be updated as vulnerabilities are reported and fixed)*

---

**Thank you for helping keep AI Coding Stack and our community safe!** 🔒
