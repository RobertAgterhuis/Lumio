# Data Duplicatie Analyse – Cross-Domain Relaties

**Datum**: 5 maart 2026  
**Issue**: Geen onderliggende relatie tussen domeinen → gebruikers moeten gegevens meerdere keren invoeren  
**Voorbeeld**: Notaris invoeren in "Mijn Profiel" én opnieuw in "Testament"

---

## 1. INVENTARIS VAN DUPLICATIES

### 1.1 NOTARIS (7 velden × 2 locaties = 14 database kolommen)

**Locatie A: `Eigenaar` tabel** (Mijn Profiel pagina)
```csharp
public string? Notaris { get; set; }
public string? NotarisKantoor { get; set; }
public string? NotarisTelefoon { get; set; }
public string? NotarisEmail { get; set; }
public string? NotarisAdres { get; set; }
public string? NotarisPostcode { get; set; }
public string? NotarisPlaats { get; set; }
```

**Locatie B: `TestamentInfo` tabel** (Testament pagina)
```csharp
public string? NotarisNaam { get; set; }           // ⚠️ ANDERE NAAM!
public string? NotarisKantoor { get; set; }
public string? NotarisTelefoon { get; set; }
public string? NotarisEmail { get; set; }
public string? NotarisAdres { get; set; }
public string? NotarisPostcode { get; set; }
public string? NotarisPlaats { get; set; }
```

**Probleem**:
- Eigenaar.`Notaris` vs TestamentInfo.`NotarisNaam` → inconsistente naamgeving!
- Gebruiker vult notaris in bij profiel → moet OPNIEUW invullen bij testament
- Fouten mogelijk: type, telefoon verschil, etc.

**Bestaande detectie**:
- ✅ BR-SUG-12: "De notaris in uw profiel verschilt van de notaris bij het testament"
- ⚠️ Detecteert inconsistentie maar lost duplicatie niet op

---

### 1.2 UITVAARTONDERNEMER (6 velden × 2+ locaties)

**Locatie A: `UitvaartWensen` tabel** (Uitvaart pagina)
```csharp
public string? UitvaartOndernemer { get; set; }
public string? UitvaartOndernemerTelefoon { get; set; }
public string? UitvaartOndernemerEmail { get; set; }
public string? UitvaartOndernemerAdres { get; set; }
public string? UitvaartOndernemerPostcode { get; set; }
public string? UitvaartOndernemerPlaats { get; set; }
```

**Locatie B: `Noodcontact` tabel** (Noodcontacten pagina, indien rol = "Uitvaartondernemer")
```csharp
public string Naam { get; set; }
public string? Telefoon { get; set; }
public string? Email { get; set; }
public string? Adres { get; set; }
public string? Postcode { get; set; }
public string? Woonplaats { get; set; }
public string? BedrijfsNaam { get; set; }
public string Rol { get; set; }                   // = "Uitvaartondernemer"
```

**Probleem**:
- Geen automatische koppeling tussen UitvaartWensen.UitvaartOndernemer en Noodcontact
- Gebruiker moet uitvaartondernemer 2× invoeren (of manueel kopiëren)

---

### 1.3 HUISARTS (4 velden × 2+ locaties)

**Locatie A: `WilsverklaringEuthanasie` tabel** (Euthanasie pagina)
```csharp
public string? Huisarts { get; set; }
public string? HuisartsPraktijk { get; set; }
public string? HuisartsTelefoon { get; set; }
public string? HuisartsEmail { get; set; }
```

**Locatie B: `Noodcontact` tabel** (Noodcontacten pagina, indien rol = "Huisarts")
```csharp
public string Naam { get; set; }                  // = huisarts naam
public string? Telefoon { get; set; }
public string? Email { get; set; }
public string? BedrijfsNaam { get; set; }         // = praktijk naam
public string Rol { get; set; }                   // = "Huisarts"
```

**Probleem**:
- Gebruiker vult huisarts in bij euthanasie wilsverklaring → moet OPNIEUW toevoegen als noodcontact
- Geen sync tussen WilsverklaringEuthanasie.Huisarts en Noodcontact entries

---

### 1.4 EXECUTEUR (9 velden × 2-3 locaties)

**Locatie A: `Executeur` tabel** (Testament → Executeurs subsectie)
```csharp
public string Naam { get; set; }
public string? Relatie { get; set; }
public string? Telefoon { get; set; }
public string? Email { get; set; }
public string? Adres { get; set; }
public string? Postcode { get; set; }
public string? Woonplaats { get; set; }
public string? Bevoegdheden { get; set; }
public Guid? ErfgenaamId { get; set; }            // Optionele FK
public Guid? NoodcontactId { get; set; }          // Optionele FK
```

**Locatie B: `Noodcontact` tabel** (Noodcontacten pagina, indien toegevoegd)
```csharp
public string Naam { get; set; }
public string Relatie { get; set; }
public string? Telefoon { get; set; }
public string? Email { get; set; }
public string? Adres { get; set; }
public string? Postcode { get; set; }
public string? Woonplaats { get; set; }
public string Rol { get; set; }                   // bijv. "Executeur"
```

**Locatie C: `Erfgenaam` tabel** (indien executeur ook erfgenaam is)
```csharp
public string Naam { get; set; }
public string Relatie { get; set; }
public string? Telefoon { get; set; }
public string? Email { get; set; }
public string? Adres { get; set; }
// ... etc
```

**Probleem**:
- Executeurs hebben FK's naar Noodcontact/Erfgenaam, maar deze zijn optioneel
- Veel executeurs worden als losstaande records aangemaakt (zonder link)
- Gebruiker moet executeur handmatig kopiëren naar noodcontacten

**Bestaande detectie**:
- ✅ BR-SUG-13: "Executeur '{naam}' is benoemd in het testament maar niet als noodcontact geregistreerd"
- ⚠️ Detecteert ontbrekende koppeling maar lost duplicatie niet op

---

### 1.5 VERTEGENWOORDIGERS (7 velden × 2 personen in 1 tabel)

**Locatie: `WilsverklaringEuthanasie` tabel** (Euthanasie pagina)
```csharp
// Vertegenwoordiger 1
public string? VertegenwoordigerNaam { get; set; }
public string? VertegenwoordigerRelatie { get; set; }
public string? VertegenwoordigerTelefoon { get; set; }
public string? VertegenwoordigerEmail { get; set; }
public string? VertegenwoordigerAdres { get; set; }
public string? VertegenwoordigerPostcode { get; set; }
public string? VertegenwoordigerWoonplaats { get; set; }

// Vertegenwoordiger 2
public string? Vertegenwoordiger2Naam { get; set; }
public string? Vertegenwoordiger2Relatie { get; set; }
public string? Vertegenwoordiger2Telefoon { get; set; }
public string? Vertegenwoordiger2Email { get; set; }
```

**Probleem**:
- Deze personen zijn vaak familie → zijn waarschijnlijk al erfgenamen of noodcontacten
- Geen koppeling → gebruiker moet opnieuw invullen
- Bij wijziging contactgegevens (bijv. telefoonnummer) moet op 2-3 plekken worden geüpdatet

---

## 2. IMPACT ANALYSE

### 2.1 Database Impact

**Huidige situatie (geschat)**:
- ~35 database kolommen bevatten gedupliceerde contactgegevens
- Spread over 5 verschillende tabellen
- Geen referential integrity tussen gerelateerde personen

**Tabellen met duplicatie**:
1. `Eigenaar` (7 notaris-velden)
2. `TestamentInfo` (7 notaris-velden)
3. `UitvaartWensen` (6 uitvaartondernemer-velden)
4. `WilsverklaringEuthanasie` (4 huisarts + 14 vertegenwoordiger-velden)
5. `Executeur` (9 velden per executeur)
6. `Noodcontact` (13 velden, kan dezelfde personen bevatten als bovenstaande)

### 2.2 Frontend Impact

**Formulieren die geraakt worden**:
1. `src/lumio-web/src/app/(authenticated)/eigenaar/page.tsx` – Profiel notaris sectie
2. `src/lumio-web/src/app/(authenticated)/testament/wizard/page.tsx` – Testament wizard notaris stap
3. `src/lumio-web/src/components/testament/TestamentEditDialog.tsx` – Testament edit notaris
4. `src/lumio-web/src/app/(authenticated)/uitvaart/**` – Uitvaart formulieren
5. `src/lumio-web/src/app/(authenticated)/euthanasie/**` – Euthanasie formulieren
6. `src/lumio-web/src/components/interview/InterviewWizard.tsx` – Onboarding flow

**Geschat aantal bestanden**: ~15-20 frontend componenten

### 2.3 Backend Impact

**Controllers/Services**:
- `EigenaarController.cs` (profiel notaris)
- `TestamentController.cs` (testament notaris)
- `TestamentExecuteursController.cs` (executeurs)
- `NoodcontactenController.cs` (noodcontacten)
- `UitvaartController.cs` (uitvaartondernemer)
- `WilsverklaringController.cs` (huisarts + vertegenwoordigers)

**Validators**:
- `EigenaarUpsertRequestValidator` (7 notaris validaties)
- `TestamentInfoUpsertRequestValidator` (7 notaris validaties)
- `ExecuteurUpsertRequestValidator`
- `NoodcontactUpsertRequestValidator`
- `UitvaartWensenUpsertRequestValidator`
- `WilsverklaringUpsertRequestValidator`

**Business Rules / Suggesties**:
- BR-SUG-12: Notaris inconsistentie detectie
- BR-SUG-13: Executeur niet als noodcontact detectie
- Mogelijk nieuwe rules nodig voor uitvaartondernemer, huisarts

**PDF Generators**:
- `TestamentGenerator` (gebruikt testament.NotarisNaam)
- `NoodkaartGenerator` (gebruikt fallback: testament.NotarisNaam ?? eigenaar.Notaris)
- `NotarisGenerator` (notaris-specifieke PDF)
- `ExecuteurRapportGenerator` (executeur gegevens)
- Alle PDF generators die contactgegevens tonen

**Export Services**:
- `ExportDataService` (JSON/XML export)
- `ZipExportService` (PDF bundels)
- `HtmlExportService` (HTML samenvatting)

**Geschat aantal bestanden**: ~25-30 backend bestanden

---

## 3. USER EXPERIENCE PROBLEMEN

### 3.1 Huidige Gebruikerservaring (Negatief)

**Scenario 1: Nieuwe gebruiker tijdens onboarding**
1. Stap 3: Noodcontact → vult notaris in als noodcontact
2. Stap 5: Testament → moet notaris OPNIEUW invullen
3. **Frustratie**: "Waarom moet ik dit dubbel doen?"

**Scenario 2: Bestaande gebruiker past telefoon notaris aan**
1. Notaris belt: nieuw nummer
2. Gebruiker update in Profiel → eigenaar.NotarisTelefoon
3. **Probleem**: Testament.NotarisTelefoon blijft oud nummer
4. Noodkaart PDF toont nu TWEE verschillende nummers (fallback logica!)

**Scenario 3: Executeur toevoegen**
1. Gebruiker voegt zus toe als executeur in Testament
2. Systeem toont suggestie: "Executeur niet als noodcontact geregistreerd"
3. Gebruiker moet handmatig alle gegevens opnieuw invullen in Noodcontacten
4. **Frustratie**: "Het systeem weet toch al wie mijn zus is?"

**Scenario 4: Oudere gebruiker (doelgroep!)**
1. Ziet lange formulieren met dezelfde velden
2. **Verwarring**: "Heb ik dit al ingevuld? Of moet ik dit hier ook doen?"
3. **Risico**: Vult NIET in uit onzekerheid → incomplete data

### 3.2 Gewenste Gebruikerservaring (Positief)

**Scenario 1: Nieuwe gebruiker tijdens onboarding**
1. Stap 3: Noodcontact → vult notaris in als contact
2. Stap 5: Testament → **dropdown**: "Selecteer notaris" → kiest bestaande notaris
3. ✅ **Opluchting**: "Dat ging makkelijk!"

**Scenario 2: Bestaande gebruiker past telefoon notaris aan**
1. Notaris belt: nieuw nummer
2. Gebruiker update in "Contacten" → één centrale plek
3. **Systeem**: "Deze notaris wordt ook gebruikt in Testament. Wilt u daar ook bijwerken?" → Ja
4. ✅ **Vertrouwen**: Overal consistent

**Scenario 3: Executeur toevoegen**
1. Gebruiker voegt zus toe als executeur in Testament
2. **Dropdown**: "Selecteer uit bestaande contacten" → kiest zus (al erfgenaam)
3. **Checkbox**: "Voeg ook toe als noodcontact" → aangevinkt
4. ✅ **Efficiëntie**: Eén keer klikken

---

## 4. VOORGESTELDE OPLOSSING

### 4.1 Architectuur: Gedeelde Contacten Entiteit

**Nieuwe tabel: `SharedContact` (of `ContactPersoon`)**

```csharp
public class SharedContact : BaseEntity
{
    public Guid Id { get; set; }
    public Guid EigenaarId { get; set; }           // Eigenaar van dit contact
    
    // Type classificatie
    public ContactType Type { get; set; }          // Enum: Notaris, Huisarts, Uitvaart, etc.
    public string? SubType { get; set; }           // bijv. "Executeur", "Vertegenwoordiger"
    
    // Persoonlijke gegevens
    public string Naam { get; set; }
    public string? Relatie { get; set; }
    public string? Telefoon { get; set; }
    public string? Email { get; set; }
    public string? Adres { get; set; }
    public string? Postcode { get; set; }
    public string? Woonplaats { get; set; }
    
    // Organisatie gegevens (voor professionals)
    public string? BedrijfsNaam { get; set; }
    public string? Functie { get; set; }
    public string? KantoorNaam { get; set; }       // voor notaris, huisarts praktijk
    
    // Metadata
    public string? Notities { get; set; }
    public bool IsGedeed { get; set; }             // herbruik van Noodcontact.IsGedeeld
    public DateTime AangemaaktOp { get; set; }
    public DateTime GewijzigdOp { get; set; }
}

public enum ContactType
{
    Notaris,
    Huisarts,
    Uitvaartondernemer,
    Executeur,
    Vertegenwoordiger,
    Erfgenaam,
    Noodcontact,
    Familie,
    Vriend,
    Professional,
    Anders
}
```

### 4.2 Relatie-koppelingen (Foreign Keys)

**Update bestaande tabellen met nieuwe FK's**:

```csharp
// Eigenaar tabel
public Guid? NotarisContactId { get; set; }
public SharedContact? NotarisContact { get; set; }

// TestamentInfo tabel  
public Guid? NotarisContactId { get; set; }
public SharedContact? NotarisContact { get; set; }

// UitvaartWensen tabel
public Guid? UitvaartOndernemerContactId { get; set; }
public SharedContact? UitvaartOndernemerContact { get; set; }

// WilsverklaringEuthanasie tabel
public Guid? HuisartsContactId { get; set; }
public SharedContact? HuisartsContact { get; set; }
public Guid? VertegenwoordigerContactId { get; set; }
public SharedContact? VertegenwoordigerContact { get; set; }
public Guid? Vertegenwoordiger2ContactId { get; set; }
public SharedContact? Vertegenwoordiger2Contact { get; set; }

// Executeur tabel
public Guid? BronContactId { get; set; }          // link naar SharedContact
public SharedContact? BronContact { get; set; }

// Noodcontact tabel (bestaande)
public Guid? SharedContactId { get; set; }        // optionele link
public SharedContact? SharedContact { get; set; }
```

**⚠️ BELANGRIJK**: Oude inline velden BLIJVEN BESTAAN (backwards compatibility)!

### 4.3 Data Migration Strategy

**Stap 1: Schema wijziging (EF Migration)**
- Voeg `SharedContact` tabel toe
- Voeg FK kolommen toe aan bestaande tabellen (nullable)
- **GEEN data verwijderen**

**Stap 2: Data migratie script**
```csharp
public class MigrateToSharedContactsService
{
    public async Task MigrateAsync()
    {
        // 1. Migreer notarissen uit Eigenaar en TestamentInfo
        var eigenaren = await _db.Eigenaar.Where(e => e.Notaris != null).ToListAsync();
        foreach (var eigenaar in eigenaren)
        {
            var contact = await GetOrCreateSharedContact(
                eigenaar.EigenaarId,
                ContactType.Notaris,
                eigenaar.Notaris,
                eigenaar.NotarisTelefoon,
                eigenaar.NotarisEmail,
                eigenaar.NotarisAdres,
                eigenaar.NotarisPostcode,
                eigenaar.NotarisPlaats,
                eigenaar.NotarisKantoor
            );
            eigenaar.NotarisContactId = contact.Id;
        }
        
        var testamenten = await _db.Testamenten.Where(t => t.NotarisNaam != null).ToListAsync();
        foreach (var testament in testamenten)
        {
            // Check of eigenaar al notaris heeft met zelfde naam/telefoon
            var eigenaar = await _db.Eigenaar.FindAsync(testament.EigenaarId);
            SharedContact contact;
            
            if (eigenaar?.NotarisContactId != null && 
                IsSameContact(eigenaar.Notaris, testament.NotarisNaam, ...))
            {
                // Hergebruik bestaand contact
                contact = await _db.SharedContacts.FindAsync(eigenaar.NotarisContactId);
            }
            else
            {
                // Maak nieuw contact (verschillende notaris)
                contact = await GetOrCreateSharedContact(...);
            }
            
            testament.NotarisContactId = contact.Id;
        }
        
        // 2. Migreer executeurs
        var executeurs = await _db.Executeurs.ToListAsync();
        foreach (var executeur in executeurs)
        {
            // Check of al gekoppeld aan Noodcontact of Erfgenaam
            if (executeur.NoodcontactId != null)
            {
                var noodcontact = await _db.Noodcontacten.FindAsync(executeur.NoodcontactId);
                var contact = await GetOrCreateSharedContact(...gegevens van noodcontact...);
                executeur.BronContactId = contact.Id;
                noodcontact.SharedContactId = contact.Id;  // bidirectionele link
            }
            else if (executeur.ErfgenaamId != null)
            {
                var erfgenaam = await _db.Erfgenamen.FindAsync(executeur.ErfgenaamId);
                var contact = await GetOrCreateSharedContact(...gegevens van erfgenaam...);
                executeur.BronContactId = contact.Id;
            }
            else
            {
                // Standalone executeur → maak nieuw SharedContact
                var contact = await GetOrCreateSharedContact(
                    testament.EigenaarId,
                    ContactType.Executeur,
                    executeur.Naam,
                    executeur.Telefoon,
                    executeur.Email,
                    executeur.Adres,
                    executeur.Postcode,
                    executeur.Woonplaats,
                    null  // geen bedrijfsnaam
                );
                executeur.BronContactId = contact.Id;
            }
        }
        
        // 3. Migreer uitvaartondernemers, huisartsen, vertegenwoordigers...
        // ...
        
        await _db.SaveChangesAsync();
    }
    
    private async Task<SharedContact> GetOrCreateSharedContact(
        Guid eigenaarId,
        ContactType type,
        string naam,
        string? telefoon,
        string? email,
        string? adres,
        string? postcode,
        string? woonplaats,
        string? bedrijfsNaam)
    {
        // Check of contact al bestaat (match op naam + telefoon/email)
        var existing = await _db.SharedContacts
            .Where(c => c.EigenaarId == eigenaarId && 
                        c.Naam == naam &&
                        (c.Telefoon == telefoon || c.Email == email))
            .FirstOrDefaultAsync();
            
        if (existing != null)
            return existing;
            
        // Maak nieuw contact
        var contact = new SharedContact
        {
            EigenaarId = eigenaarId,
            Type = type,
            Naam = naam,
            Telefoon = telefoon,
            Email = email,
            Adres = adres,
            Postcode = postcode,
            Woonplaats = woonplaats,
            BedrijfsNaam = bedrijfsNaam,
            AangemaaktOp = DateTime.UtcNow,
            GewijzigdOp = DateTime.UtcNow
        };
        
        _db.SharedContacts.Add(contact);
        await _db.SaveChangesAsync();
        return contact;
    }
}
```

**Stap 3: Update business logic**
- Properties: gebruik FK reference als primary, fallback op oude inline velden
```csharp
// TestamentInfo.cs
[NotMapped]
public string? NotarisNaamDisplay => 
    NotarisContact?.Naam ?? NotarisNaam;  // nieuwe FK eerst, dan oude veld
```

### 4.4 Frontend UI Changes

**Component 1: `ContactSelector.tsx`** (nieuw)
```tsx
interface ContactSelectorProps {
  type: ContactType;
  value: string | null;  // SharedContact.Id
  onChange: (contactId: string | null, contactData: ContactData) => void;
  allowCreate?: boolean;
  linkLabel?: string;  // bijv. "Voeg toe als noodcontact"
}

export function ContactSelector({ type, value, onChange }: ContactSelectorProps) {
  const { data: contacts } = useQuery(['shared-contacts', type], 
    () => api.getSharedContacts(type)
  );
  
  return (
    <div>
      <Select value={value} onChange={(id) => {
        const contact = contacts.find(c => c.id === id);
        onChange(id, contact);
      }}>
        <option value="">-- Selecteer bestaand contact --</option>
        {contacts?.map(c => (
          <option key={c.id} value={c.id}>
            {c.naam} {c.bedrijfsNaam && `(${c.bedrijfsNaam})`}
          </option>
        ))}
      </Select>
      
      {value && (
        <div className="mt-2 p-2 bg-sage-50 rounded">
          <ContactPreview contactId={value} />
          <button onClick={() => setEditMode(true)}>Bewerk gegevens</button>
        </div>
      )}
      
      {allowCreate && (
        <button onClick={() => setShowCreateDialog(true)}>
          + Nieuw contact toevoegen
        </button>
      )}
      
      {linkLabel && (
        <Checkbox label={linkLabel} 
          checked={linkToEmergency}
          onChange={(checked) => {
            // Voeg contact ook toe aan Noodcontacten
          }}
        />
      )}
    </div>
  );
}
```

**Component 2: Testament wizard update**
```tsx
// VOOR (testament/wizard/page.tsx)
<div>
  <Label>{t("notaris.naamNotaris")}</Label>
  <Input 
    value={form.notarisNaam} 
    onChange={(e) => update("notarisNaam", e.target.value)} 
  />
  <Label>{t("notaris.notarisKantoor")}</Label>
  <Input 
    value={form.notarisKantoor} 
    onChange={(e) => update("notarisKantoor", e.target.value)} 
  />
  {/* ... 5 meer velden ... */}
</div>

// NA
<div>
  <ContactSelector
    type="Notaris"
    value={form.notarisContactId}
    onChange={(id, data) => {
      update("notarisContactId", id);
      // Auto-fill oude velden voor backwards compat
      update("notarisNaam", data.naam);
      update("notarisKantoor", data.bedrijfsNaam);
      update("notarisTelefoon", data.telefoon);
      // ...
    }}
    allowCreate={true}
    linkLabel="Voeg notaris toe als noodcontact"
  />
  
  {/* Optioneel: toon inline velden voor handmatige override */}
  <Collapsible trigger="Handmatig aanpassen">
    <Input value={form.notarisNaam} onChange={...} />
    {/* ... oude velden ... */}
  </Collapsible>
</div>
```

### 4.5 Backend API Changes

**Nieuwe endpoints**:
```csharp
[ApiController]
[Route("api/[controller]")]
public class SharedContactsController : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<SharedContactResponse>>> GetAll(
        [FromQuery] ContactType? type = null)
    {
        var query = _db.SharedContacts
            .Where(c => c.EigenaarId == GetCurrentEigenaarId());
            
        if (type.HasValue)
            query = query.Where(c => c.Type == type.Value);
            
        var contacts = await query.ToListAsync();
        return Ok(contacts.Select(MapToResponse));
    }
    
    [HttpPost]
    public async Task<ActionResult<SharedContactResponse>> Create(
        SharedContactUpsertRequest request)
    {
        // Validatie + duplicaat check
        var existing = await _db.SharedContacts
            .Where(c => c.EigenaarId == GetCurrentEigenaarId() &&
                        c.Naam == request.Naam &&
                        (c.Telefoon == request.Telefoon || c.Email == request.Email))
            .FirstOrDefaultAsync();
            
        if (existing != null)
            return Conflict("Contact bestaat al");
            
        var contact = new SharedContact { ...mapping... };
        _db.SharedContacts.Add(contact);
        await _db.SaveChangesAsync();
        
        return CreatedAtAction(nameof(GetById), new { id = contact.Id }, 
            MapToResponse(contact));
    }
    
    [HttpPut("{id}")]
    public async Task<ActionResult> Update(Guid id, 
        SharedContactUpsertRequest request)
    {
        var contact = await _db.SharedContacts.FindAsync(id);
        if (contact == null) return NotFound();
        
        // Update contact
        contact.Naam = request.Naam;
        // ...
        
        // Optioneel: propageer wijziging naar gekoppelde records
        await PropagateChangesToLinkedRecords(contact);
        
        await _db.SaveChangesAsync();
        return NoContent();
    }
    
    [HttpPost("{id}/link-to-emergency")]
    public async Task<ActionResult> LinkToEmergency(Guid id)
    {
        var contact = await _db.SharedContacts.FindAsync(id);
        if (contact == null) return NotFound();
        
        // Maak Noodcontact entry
        var noodcontact = new Noodcontact
        {
            EigenaarId = contact.EigenaarId,
            SharedContactId = contact.Id,
            Naam = contact.Naam,
            Telefoon = contact.Telefoon,
            Email = contact.Email,
            Adres = contact.Adres,
            Postcode = contact.Postcode,
            Woonplaats = contact.Woonplaats,
            Rol = contact.Type.ToString(),
            BedrijfsNaam = contact.BedrijfsNaam,
            Prioriteit = 2
        };
        
        _db.Noodcontacten.Add(noodcontact);
        await _db.SaveChangesAsync();
        
        return Ok();
    }
    
    private async Task PropagateChangesToLinkedRecords(SharedContact contact)
    {
        // Update alle gekoppelde Eigenaar records
        var eigenaren = await _db.Eigenaar
            .Where(e => e.NotarisContactId == contact.Id)
            .ToListAsync();
        foreach (var e in eigenaren)
        {
            e.Notaris = contact.Naam;
            e.NotarisKantoor = contact.BedrijfsNaam;
            e.NotarisTelefoon = contact.Telefoon;
            // ...
        }
        
        // Update alle gekoppelde TestamentInfo records
        var testamenten = await _db.Testamenten
            .Where(t => t.NotarisContactId == contact.Id)
            .ToListAsync();
        foreach (var t in testamenten)
        {
            t.NotarisNaam = contact.Naam;
            t.NotarisKantoor = contact.BedrijfsNaam;
            // ...
        }
        
        // Update gekoppelde Noodcontacten
        var noodcontacten = await _db.Noodcontacten
            .Where(n => n.SharedContactId == contact.Id)
            .ToListAsync();
        foreach (var n in noodcontacten)
        {
            n.Naam = contact.Naam;
            n.Telefoon = contact.Telefoon;
            // ...
        }
        
        // ...etc voor alle gekoppelde entiteiten
    }
}
```

---

## 5. IMPLEMENTATIE ROADMAP

### Fase 0: Voorbereiding (1-2 dagen)
- ✅ **Complete analyse** (dit document)
- [ ] **Team review** – bespreek architectuur met tech lead
- [ ] **UX review** – bespreek nieuwe UI met UX designer
- [ ] **Planning** – sprint inschattingen

### Fase 1: Backend Foundation (1 sprint = 2 weken)
**Week 1:**
- [ ] Maak `SharedContact` domein entiteit
- [ ] EF Migration: nieuwe tabel + FK kolommen op bestaande tabellen
- [ ] Database seeding script voor dev/test data
- [ ] Unit tests voor SharedContact entity

**Week 2:**
- [ ] `SharedContactsController` met CRUD endpoints
- [ ] Validators voor SharedContact
- [ ] Data migratie service (MigrateToSharedContactsService)
- [ ] Integration tests voor nieuwe endpoints
- [ ] **Milestone**: Backend API compleet, oude API endpoints blijven werken

### Fase 2: Frontend Foundation (1 sprint)
**Week 1:**
- [ ] `ContactSelector` component
- [ ] `ContactPreviewCard` component  
- [ ] `ContactCreateDialog` component
- [ ] React Query hooks voor SharedContacts API
- [ ] Storybook stories voor nieuwe components

**Week 2:**
- [ ] Update Testament wizard – notaris selectie
- [ ] Update Profiel pagina – notaris selectie
- [ ] Accessibility testing (WCAG 2.1 AA)
- [ ] **Milestone**: Testament notaris volledig via SharedContacts

### Fase 3: Rollout per Domein (3 sprints, 1 per domein)

**Sprint 3: Executeurs**
- [ ] Update Testament Executeurs formulier
- [ ] "Voeg toe als noodcontact" functionaliteit
- [ ] Update BR-SUG-13 regel (auto-fix suggestie)
- [ ] User testing met 5 testgebruikers
- [ ] **Milestone**: Executeurs via SharedContacts

**Sprint 4: Uitvaart + Huisarts**
- [ ] Update Uitvaart formulier – uitvaartondernemer
- [ ] Update Euthanasie formulier – huisarts
- [ ] Nieuwe suggestie regel: huisarts consistentie check
- [ ] **Milestone**: Uitvaart + Euthanasie via SharedContacts

**Sprint 5: Vertegenwoordigers + Cleanup**
- [ ] Update Euthanasie – vertegenwoordigers (1 + 2)
- [ ] Globale "Contact Manager" pagina (overzicht alle contacten)
- [ ] Bulk import/export contacten
- [ ] **Milestone**: Alle domeinen via SharedContacts

### Fase 4: Data Migratie Productie (1 sprint)
**Voor release:**
- [ ] Dry-run migratie op productie backup database
- [ ] Performance test: migratie script op 10k profielen
- [ ] Rollback plan documenteren
- [ ] Communication plan: gebruikers informeren

**Release day:**
- [ ] Downtime window (2-4 uur, 's nachts)
- [ ] Database backup
- [ ] Run migratie script
- [ ] Smoke tests
- [ ] Monitor error logs eerste 48 uur
- [ ] **Milestone**: Productie live met SharedContacts

### Fase 5: Deprecation (6 maanden later)
- [ ] Mark oude inline velden `[Obsolete]` in C#
- [ ] Remove oude velden van DTOs (breaking change)
- [ ] Database migration: drop oude kolommen
- [ ] **Milestone**: Legacy code volledig verwijderd

---

## 6. RISICO'S & MITIGATIE

### Risico 1: Data Loss tijdens migratie
**Kans**: Medium  
**Impact**: HOOG  
**Mitigatie**:
- ✅ Behoud oude inline velden (backwards compatibility)
- ✅ Uitgebreide tests op backup database
- ✅ Rollback plan: oude velden blijven bruikbaar
- ✅ Dry-run op productie backup 1 week voor release

### Risico 2: Gebruikers snappen nieuwe UI niet
**Kans**: Medium  
**Impact**: Medium  
**Mitigatie**:
- ✅ User testing met 10+ testgebruikers (vooral ouderen!)
- ✅ Inline help tooltips bij ContactSelector
- ✅ Optie om "oude manier" te gebruiken (handmatige velden)
- ✅ Tutorial video: "Contacten beheren"

### Risico 3: Performance degradatie
**Kans**: Laag  
**Impact**: Medium  
**Mitigatie**:
- ✅ Index op SharedContacts.EigenaarId + Type
- ✅ Eager loading van Contact references (Include)
- ✅ Caching van vaak-gebruikte contacten (React Query)
- ✅ Performance tests: 10k SharedContacts per profiel

### Risico 4: Breaking changes voor externe integraties
**Kans**: Laag (geen externe API's momenteel)  
**Impact**: Laag  
**Mitigatie**:
- ✅ API versioning: oude endpoints blijven 1 jaar werken
- ✅ Deprecation warnings in API responses
- ✅ Migration guide in technical documentation

### Risico 5: Scope creep / Te groot
**Kans**: HOOG  
**Impact**: HOOG  
**Mitigatie**:
- ✅ Iteratieve aanpak: 1 domein per sprint
- ✅ MVP eerst: alleen Notaris (grootste pain point)
- ✅ Feature flags: toggle nieuwe UI per domein
- ✅ Sprint reviews: stop criterion als te complex

---

## 7. ALTERNATIEVE OPLOSSINGEN (OVERWOGEN & VERWORPEN)

### Alternatief 1: Auto-sync tussen bestaande tabellen
**Idee**: Houd huidige schema, maar sync automatisch tussen Eigenaar.Notaris en Testament.NotarisNaam wanneer 1 wijzigt.

**Voordelen**:
- Kleinere code change
- Geen database schema wijziging

**Nadelen**:
- Lost NIET het fundamentele probleem op (duplicatie blijft)
- Complex: welke richting sync je? (Eigenaar → Testament of omgekeerd?)
- Werkt niet voor 3-weg duplicaties (Executeur + Noodcontact + Erfgenaam)
- **Verworpen**: Plakt pleisters, lost root cause niet op

### Alternatief 2: Merge Noodcontact en SharedContact
**Idee**: Gebruik bestaande `Noodcontact` tabel als universele contact store, hernoem naar `Contact`.

**Voordelen**:
- Minder nieuwe code
- Noodcontacten zijn al een soort "centrale contacten"

**Nadelen**:
- `Noodcontact` heeft specifieke velden (Prioriteit, Instructies) die niet passen voor notaris/huisarts
- Semantisch verwarrend: "Notaris is geen noodcontact"
- Rol-veld niet type-safe (string vs enum)
- **Verworpen**: Semantische mismatch

### Alternatief 3: Inline edit met "Gebruik bestaand" knop
**Idee**: Houd inline velden, maar voeg "Gebruik bestaand contact" knop toe die velden auto-fill.

**Voordelen**:
- Minimale UI change
- Backwards compatible

**Nadelen**:
- Lost geen duplicatie op → oude velden blijven bestaan
- Geen referential integrity → updates synchroniseren niet
- Gebruiker moet WETEN dat contact al bestaat
- **Verworpen**: Halve oplossing

---

## 8. SUCCESS CRITERIA

### Kwantitatief

**Metric 1: Dubbele input vermindering**
- **Voor**: Gebruiker vult notaris 2× in (Profiel + Testament)
- **Na**: Gebruiker vult notaris 1× in, selecteert daarna uit dropdown
- **Target**: >80% gebruikers hergebruikt bestaande contacten

**Metric 2: Data consistentie**
- **Voor**: BR-SUG-12 trigger rate: ~15% profielen (geschat)
- **Na**: BR-SUG-12 trigger rate: <2%
- **Target**: 90% reductie inconsistenties

**Metric 3: Invultijd**
- **Voor**: Gemiddeld 3 min voor testament notaris sectie (7 velden)
- **Na**: Gemiddeld 30 sec (dropdown + bevestig)
- **Target**: 80% sneller

### Kwalitatief

**Gebruikersfeedback**:
- [ ] "Makkelijker dan oude versie" (>70% testgebruikers)
- [ ] "Ik begrijp hoe het werkt" (>90% testgebruikers)
- [ ] "Ik vertrouw dat mijn gegevens kloppen" (>85% testgebruikers)

**Technisch**:
- [ ] 0 data loss tijdens productie migratie
- [ ] <5 bugs in eerste week na release
- [ ] Backwards compatibility: oude API endpoints blijven 100% functioneel

**Business**:
- [ ] Geen toename in support tickets over "missing data"
- [ ] Afname in support tickets over "dubbele invoer"

---

## 9. OPEN VRAGEN

1. **Naamgeving**: `SharedContact` of `ContactPersoon` of `CentraalContact`?
   - Voorstel: `ContactPersoon` (duidelijkst voor Nederlands product)

2. **Scope grens**: Moeten Erfgenamen OOK via SharedContacts?
   - Pro: Volledige centralisatie, ultieme consistency
   - Con: Zeer complexe migratie, erfgenamen hebben unieke velden (percentage, legitimaire portie)
   - **Voorstel**: NIET in eerste versie, evalueer na Fase 3

3. **Multi-profiel contacten**: Wat als partner 1 en 2 dezelfde notaris hebben?
   - Huidige `Noodcontact.IsGedeeld` kan model zijn
   - SharedContact.EigenaarId → kan array worden?
   - **Voorstel**: Eerst single-profiel, multi-profiel in Fase 6 (toekomstig)

4. **Import/Export**: Hoe exporteren we SharedContacts in JSON/XML?
   - Aparte sectie of inline bij domein?
   - **Voorstel**: Beide – inline voor backwards compat, aparte sectie voor nieuwe clients

5. **Rechten/Privacy**: Wat als executeur toegang heeft tot profiel van overledene?
   - Mag executeur SharedContacts van overledene zien/bewerken?
   - **Voorstel**: Read-only voor executeurs, geen edit rechten

---

## 10. CONCLUSIE

**Dit is inderdaad een grote wijziging**, maar het is een **fundamentele verbetering** van de data architectuur die:

✅ **User experience** drastisch verbetert (vooral voor oudere gebruikers)  
✅ **Data integriteit** waarborgt (geen inconsistenties meer)  
✅ **Onderhoudbaarheid** vergroot (DRY principle)  
✅ **Toekomstige features** mogelijk maakt (bijv. contact import van Google/Outlook)

**Aanbeveling**: Go/No-Go beslissing na Fase 0 review met team.

**Geschatte effort**: 6-8 sprints (3-4 maanden) voor volledige implementatie.

**Alternative**: MVP aanpak – start met ALLEEN notaris (Fase 1-2), evalueer na 1 maand, besluit daarna over rest.

---

**Opgesteld door**: AI Assistant  
**Datum**: 5 maart 2026  
**Status**: Draft voor review  
**Next steps**: Team review + Go/No-Go beslissing
