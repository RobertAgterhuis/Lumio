namespace Lumio.Api.Domain.Common;

public abstract class BaseEntity
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public DateTime AangemaaktOp { get; set; } = DateTime.UtcNow;
    public DateTime GewijzigdOp { get; set; } = DateTime.UtcNow;
}
