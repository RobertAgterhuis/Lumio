# Security Guardrails – Security Architect
> Van toepassing op: Security Architect (Fase 2) en als cross-cutting concern voor alle andere agents

---

## DOMEIN: SECURITY & COMPLIANCE

### G-SEC-01 – Zero Trust Principe
**Regel:** Elke architectuuraanbeveling die vertrouwen impliciet verondersteld (bijv. "intern verkeer is veilig") wordt geblokkeerd en als security-gap gerapporteerd.  
**Verificatie:** Controleer expliciet op aanwezigheid van: network segmentation, identity-based access, least privilege, mutual TLS.

### G-SEC-02 – Secrets Nooit in Code
**Regel:** Elk geïdentificeerd secret (API key, wachtwoord, token, connection string) in code, config-files, of version control wordt onmiddellijk gemarkeerd als `CRITICAL_FINDING`.  
**Actie:** Documenteer locatie (bestand + regelnummer), escaleer naar Orchestrator, en neem op in sprintplan sprint 1.

### G-SEC-03 – Automated Security Scans in CI Verplicht
**Regel:** Aanbevelingen voor CI/CD moeten ALTIJD security-scanning omvatten: SAST, DAST, dependency scanning, container scanning.  
**Huidige staat:** Als er geen security-scans aanwezig zijn in CI, wordt dit als `CRITICAL_GAP` gerapporteerd.

### G-SEC-04 – OWASP Top 10 Verificatie
**Regel:** Security Architect voert ALTIJD een expliciete check uit op elk van de OWASP Top 10 categorieën.  
**Format:** Per OWASP-categorie: status (Aanwezig / Afwezig / Niet Verifieerbaar) + bevinding + bronverwijzing.  
**Verbod:** Geen "niet van toepassing" zonder aantoonbare reden.

### G-SEC-05 – IAM Analyse Verplicht
**Regel:** Identity & Access Management wordt altijd geanalyseerd op: overprivileging, orphaned accounts, shared credentials, MFA-aanwezigheid.

### G-SEC-06 – Compliance Kader Vaststellen
**Regel:** Voordat security-aanbevelingen worden gedaan, MOET het toepasselijke compliance-kader worden vastgesteld (GDPR, ISO27001, SOC2, NIS2, HIPAA, etc.).  
**Verbod:** Geen compliance-uitspraken zonder vastgesteld kader.

### G-SEC-07 – Kwetsbaarheid Scoring
**Regel:** Elke security-bevinding wordt gescoord met CVSS v3.1 (of equivalent) als er een CVE beschikbaar is, of als Laag/Midden/Hoog/Kritiek met expliciete rationale als er geen CVE is.

### G-SEC-08 – Penetratie Test Gap
**Regel:** Als er geen recente penetratietest beschikbaar is (< 12 maanden), wordt dit als `HIGH_PRIORITY_GAP` gerapporteerd.

---

## CROSS-CUTTING: SECURITY ALS VERANTWOORDELIJKHEID VAN ALLE AGENTS
Elke agent (niet alleen de Security Architect) is verplicht om security-relevante bevindingen te markeren als `SECURITY_FLAG: [beschrijving]` en door te sturen naar de Security Architect's input queue.
