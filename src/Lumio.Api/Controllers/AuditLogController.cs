using Lumio.Api.Domain.Common;
using Lumio.Api.Repositories;
using Lumio.Api.Rules.Configuration;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/v1/audit-log")]
public class AuditLogController : ControllerBase
{
    private readonly IAuditLogRepository _repo;
    private readonly LimietenOptions _limieten;

    public AuditLogController(IAuditLogRepository repo, IOptions<LimietenOptions> limieten)
    {
        _repo = repo;
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
        var effectiveLimit = (limit.HasValue && limit.Value > 0)
            ? Math.Min(limit.Value, 200)
            : 50;

        var (items, heeftMeer) = await _repo.GetPagedAsync(effectiveLimit, actie, entityType, from, to, before);

        return Ok(new AuditLogPagedResult
        {
            Items = items.Select(a => new AuditLogDto
            {
                Id         = a.Id,
                Tijdstip   = a.Tijdstip,
                Actie      = a.Actie,
                EntityType = a.EntityType,
                EntityId   = a.EntityId,
                Details    = a.Details,
            }).ToList(),
            HeeftMeer = heeftMeer,
        });
    }

    [HttpPost]
    public async Task<ActionResult> LogActie([FromBody] AuditLogCreateDto dto)
    {
        await _repo.AddAsync(new AuditLogEntry
        {
            Actie      = dto.Actie,
            EntityType = dto.EntityType,
            EntityId   = dto.EntityId,
            Details    = dto.Details,
        });
        await _repo.CommitAsync();
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
