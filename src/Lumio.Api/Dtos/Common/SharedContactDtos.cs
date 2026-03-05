using Lumio.Api.Domain.Common;

namespace Lumio.Api.Dtos.Common;

/// <summary>
/// Response DTO voor SharedContact entiteit
/// </summary>
public record SharedContactResponse
{
    public Guid Id { get; init; }
    public Guid EigenaarId { get; init; }
    public string Type { get; init; } = string.Empty;
    public string? SubType { get; init; }
    public string Naam { get; init; } = string.Empty;
    public string? Relatie { get; init; }
    public string? Telefoon { get; init; }
    public string? Email { get; init; }
    public string? Adres { get; init; }
    public string? Postcode { get; init; }
    public string? Woonplaats { get; init; }
    public string? BedrijfsNaam { get; init; }
    public string? Functie { get; init; }
    public string? Notities { get; init; }
    public bool IsGedeeld { get; init; }
    public DateTime AangemaaktOp { get; init; }
    public DateTime GewijzigdOp { get; init; }

    // Computed properties
    public string VolledigeNaam { get; init; } = string.Empty;
    public string VolledigAdres { get; init; } = string.Empty;

    public static SharedContactResponse FromEntity(SharedContact entity)
    {
        return new SharedContactResponse
        {
            Id = entity.Id,
            EigenaarId = entity.EigenaarId,
            Type = entity.Type.ToString(),
            SubType = entity.SubType,
            Naam = entity.Naam,
            Relatie = entity.Relatie,
            Telefoon = entity.Telefoon,
            Email = entity.Email,
            Adres = entity.Adres,
            Postcode = entity.Postcode,
            Woonplaats = entity.Woonplaats,
            BedrijfsNaam = entity.BedrijfsNaam,
            Functie = entity.Functie,
            Notities = entity.Notities,
            IsGedeeld = entity.IsGedeeld,
            AangemaaktOp = entity.AangemaaktOp,
            GewijzigdOp = entity.GewijzigdOp,
            VolledigeNaam = entity.VolledigeNaam,
            VolledigAdres = entity.VolledigAdres
        };
    }
}

/// <summary>
/// Request DTO voor aanmaken/wijzigen SharedContact
/// </summary>
public record SharedContactUpsertRequest
{
    public string Type { get; init; } = string.Empty;
    public string? SubType { get; init; }
    public string Naam { get; init; } = string.Empty;
    public string? Relatie { get; init; }
    public string? Telefoon { get; init; }
    public string? Email { get; init; }
    public string? Adres { get; init; }
    public string? Postcode { get; init; }
    public string? Woonplaats { get; init; }
    public string? BedrijfsNaam { get; init; }
    public string? Functie { get; init; }
    public string? Notities { get; init; }
    public bool IsGedeeld { get; init; }

    public SharedContact ToEntity(Guid eigenaarId)
    {
        if (!Enum.TryParse<ContactType>(Type, out var contactType))
        {
            throw new ArgumentException($"Ongeldig contact type: {Type}");
        }

        return new SharedContact
        {
            EigenaarId = eigenaarId,
            Type = contactType,
            SubType = SubType,
            Naam = Naam,
            Relatie = Relatie,
            Telefoon = Telefoon,
            Email = Email,
            Adres = Adres,
            Postcode = Postcode,
            Woonplaats = Woonplaats,
            BedrijfsNaam = BedrijfsNaam,
            Functie = Functie,
            Notities = Notities,
            IsGedeeld = IsGedeeld
        };
    }

    public void UpdateEntity(SharedContact entity)
    {
        if (!Enum.TryParse<ContactType>(Type, out var contactType))
        {
            throw new ArgumentException($"Ongeldig contact type: {Type}");
        }

        entity.Type = contactType;
        entity.SubType = SubType;
        entity.Naam = Naam;
        entity.Relatie = Relatie;
        entity.Telefoon = Telefoon;
        entity.Email = Email;
        entity.Adres = Adres;
        entity.Postcode = Postcode;
        entity.Woonplaats = Woonplaats;
        entity.BedrijfsNaam = BedrijfsNaam;
        entity.Functie = Functie;
        entity.Notities = Notities;
        entity.IsGedeeld = IsGedeeld;
        entity.GewijzigdOp = DateTime.UtcNow;
    }
}

/// <summary>
/// Simpele lijst item voor dropdowns/selecties
/// </summary>
public record SharedContactListItem
{
    public Guid Id { get; init; }
    public string Type { get; init; } = string.Empty;
    public string Naam { get; init; } = string.Empty;
    public string? BedrijfsNaam { get; init; }
    public string VolledigeNaam { get; init; } = string.Empty;

    public static SharedContactListItem FromEntity(SharedContact entity)
    {
        return new SharedContactListItem
        {
            Id = entity.Id,
            Type = entity.Type.ToString(),
            Naam = entity.Naam,
            BedrijfsNaam = entity.BedrijfsNaam,
            VolledigeNaam = entity.VolledigeNaam
        };
    }
}
