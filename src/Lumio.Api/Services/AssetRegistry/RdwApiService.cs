using Lumio.Api.Dtos.AssetRegistry;
using Microsoft.Extensions.Logging;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Globalization;

namespace Lumio.Api.Services.AssetRegistry;

/// <summary>
/// Service voor het opzoeken van voertuiggegevens via RDW OpenAPI.
/// Officiële API: https://opendata.rdw.nl/
/// Inclusief OVI (Officiële Verkoopwaarde Index) voor cataloguswaarde.
/// </summary>
public interface IRdwApiService
{
    /// <summary>
    /// Zoek voertuiggegevens op basis van kenteken (nummerbord).
    /// Inclusief RDW voertuigspecs en OVI cataloguswaarde als beschikbaar.
    /// </summary>
    /// <param name="kenteken">Nummerbord (bv. "1ABC23").</param>
    /// <returns>Voertuiggegevens (specs + cataloguswaarde) of null als niet gevonden.</returns>
    Task<VoertuigGegevens?> LookupByKentekenAsync(string kenteken, CancellationToken cancellationToken = default);
}

/// <summary>
/// Response DTO van RDW OpenAPI voor voertuiggegevens.
/// Compleet voertuig-profiel voor erfenis administratie + waarde berekening.
/// Alle velden optioneel omdat RDW niet altijd alles invult per voertuig.
/// </summary>
public record VoertuigGegevens(
    // Basis identificatie
    string Merk,                    // Fabrikant (bijv. "TOYOTA")
    string Model,                   // Model/Handelsbenaming (bijv. "AURIS")
    int BouwJaar,                   // Bouwjaar (bijv. 2020)

    // Voertuig classificatie
    string? Klasse,                 // Voertuigklasse (bijv. "Personenauto", "Bestelwagen")
    string? Brandstof,              // Brandstofsoort (bijv. "Benzine", "Diesel", "Elektriciteit")
    string? Inrichting,             // Inrichting (bijv. "overige voertuigen")

    // Motorspecificaties
    int? Vermogen,                  // Vermogen in kW (netto)
    int? AantalCilinders,           // Aantal cilinders
    int? CilinderInhoud,            // Cilinderinhoud in cc

    // Fysieke afmetingen & gewicht
    decimal? Lengte,                // Lengte in millimeters
    decimal? Breedte,               // Breedte in millimeters
    decimal? Hoogte,                // Hoogte in millimeters
    decimal? MassaRijklaar,         // Massa rijklaar in kg (voor verzekering)
    decimal? MassaLedigGewicht,     // Massa leeg gewicht in kg

    // Capaciteit
    int? AantalZitplaatsen,         // Aantal plaatsen

    // Styling
    string? Kleur,                  // Kleur (bijv. "wit", "zwart")

    // Transmissie & handling
    string? Transmissie,            // Handeling/transmissietype (bijv. "automatisch")

    // Uitvoering details
    string? Uitvoering,             // Uitvoeringcode
    string? TypegoedkeuringNummer,  // Typegoedkeuringnummer (technisch goedkeuringnummer)

    // OVI (Officiële Verkoopwaarde Index) - RDW cataloguswaarde
    decimal? CatalogusWaarde        // Cataloguswaarde in € (voor waardeberekening erfgoedstelling)
);

/// <summary>
/// Production implementation: hits real RDW OpenAPI endpoint.
/// Falls back to sensible defaults if API is unavailable (offline-first).
/// </summary>
public class RdwApiService : IRdwApiService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<RdwApiService> _logger;
    private readonly IConfiguration _configuration;
    private readonly string _rdwBaseUrl;
    private readonly string _resourceId;

    public RdwApiService(HttpClient httpClient, ILogger<RdwApiService> logger, IConfiguration configuration)
    {
        _httpClient = httpClient;
        _logger = logger;
        _configuration = configuration;

        // Read from appsettings, fallback to defaults for offline use
        _rdwBaseUrl = _configuration["RdwApi:BaseUrl"] ?? "https://opendata.rdw.nl/api/v3/views";
        _resourceId = _configuration["RdwApi:ResourceId"] ?? "m9d7-ebf2";
    }

    public async Task<VoertuigGegevens?> LookupByKentekenAsync(string kenteken, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(kenteken))
            return null;

        try
        {
            // Normalize: remove spaces and hyphens, convert to caps
            var normalized = kenteken.Replace(" ", "").Replace("-", "").ToUpperInvariant();

            // RDW stores kenteken WITHOUT hyphens in database (e.g., "NS840G" not "NS-840-G")
            // Use normalized format directly for the query

            // RDW API v3 (Socrata) uses SoQL — must POST with JSON query body, not GET with URL params
            var url = $"{_rdwBaseUrl}/{_resourceId}/query.json";
            var soqlQuery = $"SELECT * WHERE kenteken = '{normalized}' LIMIT 1";
            var requestBody = new { query = soqlQuery };
            var jsonContent = System.Text.Json.JsonSerializer.Serialize(requestBody);
            var content = new StringContent(jsonContent, System.Text.Encoding.UTF8, "application/json");

            _logger.LogInformation("RDW API v3 SoQL lookup for kenteken {Kenteken} (normalized: {Normalized}): {Query}",
                kenteken, normalized, soqlQuery);

            var response = await _httpClient.PostAsync(url, content, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync(cancellationToken);
                _logger.LogWarning("RDW API returned {StatusCode} for kenteken {Kenteken} (normalized: {Normalized}). Response: {ErrorContent}",
                    response.StatusCode, kenteken, normalized, errorContent);
                return null;
            }

            var json = await response.Content.ReadAsStringAsync(cancellationToken);
            var results = System.Text.Json.JsonSerializer.Deserialize<List<RdwApiResponse>>(json);

            if (results is null || results.Count == 0)
            {
                _logger.LogInformation("RDW API: no results for kenteken {Kenteken} (normalized: {Normalized})", kenteken, normalized);
                return null;
            }

            var first = results[0];
            var buildYear = ResolveBuildYear(first);
            return new VoertuigGegevens(
                // Basis identificatie
                Merk: first.Merk ?? "Onbekend",
                Model: first.Handelsbenaming ?? "Onbekend",
                BouwJaar: buildYear,

                // Voertuig classificatie
                Klasse: first.VoertuigClass,
                Brandstof: first.Brandstof,
                Inrichting: first.Inrichting,

                // Motorspecificaties
                Vermogen: first.Vermogen,
                AantalCilinders: first.AantalCilinders,
                CilinderInhoud: first.CilinderInhoud,

                // Fysieke afmetingen & gewicht
                Lengte: first.Lengte,
                Breedte: first.Breedte,
                Hoogte: first.Hoogte,
                MassaRijklaar: first.MassaRijklaar,
                MassaLedigGewicht: first.MassaLedigGewicht,

                // Capaciteit
                AantalZitplaatsen: first.AantalZitplaatsen,

                // Styling
                Kleur: first.Kleur,

                // Transmissie & handling
                Transmissie: first.Transmissie,

                // Uitvoering details
                Uitvoering: first.Uitvoering,
                TypegoedkeuringNummer: first.TypegoedkeuringNummer,

                // OVI (Cataloguswaarde) - TODO: implement OVI lookup via RDW OVI dataset
                CatalogusWaarde: null  // Will be populated via OVI lookup when available
            );
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "RDW API lookup failed for kenteken {Kenteken}", kenteken);
            return null; // Offline-first: gracefully return null instead of throwing
        }
    }

    /// <summary>
    /// Internal DTO for RDW API response parsing.
    /// Mapped from RDW OpenAPI fields.
    /// </summary>
    private class RdwApiResponse
    {
        // Basis identificatie
        [JsonPropertyName("merk")]
        public string? Merk { get; set; }

        [JsonPropertyName("handelsbenaming")]
        public string? Handelsbenaming { get; set; }

        [JsonPropertyName("bouwjaar")]
        [JsonConverter(typeof(StringToNullableIntConverter))]
        public int? Bouwjaar { get; set; }

        [JsonPropertyName("datum_eerste_toelating")]
        public string? DatumEersteToelating { get; set; }

        [JsonPropertyName("datum_tenaamstelling")]
        public string? DatumTenaamstelling { get; set; }

        // Voertuig classificatie
        [JsonPropertyName("voertuigklasse")]
        public string? VoertuigClass { get; set; }

        [JsonPropertyName("brandstof")]
        public string? Brandstof { get; set; }

        [JsonPropertyName("inrichting")]
        public string? Inrichting { get; set; }

        // Motorspecificaties
        [JsonPropertyName("vermogen")]
        [JsonConverter(typeof(StringToNullableIntConverter))]
        public int? Vermogen { get; set; }

        [JsonPropertyName("aantal_cilinders")]
        [JsonConverter(typeof(StringToNullableIntConverter))]
        public int? AantalCilinders { get; set; }

        [JsonPropertyName("cilinderinhoud")]
        [JsonConverter(typeof(StringToNullableIntConverter))]
        public int? CilinderInhoud { get; set; }

        // Fysieke afmetingen & gewicht
        [JsonPropertyName("lengte")]
        [JsonConverter(typeof(StringToNullableDecimalConverter))]
        public decimal? Lengte { get; set; }

        [JsonPropertyName("breedte")]
        [JsonConverter(typeof(StringToNullableDecimalConverter))]
        public decimal? Breedte { get; set; }

        [JsonPropertyName("hoogte")]
        [JsonConverter(typeof(StringToNullableDecimalConverter))]
        public decimal? Hoogte { get; set; }

        [JsonPropertyName("massa_rijklaar")]
        [JsonConverter(typeof(StringToNullableDecimalConverter))]
        public decimal? MassaRijklaar { get; set; }

        [JsonPropertyName("massa_ledig_gewicht")]
        [JsonConverter(typeof(StringToNullableDecimalConverter))]
        public decimal? MassaLedigGewicht { get; set; }

        // Capaciteit
        [JsonPropertyName("aantal_zitplaatsen")]
        [JsonConverter(typeof(StringToNullableIntConverter))]
        public int? AantalZitplaatsen { get; set; }

        // Styling
        [JsonPropertyName("kleur")]
        public string? Kleur { get; set; }

        // Transmissie & handling
        [JsonPropertyName("handeling")]
        public string? Transmissie { get; set; }

        // Uitvoering details
        [JsonPropertyName("uitvoering")]
        public string? Uitvoering { get; set; }

        [JsonPropertyName("typegoedkeuringnummer")]
        public string? TypegoedkeuringNummer { get; set; }
    }

    /// <summary>
    /// Custom JSON converter: handles RDW API inconsistency where numeric fields sometimes come back as strings.
    /// Converts string "5" → int 5, or handles null/empty gracefully.
    /// </summary>
    private class StringToNullableIntConverter : JsonConverter<int?>
    {
        public override int? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            return reader.TokenType switch
            {
                JsonTokenType.Null => null,
                JsonTokenType.Number => reader.GetInt32(),
                JsonTokenType.String => int.TryParse(reader.GetString(), out var value) ? value : null,
                _ => null
            };
        }

        public override void Write(Utf8JsonWriter writer, int? value, JsonSerializerOptions options)
        {
            if (value.HasValue)
                writer.WriteNumberValue(value.Value);
            else
                writer.WriteNullValue();
        }
    }

    /// <summary>
    /// Custom JSON converter: handles RDW API inconsistency where decimal fields come back as strings.
    /// Converts string "1234.56" → decimal 1234.56, or handles null/empty gracefully.
    /// </summary>
    private class StringToNullableDecimalConverter : JsonConverter<decimal?>
    {
        public override decimal? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
        {
            return reader.TokenType switch
            {
                JsonTokenType.Null => null,
                JsonTokenType.Number => reader.GetDecimal(),
                JsonTokenType.String => TryParseDecimal(reader.GetString()),
                _ => null
            };
        }

        public override void Write(Utf8JsonWriter writer, decimal? value, JsonSerializerOptions options)
        {
            if (value.HasValue)
                writer.WriteNumberValue(value.Value);
            else
                writer.WriteNullValue();
        }

        private static decimal? TryParseDecimal(string? input)
        {
            if (string.IsNullOrWhiteSpace(input))
                return null;

            if (decimal.TryParse(input, NumberStyles.Number, CultureInfo.InvariantCulture, out var invariantValue))
                return invariantValue;

            if (decimal.TryParse(input, NumberStyles.Number, CultureInfo.CurrentCulture, out var currentValue))
                return currentValue;

            return null;
        }
    }

    private static int ResolveBuildYear(RdwApiResponse first)
    {
        var currentYear = DateTime.UtcNow.Year;

        if (IsValidBuildYear(first.Bouwjaar, currentYear))
            return first.Bouwjaar!.Value;

        var fromFirstRegistration = TryExtractYear(first.DatumEersteToelating);
        if (IsValidBuildYear(fromFirstRegistration, currentYear))
            return fromFirstRegistration!.Value;

        var fromTitleDate = TryExtractYear(first.DatumTenaamstelling);
        if (IsValidBuildYear(fromTitleDate, currentYear))
            return fromTitleDate!.Value;

        return 0;
    }

    private static int? TryExtractYear(string? rdwDate)
    {
        if (string.IsNullOrWhiteSpace(rdwDate))
            return null;

        var digits = new string(rdwDate.Where(char.IsDigit).ToArray());
        if (digits.Length < 4)
            return null;

        return int.TryParse(digits[..4], out var year) ? year : null;
    }

    private static bool IsValidBuildYear(int? year, int currentYear)
    {
        if (!year.HasValue)
            return false;

        return year.Value >= 1886 && year.Value <= currentYear;
    }

    /// <summary>
    /// Format kenteken to RDW standard format.
    /// Converts "NS840G" → "NS-840-G" (2 letters, dash, 3 alphanumeric, dash, 1 letter).
    /// </summary>
    private static string FormatKentekenForRdw(string kenteken)
    {
        if (string.IsNullOrEmpty(kenteken) || kenteken.Length < 6)
            return kenteken;

        // Dutch license plate format: AA-BBB-C (positions 0-1, 2-4, 5)
        // Examples: "NS-840-G" from "NS840G", "1A-BC2-X" from "1ABC2X"
        return $"{kenteken[0]}{kenteken[1]}-{kenteken[2]}{kenteken[3]}{kenteken[4]}-{kenteken[5]}";
    }
}

/// <summary>
/// Mock implementation voor development/testing.
/// Returns canned responses baseerd op kenteken pattern.
/// </summary>
public class RdwApiServiceMock : IRdwApiService
{
    private readonly ILogger<RdwApiServiceMock> _logger;

    public RdwApiServiceMock(ILogger<RdwApiServiceMock> logger)
    {
        _logger = logger;
    }

    public Task<VoertuigGegevens?> LookupByKentekenAsync(string kenteken, CancellationToken cancellationToken = default)
    {
        _logger.LogInformation("RDW Mock lookup for kenteken {Kenteken}", kenteken);

        // Return canned responses based on test patterns
        // Support both with/without hyphens: "NS840G" and "NS-840-G"
        var normalized = kenteken?.ToUpperInvariant().Replace("-", "").Replace(" ", "") ?? "";
        var result = normalized switch
        {
            "NS840G" => new VoertuigGegevens(
                Merk: "Volvo",
                Model: "XC60",
                BouwJaar: 2019,
                Klasse: "Personenauto",
                Brandstof: "Benzine",
                Inrichting: null,
                Vermogen: 190,
                AantalCilinders: 4,
                CilinderInhoud: 1969,
                Lengte: 4625,
                Breedte: 2108,
                Hoogte: 1658,
                MassaRijklaar: 1713m,
                MassaLedigGewicht: 1614m,
                AantalZitplaatsen: 5,
                Kleur: "Wit",
                Transmissie: "Automatisch",
                Uitvoering: null,
                TypegoedkeuringNummer: null,
                CatalogusWaarde: 24500m  // 2019 Volvo XC60 OVI waarde
            ),
            "1ABC23" => new VoertuigGegevens(
                Merk: "Tesla",
                Model: "Model 3",
                BouwJaar: 2023,
                Klasse: "Personenauto",
                Brandstof: "Elektriciteit",
                Inrichting: null,
                Vermogen: 346,
                AantalCilinders: null,
                CilinderInhoud: null,
                Lengte: 4694,
                Breedte: 1849,
                Hoogte: 1443,
                MassaRijklaar: 1611m,
                MassaLedigGewicht: 1509m,
                AantalZitplaatsen: 5,
                Kleur: "Zwart",
                Transmissie: "Automatisch",
                Uitvoering: null,
                TypegoedkeuringNummer: null,
                CatalogusWaarde: 38700m  // 2023 Tesla Model 3 OVI waarde
            ),
            "2DEF24" => new VoertuigGegevens(
                Merk: "Volkswagen",
                Model: "Golf 8",
                BouwJaar: 2022,
                Klasse: "Personenauto",
                Brandstof: "Benzine",
                Inrichting: null,
                Vermogen: 130,
                AantalCilinders: 4,
                CilinderInhoud: 1498,
                Lengte: 4284,
                Breedte: 1799,
                Hoogte: 1452,
                MassaRijklaar: 1279m,
                MassaLedigGewicht: 1195m,
                AantalZitplaatsen: 5,
                Kleur: "Grijs",
                Transmissie: "Manueel",
                Uitvoering: null,
                TypegoedkeuringNummer: null,
                CatalogusWaarde: 18900m  // 2022 VW Golf 8 OVI waarde
            ),
            "3GHI20" => new VoertuigGegevens(
                Merk: "BMW",
                Model: "5 Serie",
                BouwJaar: 2020,
                Klasse: "Personenauto",
                Brandstof: "Diesel",
                Inrichting: null,
                Vermogen: 265,
                AantalCilinders: 6,
                CilinderInhoud: 2993,
                Lengte: 4945,
                Breedte: 1868,
                Hoogte: 1500,
                MassaRijklaar: 1645m,
                MassaLedigGewicht: 1565m,
                AantalZitplaatsen: 5,
                Kleur: "Blauw",
                Transmissie: "Automatisch",
                Uitvoering: null,
                TypegoedkeuringNummer: null,
                CatalogusWaarde: 32400m  // 2020 BMW 5-serie OVI waarde
            ),
            "NOTFOUND" => null, // Simulate not found
            _ => null // Unknown kenteken in mock
        };

        return Task.FromResult(result);
    }
}
