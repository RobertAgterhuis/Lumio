using System.Text.Json;
using System.Text.Json.Nodes;
using Lumio.Api.Domain.Testament;
using Lumio.Api.Dtos.Testament;
using Lumio.Api.Repositories;
using Lumio.Api.Services;
using Mapster;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/v1/testament/snapshots")]
public class TestamentSnapshotsController : ControllerBase
{
    private readonly ITestamentSnapshotRepository _snapshots;
    private readonly ITestamentJuridischeCheckRepository _checkRepo;
    private readonly IAuditService _audit;
    private readonly IStringLocalizer<TestamentSnapshotsController> L;

    public TestamentSnapshotsController(
        ITestamentSnapshotRepository snapshots,
        ITestamentJuridischeCheckRepository checkRepo,
        IAuditService audit,
        IStringLocalizer<TestamentSnapshotsController> localizer)
    {
        _snapshots = snapshots;
        _checkRepo = checkRepo;
        _audit = audit;
        L = localizer;
    }

    [HttpGet]
    public async Task<ActionResult<List<TestamentSnapshotResponse>>> GetSnapshots()
    {
        var check = await _checkRepo.GetCheckDataAsync();
        if (check.Testament is null) return Ok(new List<TestamentSnapshotResponse>());

        var items = await _snapshots.GetAllAsync(check.Testament.Id);
        return Ok(items.Adapt<List<TestamentSnapshotResponse>>());
    }

    [HttpPost]
    public async Task<ActionResult<TestamentSnapshotResponse>> CreateSnapshot([FromBody] TestamentSnapshotCreateRequest request)
    {
        var check = await _checkRepo.GetCheckDataAsync();
        if (check.Testament is null) return BadRequest(new { error = "Maak eerst testament informatie aan." });

        var snapshotData = new
        {
            testament = check.Testament.Adapt<TestamentInfoResponse>(),
            begunstigden = check.Begunstigden.Adapt<List<BegunstigdeResponse>>(),
            executeurs = check.Executeurs.Adapt<List<ExecuteurResponse>>(),
        };

        var maxVersie = await _snapshots.GetMaxVersieAsync(check.Testament.Id);

        var snapshot = new TestamentSnapshot
        {
            TestamentInfoId = check.Testament.Id,
            Versie = maxVersie + 1,
            Notitie = request.Notitie,
            SnapshotJson = JsonSerializer.Serialize(snapshotData, new JsonSerializerOptions { WriteIndented = false }),
        };

        await _snapshots.AddAsync(snapshot);
        await _snapshots.CommitAsync();
        await _audit.LogAsync("Aangemaakt", "TestamentSnapshot", snapshot.Id);
        return Created($"/api/testament/snapshots/{snapshot.Id}", snapshot.Adapt<TestamentSnapshotResponse>());
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TestamentSnapshotDetailResponse>> GetSnapshot(Guid id)
    {
        var item = await _snapshots.FindByIdAsync(id);
        if (item is null) return NotFound();
        return Ok(item.Adapt<TestamentSnapshotDetailResponse>());
    }

    [HttpGet("vergelijk")]
    public async Task<ActionResult<TestamentVergelijkingResponse>> VergelijkSnapshots(
        [FromQuery] Guid versie1Id, [FromQuery] Guid versie2Id)
    {
        var snap1 = await _snapshots.FindByIdAsync(versie1Id);
        var snap2 = await _snapshots.FindByIdAsync(versie2Id);
        if (snap1 is null || snap2 is null) return NotFound();

        var json1 = JsonNode.Parse(snap1.SnapshotJson);
        var json2 = JsonNode.Parse(snap2.SnapshotJson);

        var verschillen = new List<TestamentVerschil>();

        if (json1?["testament"] is JsonObject t1 && json2?["testament"] is JsonObject t2)
        {
            var allKeys = new HashSet<string>(t1.Select(p => p.Key).Concat(t2.Select(p => p.Key)));
            foreach (var key in allKeys.OrderBy(k => k))
            {
                var v1 = t1[key]?.ToString();
                var v2 = t2[key]?.ToString();
                if (v1 != v2)
                {
                    verschillen.Add(new TestamentVerschil(key, v1, v2));
                }
            }
        }

        // S5-02: Compare begunstigden by naam+relatie key (not by position)
        var b1 = json1?["begunstigden"]?.AsArray();
        var b2 = json2?["begunstigden"]?.AsArray();
        var bCount1 = b1?.Count ?? 0;
        var bCount2 = b2?.Count ?? 0;
        if (bCount1 != bCount2)
        {
            verschillen.Add(new TestamentVerschil(L["NumberOfBeneficiaries"].Value, bCount1.ToString(), bCount2.ToString()));
        }

        static string BegKey(JsonNode? node) =>
            $"{node?["naam"]?.ToString() ?? ""}|{node?["relatie"]?.ToString() ?? ""}";

        var dict1 = new Dictionary<string, JsonNode?>();
        if (b1 is not null)
            foreach (var n in b1) { var k = BegKey(n); dict1.TryAdd(k, n); }

        var dict2 = new Dictionary<string, JsonNode?>();
        if (b2 is not null)
            foreach (var n in b2) { var k = BegKey(n); dict2.TryAdd(k, n); }

        var alleSleutels = new HashSet<string>(dict1.Keys.Concat(dict2.Keys));
        foreach (var key in alleSleutels.OrderBy(k => k))
        {
            var inB1 = dict1.TryGetValue(key, out var node1);
            var inB2 = dict2.TryGetValue(key, out var node2);
            var naam = key.Split('|')[0] is { Length: > 0 } n ? n : L["NoneValue"].Value;

            if (!inB1)
            {
                var pct2 = node2?["percentage"]?.ToString() ?? "—";
                var rel2 = node2?["relatie"]?.ToString() ?? "";
                verschillen.Add(new TestamentVerschil(
                    L["BeneficiaryLabel", naam].Value,
                    L["NoneValue"].Value,
                    $"{naam} ({rel2}) --- {pct2}%"));
            }
            else if (!inB2)
            {
                var pct1 = node1?["percentage"]?.ToString() ?? "—";
                var rel1 = node1?["relatie"]?.ToString() ?? "";
                verschillen.Add(new TestamentVerschil(
                    L["BeneficiaryLabel", naam].Value,
                    $"{naam} ({rel1}) --- {pct1}%",
                    L["NoneValue"].Value));
            }
            else
            {
                var pct1 = node1?["percentage"]?.ToString() ?? "—";
                var pct2 = node2?["percentage"]?.ToString() ?? "—";
                var rel1 = node1?["relatie"]?.ToString() ?? "";
                var rel2 = node2?["relatie"]?.ToString() ?? "";
                if (pct1 != pct2 || rel1 != rel2)
                {
                    verschillen.Add(new TestamentVerschil(
                        L["BeneficiaryLabel", naam].Value,
                        $"{naam} ({rel1}) --- {pct1}%",
                        $"{naam} ({rel2}) --- {pct2}%"));
                }
            }
        }

        return Ok(new TestamentVergelijkingResponse(
            snap1.Adapt<TestamentSnapshotDetailResponse>(),
            snap2.Adapt<TestamentSnapshotDetailResponse>(),
            verschillen));
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteSnapshot(Guid id)
    {
        var item = await _snapshots.FindByIdAsync(id);
        if (item is null) return NotFound();

        await _snapshots.RemoveAsync(item);
        await _snapshots.CommitAsync();
        await _audit.LogAsync("Verwijderd", "TestamentSnapshot", id);
        return NoContent();
    }
}
