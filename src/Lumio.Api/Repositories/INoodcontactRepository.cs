using Lumio.Api.Domain.Common;

namespace Lumio.Api.Repositories;

/// <summary>
/// Repository interface for <see cref="Noodcontact"/>.
/// Introduced in SP-13-003 — Application Layer fase 2.
/// </summary>
public interface INoodcontactRepository
{
    /// <summary>All noodcontacten ordered by name.</summary>
    Task<List<Noodcontact>> GetAllByNameAsync();

    /// <summary>Find a noodcontact by ID, or <c>null</c>.</summary>
    Task<Noodcontact?> FindByIdAsync(Guid id);

    /// <summary>All noodcontacten marked as gedeeld, ordered by name (for export).</summary>
    Task<List<Noodcontact>> GetGedeeldByNameAsync();

    /// <summary>Stage a noodcontact for insertion (does not save).</summary>
    Task AddAsync(Noodcontact noodcontact);

    /// <summary>Remove a noodcontact (does not save).</summary>
    Task RemoveAsync(Noodcontact noodcontact);

    /// <summary>Persists all pending changes to the database.</summary>
    Task CommitAsync();
}
