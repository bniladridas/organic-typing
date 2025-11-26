# Security & Threat Model

## Attacker Goals
- Exfiltrate keystrokes (passwords/PII)
- Deanonymize users via typing fingerprints
- Build unauthorized typing fingerprint database

## Mitigations
- Consent + opt-in required before collection
- Masking + anonymization: only aggregated rhythm vectors stored, no raw timestamps or keys
- Retention policies: raw logs purged after 7 days, vectors after 12 months
- Redaction in logs: sensitive data masked
- Rate-limits and CORS: prevent mass scraping
- Secure config: environment variables, no hardcoded secrets
- Encryption: data encrypted at rest and in transit

## Reporting
Report security issues to the repo maintainer.