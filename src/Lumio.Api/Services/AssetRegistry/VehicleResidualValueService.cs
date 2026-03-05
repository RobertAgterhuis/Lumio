using Lumio.Api.Rules.Configuration;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Services.AssetRegistry;

/// <summary>
/// Service voor berekening restwaarde voertuigen op basis van bouwjaar en marktconforme depreciatietabel.
/// Gebruikt depreciatiefracties uit lumio-rules.json > voertuig > depreciatieTabel.
/// </summary>
public interface IVehicleResidualValueService
{
    /// <summary>
    /// Bereken de restwaarde van een voertuig op basis van geschatte waarde, bouwjaar en marktconforme depreciatietabel.
    /// </summary>
    /// <param name="estimatedValue">Geschatte waarde van het voertuig</param>
    /// <param name="buildYear">Bouwjaar van het voertuig</param>
    /// <returns>Restwaarde (null als bouwjaar ontbreekt)</returns>
    decimal? CalculateResidualValue(decimal? estimatedValue, int? buildYear);
}

public class VehicleResidualValueService : IVehicleResidualValueService
{
    private readonly LumioRulesOptions _rules;

    public VehicleResidualValueService(IOptions<LumioRulesOptions> rulesOptions)
    {
        _rules = rulesOptions.Value;
    }

    /// <summary>
    /// Bereken restwaarde via depreciatietabel lookupprocedure:
    /// 1. Bepaal voertuigleeftijd (huidige jaar - bouwjaar)
    /// 2. Find depreciatiepercentage in tabel where jarenMeeRekenen >= leeftijd
    /// 3. RestWaarde = GeschatteWaarde × restwaardeFractie
    /// </summary>
    public decimal? CalculateResidualValue(decimal? estimatedValue, int? buildYear)
    {
        if (!estimatedValue.HasValue || estimatedValue <= 0 || !buildYear.HasValue)
            return null;

        // Haal depreciatietabel uit rules
        var depreciationTable = _rules.Voertuig?.DepreciatieTabel;
        if (depreciationTable == null || depreciationTable.Count == 0)
            return estimatedValue; // Fallback: geen depreciatie

        int vehicleAge = DateTime.Now.Year - buildYear.Value;

        // Vind het juiste depreciatiepercentage: eerste entry waar jarenMeeRekenen >= vehicleAge
        var applicableRow = depreciationTable
            .FirstOrDefault(d => vehicleAge <= d.JarenMeeRekenen);

        // Fallback: als voertuig ouder is dan het grootste getal in tabel, use kleinste percentage
        applicableRow ??= depreciationTable.OrderBy(d => d.RestwaardeFractie).First();

        decimal residualValue = estimatedValue.Value * applicableRow.RestwaardeFractie;
        return Math.Round(residualValue, 2);
    }
}

/// <summary>
/// (Binding class for lumio-rules.json > voertuig section)
/// </summary>
public class VoertuigRules
{
    public List<DepreciationTableRow> DepreciatieTabel { get; set; } = new();
    public string Disclaimer { get; set; } = "";
}

public class DepreciationTableRow
{
    public int JarenMeeRekenen { get; set; }
    public decimal RestwaardeFractie { get; set; }
    public string Beschrijving { get; set; } = "";
}
