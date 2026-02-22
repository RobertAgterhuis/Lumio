using Lumio.Api.Data;
using Lumio.Api.Domain.Common;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/audit-log")]
public class AuditLogController : ControllerBase
{
    private readonly LumioDbContext _db;

    public AuditLogController(LumioDbContext db) => _db = db;

    [HttpGet]
    public async Task<ActionResult<List<AuditLogDto>>> GetAll(
        [FromQuery] int? limit,
        [FromQuery] string? actie,
        [FromQuery] string? entityType)
    {
        var query = _db.AuditLog.AsQueryable();

        if (!string.IsNullOrWhiteSpace(actie))
            query = query.Where(a => a.Actie == actie);

        if (!string.IsNullOrWhiteSpace(entityType))
            query = query.Where(a => a.EntityType == entityType);

        query = query.OrderByDescending(a => a.Tijdstip);

        if (limit.HasValue && limit.Value > 0)
            query = query.Take(limit.Value);
        else
            query = query.Take(200);

        var items = await query.Select(a => new AuditLogDto
        {
            Id = a.Id,
            Tijdstip = a.Tijdstip,
            Actie = a.Actie,
            EntityType = a.EntityType,
            EntityId = a.EntityId,
            Details = a.Details
        }).ToListAsync();

        return Ok(items);
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
