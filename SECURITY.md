# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| latest  | :white_check_mark: |

Only the latest release is actively supported with security updates.

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly.

**Do not open a public GitHub issue for security vulnerabilities.**

Instead, please use [GitHub's private vulnerability reporting](https://github.com/FrodeHus/sentinel-connector-studio/security/advisories/new) to submit your report.

When reporting, please include:

- A description of the vulnerability
- Steps to reproduce the issue
- The potential impact
- Any suggested fix (if available)

You can expect an initial response within **72 hours**. Once validated, a fix will be prioritized and released as soon as possible, with credit given to the reporter (unless anonymity is requested).

## Security Measures

This project employs the following security practices:

- **Trivy** container image scanning on every Docker publish
- **Dependabot** for automated dependency updates
- **ESLint** and **TypeScript strict mode** for code quality
- **DOMPurify** for SVG sanitization
- **Zod** for input validation
- **Content Security Policy** headers in the production nginx config
