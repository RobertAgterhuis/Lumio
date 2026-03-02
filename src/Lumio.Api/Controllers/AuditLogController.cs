using Lumio.Api.Data;
using Lumio.Api.Domain.Common;
using Lumio.Api.Rules.Configuration;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/v1/audit-log")]
public class AuditLogController : ControllerBase
{
    private readonly LumioDbContext _db;
    private readonly LimietenOptions _limieten;

    public AuditLogController(LumioDbContext db, IOptions<LimietenOptions> limieten)
    {
        _db = db;
        _limieten = limieten.Value;
    }

    [HttpGet]
    public async Task<ActionResult<AuditLogPagedResult>> GetAll(
        [FromQuery] int? limit,
        [FromQuery] string? actie,
        [FromQuery] string? entityType,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] DateTime? before)
    {
        var query = _db.AuditLog.AsQueryable();

        if (!string.IsNullOrWhiteSpace(actie))
            query = query.Where(a => a.Actie == actie);

        if (!string.IsNullOrWhiteSpace(entityType))
            query = query.Where(a => a.EntityType == entityType);

        if (from.HasValue)
            query = query.Where(a => a.Tijdstip >= from.Value.ToUniversalTime());

        if (to.HasValue)
            query = query.Where(a => a.Tijdstip <= to.Value.ToUniversalTime());

        // Cursor-based pagination: load entries before this timestamp
        if (before.HasValue)
            query = query.Where(a => a.Tijdstip < before.Value.ToUniversalTime());

        query = query.OrderByDescending(a => a.Tijdstip);

        var effectiveLimit = (limit.HasValue && limit.Value > 0)
            ? Math.Min(limit.Value, 200)
            : 50;

        // Fetch one extra to detect whether more entries exist
        var raw = await query.Take(effectiveLimit + 1).Select(a => new AuditLogDto
        {
            Id = a.Id,
            Tijdstip = a.Tijdstip,
            Actie = a.Actie,
            EntityType = a.EntityType,
            EntityId = a.EntityId,
            Details = a.Details
        }).ToListAsync();

        var heeftMeer = raw.Count > effectiveLimit;
        var items = heeftMeer ? raw.Take(effectiveLimit).ToList() : raw;

        return Ok(new AuditLogPagedResult { Items = items, HeeftMeer = heeftMeer });
    }

    /// <summary>
    /// Handmatig een audit-log entry maken (bijv. voor ontgrendelen/vergrendelen/export).
    /// </summary>
    [HttpPost]
    public async Task<ActionResult> LogActie([FromBody] AuditLogCreateDto dto)
    {
        _db.AuditLog.Add(new AuditLogEntry
        {
            Actie = dto.Actie,
            EntityType = dto.EntityType,
            EntityId = dto.EntityId,
            Details = dto.Details
        });
        await _db.SaveChangesAsync();
        return NoContent();
    }
}

public class AuditLogPagedResult
{
    public List<AuditLogDto> Items { get; set; } = new();
    public bool HeeftMeer { get; set; }
}

public class AuditLogDto
{
    public Guid Id { get; set; }
    public DateTime Tijdstip { get; set; }
    public string Actie { get; set; } = string.Empty;
    public string? EntityType { get; set; }
    public Guid? EntityId { get; set; }
    public string? Details { get; set; }
}

public class AuditLogCreateDto
{
    public string Actie { get; set; } = string.Empty;
    public string? EntityType { get; set; }
    public Guid? EntityId { get; set; }
    public string? Details { get; set; }
}
