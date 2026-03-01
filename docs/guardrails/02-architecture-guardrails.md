# Architectuur Guardrails – Fase 2 Agents
> Van toepassing op: Software Architect, Senior Developer, DevOps Engineer, Security Architect, Data Architect

---

## DOMEIN: TECHNIEK & ARCHITECTUUR

### G-ARCH-01 – Domain-Driven Design Verplicht
**Regel:** Architectuurbevindingen en aanbevelingen MOETEN worden geëvalueerd in de context van DDD-principes (Bounded Contexts, Aggregates, Domain Events).  
**Bronvereiste:** Elke architectuurclaim moet herleidbaar zijn naar een concreet artefact: code, diagram, of ADR.

### G-ARCH-02 – Infrastructure as Code Only
**Regel:** Infra-aanbevelingen mogen UITSLUITEND betrekking hebben op IaC-gebaseerde oplossingen. Manual provisioning wordt als anti-pattern gedocumenteerd.  
**Verificatie:** Controleer of bestaande infra beschreven is in IaC (Terraform, Bicep, Pulumi, CloudFormation). Zo niet: markeer als technische schuld.

### G-ARCH-03 – No Shared Mutable State
**Regel:** Architectuurpatronen die shared mutable state introduceren worden altijd geflagged als high-risk, met expliciete motivatie en mitigatiestrategie.

### G-ARCH-04 – Tech Debt Score Onderbouwing
**Regel:** De tech-debt score (0–100) mag NOOIT worden ingeschat zonder expliciete criteria.  
**Criteria vereist:** Elke scoredimensie (coupling, testbaarheid, documentatie, modulariteit, security) moet apart beoordeeld worden.  
**Verbod:** Gebruik geen "gut feeling" scores.

### G-ARCH-05 – CI/CD Maturity Verplicht Gedocumenteerd
**Regel:** DevOps Engineer documenteert ALTIJD de huidige CI/CD-volwassenheid op basis van aangeleverde pipeline-configuraties, niet op basis van mondelinge beschrijvingen.  
**Maturity levels:** Level 0 (geen CI/CD) t/m Level 5 (volledig geautomatiseerd, zelfherstellend).

### G-ARCH-06 – Observability Coverage
**Regel:** De analyse van beschikbare observability (metrics, logs, traces, alerts) is VERPLICHT. Ontbrekende dimensies worden als gap geregistreerd.

### G-ARCH-07 – Code Kwaliteit Verificatie
**Regel:** Senior Developer baseert kwaliteitsuitspraken UITSLUITEND op daadwerkelijk geanalyseerde code.  
**Verbod:** Geen kwaliteitsuitspraken op basis van bestandsnamen, projectstructuur, of README-beschrijvingen.  
**Minimale analyse:** SOLID-principes, coupling, cohesion, testdekking (op basis van testbestanden of coverage-rapportages).

### G-ARCH-08 – Data Lineage Gedocumenteerd
**Regel:** Data Architect documenteert ALTIJD de bron-naar-bestemming lineage voor de primaire datadomeinen.  
**Verbod:** Geen data-aanbevelingen zonder volledig beeld van het bestaande datamodel.

### G-ARCH-09 – Scalability Claim Onderbouwing
**Regel:** Elke scalability-bewering (bijv. "dit systeem schaalt niet goed") MOET onderbouwd worden met:  
- Concrete observatie (code, config, of meetdata)  
- Verwacht gedrag onder verhoogde load  
- Impact als de schaalbaarheidsvraag zich voordoet

---

## FASE 2 HANDOFF VEREISTEN
Output is een gecombineerd JSON/Markdown document met:
- `architecture_gaps[]`
- `tech_debt_score{dimensions: {}, total: 0-100}`
- `scalability_risks[]`
- `security_findings[]`
- `ci_cd_maturity_level: 0-5`
- `observability_gaps[]`
- `data_lineage_map{}`

Elke ontbrekende sectie blokkeert de start van Fase 3.
