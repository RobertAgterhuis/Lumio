using System.ComponentModel.DataAnnotations;

namespace Lumio.Api.Dtos.Backup;

/// <summary>Multipart form model for POST /api/v1/backup/restore.</summary>
/// <remarks>
///   Wrapper class required so Swashbuckle can generate the IFormFile schema.
///   Naked [FromForm] IFormFile parameters alongside other [FromForm] string
///   parameters cause SwaggerGeneratorException in Swashbuckle 10+.
/// </remarks>
public class RestoreBackupRequest
{
    [Required]
    public string Wachtwoord { get; set; } = string.Empty;

    [Required]
    public IFormFile Bestand { get; set; } = null!;
}
