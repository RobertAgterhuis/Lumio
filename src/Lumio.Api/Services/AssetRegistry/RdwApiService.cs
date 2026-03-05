using Lumio.Api.Dtos.AssetRegistry;
using Microsoft.Extensions.Logging;
using System.Text.Json.Serialization;

namespace Lumio.Api.Services.AssetRegistry;

/// <summary>
/// Service voor het opzoeken van voertuiggegevens via RDW OpenAPI.
/// Officiële API: https://opendata.rdw.nl/
/// </summary>
public interface IRdwApiService
{
    /// <summary>
    /// Zoek voertuiggegevens op basis van kenteken (nummerbord).
    /// </summary>
    /// <param name="kenteken">Nummerbord (bv. "1ABC23").</param>
    /// <returns>Voertuiggegevens (merk, model, bouwjaar) of null als niet gevonden.</returns>
    Task<VoertuigGegevens?> LookupByKentekenAsync(string kenteken, CancellationToken cancellationToken = default);
}

/// <summary>
/// Response DTO van RDW OpenAPI voor voertuiggegevens.
/// Bevat essentiële info voor depreciatieberekening + display.
/// </summary>
public record VoertuigGegevens(
    string Merk,        // Model brand
    string Model,       // Model name
    int BouwJaar,       // Year of manufacture
    string? Klasse,     // Vehicle class (optioneel)
    string? Brandstof   // Fuel type (optioneel)
);

/// <summary>
/// Production implementation: hits real RDW OpenAPI endpoint.
/// Falls back to sensible defaults if API is unavailable (offline-first).
/// </summary>
public class RdwApiService : IRdwApiService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<RdwApiService> _logger;
    
    // RDW OpenAPI base — public open data, no auth required
    private const string RdwBaseUrl = "https://opendata.rdw.nl/api/v1";
    private const string ResourceId = "m9d6-ebf6"; // API resource ID for voertuigregistratie
    
    public RdwApiService(HttpClient httpClient, ILogger<RdwApiService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
    }

    public async Task<VoertuigGegevens?> LookupByKentekenAsync(string kenteken, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(kenteken))
            return null;

        try
        {
            // Normalize: remove spaces, convert to caps
            var normalizedKenteken = kenteken.Replace(" ", "").ToUpperInvariant();
            
            // RDW API query: fetch voertuig with this kenteken
            var query = $"?$where=kenteken='{normalizedKenteken}'&$limit=1";
            var url = $"{RdwBaseUrl}/resources/{ResourceId}.json{query}";
            
            _logger.LogInformation("RDW API lookup: {Url}", url);
            
            var response = await _httpClient.GetAsync(url, cancellationToken);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogWarning("RDW API returned {StatusCode} for kenteken {Kenteken}", 
                    response.StatusCode, normalizedKenteken);
                return null;
            }

            var json = await response.Content.ReadAsStringAsync(cancellationToken);
            var results = System.Text.Json.JsonSerializer.Deserialize<List<RdwApiResponse>>(json);
            
            if (results is null || results.Count == 0)
            {
                _logger.LogInformation("RDW API: no results for kenteken {Kenteken}", normalizedKenteken);
                return null;
            }

            var first = results[0];
            return new VoertuigGegevens(
                Merk: first.Merk ?? "Onbekend",
                Model: first.Handelsbenaming ?? "Onbekend",
                BouwJaar: first.Bouwjaar ?? DateTime.Now.Year,
                Klasse: first.VoertuigClass,
                Brandstof: first.Brandstof
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
        [JsonPropertyName("merk")]
        public string? Merk { get; set; }

        [JsonPropertyName("handelsbenaming")]
        public string? Handelsbenaming { get; set; }

        [JsonPropertyName("bouwjaar")]
        public int? Bouwjaar { get; set; }

        [JsonPropertyName("voertuigklasse")]
        public string? VoertuigClass { get; set; }

        [JsonPropertyName("brandstof")]
        public string? Brandstof { get; set; }
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
        var result = kenteken?.ToUpperInvariant() switch
        {
            "1ABC23" => new VoertuigGegevens(
                Merk: "Tesla",
                Model: "Model 3",
                BouwJaar: 2023,
                Klasse: "Personenauto",
                Brandstof: "Elektriciteit"
            ),
            "2DEF24" => new VoertuigGegevens(
                Merk: "Volkswagen",
                Model: "Golf 8",
                BouwJaar: 2022,
                Klasse: "Personenauto",
                Brandstof: "Benzine"
            ),
            "3GHI20" => new VoertuigGegevens(
                Merk: "BMW",
                Model: "5 Serie",
                BouwJaar: 2020,
                Klasse: "Personenauto",
                Brandstof: "Diesel"
            ),
            "NOTFOUND" => null, // Simulate not found
            _ => null // Unknown kenteken in mock
        };

        return Task.FromResult(result);
    }
}
