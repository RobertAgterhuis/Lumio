using Lumio.Api.Data;
using Lumio.Api.Rules.Configuration;
using Lumio.Api.Services.AssetRegistry;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Controllers;

/// <summary>
/// Temporary debug controller voor troubleshooting vehicle residual value calculation.
/// </summary>
[ApiController]
[Route("api/debug")]
public class DebugController : ControllerBase
{
    private readonly IVehicleResidualValueService _vehicleValueService;
    private readonly LumioRulesOptions _rules;
    private readonly LumioDbContext _db;

    public DebugController(
        IVehicleResidualValueService vehicleValueService,
        IOptions<LumioRulesOptions> rulesOptions,
        LumioDbContext db)
    {
        _vehicleValueService = vehicleValueService;
        _rules = rulesOptions.Value;
        _db = db;
    }

    [HttpGet("vehicle-residual-test")]
    public IActionResult TestVehicleResidual(
        [FromQuery] decimal estimatedValue = 27000,
        [FromQuery] int buildYear = 2017)
    {
        var currentYear = DateTime.UtcNow.Year;
        var vehicleAge = currentYear - buildYear;

        var residualValue = _vehicleValueService.CalculateResidualValue(estimatedValue, buildYear);

        var depreciationTable = _rules.Voertuig?.DepreciatieTabel;
        var applicableRow = depreciationTable?
            .FirstOrDefault(d => vehicleAge <= d.JarenMeeRekenen);

        return Ok(new
        {
            input = new { estimatedValue, buildYear },
            calculation = new
            {
                currentYear,
                vehicleAge,
                residualValue,
                applicableDepreciation = applicableRow != null
                    ? new
                    {
                        applicableRow.JarenMeeRekenen,
                        applicableRow.RestwaardeFractie,
                        applicableRow.Beschrijving
                    }
                    : null
            },
            configurationStatus = new
            {
                depreciationTableLoaded = depreciationTable != null,
                depreciationTableCount = depreciationTable?.Count ?? 0,
                allRows = depreciationTable?.Select(d => new
                {
                    d.JarenMeeRekenen,
                    d.RestwaardeFractie,
                    d.Beschrijving
                }).ToList()
            }
        });
    }

    /// <summary>
    /// Corrigeert alle RestWaarde velden in de database voor voertuigen op basis van de actuele depreciatietabel.
    /// Dit lost het probleem op waarbij oude, incorrecte RestWaarde waarden in de database staan.
    /// </summary>
    [HttpPost("fix-vehicle-residual-values")]
    public async Task<IActionResult> FixVehicleResidualValues()
    {
        var voertuigen = await _db.FysiekeBezittingen
            .Where(b => b.Categorie == "Voertuig")
            .ToListAsync();

        var updates = new List<object>();
        var errors = new List<object>();

        foreach (var voertuig in voertuigen)
        {
            var oldValue = voertuig.RestWaarde;
            var newValue = _vehicleValueService.CalculateResidualValue(
                voertuig.GeschatteWaarde ?? voertuig.CatalogusWaarde,
                voertuig.BouwJaar);

            if (oldValue != newValue)
            {
                voertuig.RestWaarde = newValue;

                updates.Add(new
                {
                    kenteken = voertuig.Kenteken,
                    merk = voertuig.Merk,
                    model = voertuig.Model,
                    bouwJaar = voertuig.BouwJaar,
                    geschatteWaarde = voertuig.GeschatteWaarde ?? voertuig.CatalogusWaarde,
                    oldRestWaarde = oldValue,
                    newRestWaarde = newValue,
                    verschil = (newValue ?? 0) - (oldValue ?? 0)
                });
            }
        }

        if (updates.Any())
        {
            await _db.SaveChangesAsync();
        }

        return Ok(new
        {
            message = "Database RestWaarde waarden gecorrigeerd",
            totalVehicles = voertuigen.Count,
            updatedVehicles = updates.Count,
            unchangedVehicles = voertuigen.Count - updates.Count,
            updates = updates,
            errors = errors
        });
    }
}
