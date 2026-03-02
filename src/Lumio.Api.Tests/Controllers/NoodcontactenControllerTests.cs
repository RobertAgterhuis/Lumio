using Lumio.Api.Controllers;
using Lumio.Api.Domain.Common;
using Lumio.Api.Dtos.Common;
using Lumio.Api.Repositories;
using Microsoft.AspNetCore.Mvc;

namespace Lumio.Api.Tests.Controllers;

/// <summary>
/// Unit tests for <see cref="NoodcontactenController"/> — CRUD + import/export endpoints.
/// SP-13-003 Application Layer fase 2.
/// </summary>
public sealed class NoodcontactenControllerTests
{
    // ── helpers ────────────────────────────────────────────────────────────────

    private static NoodcontactenController MakeController(
        FakeNoodcontactRepo? repo = null,
        FakeEigenaarRepoForNoodcontacten? eigenaarRepo = null,
        FakeAuditService? audit = null) =>
        new(
            repo ?? new FakeNoodcontactRepo(),
            eigenaarRepo ?? new FakeEigenaarRepoForNoodcontacten(),
            audit ?? new FakeAuditService());

    private static Noodcontact NewContact(string naam = "Test Contact") =>
        new() { Id = Guid.NewGuid(), Naam = naam, Relatie = "Vriend", Rol = "Contactpersoon", EigenaarId = Guid.NewGuid() };

    private static NoodcontactUpsertRequest NewRequest(string naam = "Nieuw Contact") =>
        new(naam, "Vriend", null, null, null, null, null, "Contactpersoon", null, null, null);

    // ── GetAll ─────────────────────────────────────────────────────────────────

    [Fact]
    public async Task GetAll_Returns200MetLeegeLijst_WhenGeenContacts()
    {
        var ctrl = MakeController();

        var result = await ctrl.GetAll();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var list = Assert.IsType<List<NoodcontactResponse>>(ok.Value);
        Assert.Empty(list);
    }

    [Fact]
    public async Task GetAll_Returns200MetContacts_WhenContactsAanwezig()
    {
        var contacts = new List<Noodcontact> { NewContact("Alice"), NewContact("Bob") };
        var ctrl = MakeController(repo: new FakeNoodcontactRepo(all: contacts));

        var result = await ctrl.GetAll();

        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var list = Assert.IsType<List<NoodcontactResponse>>(ok.Value);
        Assert.Equal(2, list.Count);
    }

    // ── GetById ────────────────────────────────────────────────────────────────

    [Fact]
    public async Task GetById_Returns404_WhenNietGevonden()
    {
        var ctrl = MakeController();
        var result = await ctrl.GetById(Guid.NewGuid());
        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task GetById_Returns200_WhenGevonden()
    {
        var contact = NewContact();
        var ctrl = MakeController(repo: new FakeNoodcontactRepo(byId: contact));

        var result = await ctrl.GetById(contact.Id);

        Assert.IsType<OkObjectResult>(result.Result);
    }

    // ── Create ─────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Create_Returns400_WhenGeenEigenaar()
    {
        var ctrl = MakeController(eigenaarRepo: new FakeEigenaarRepoForNoodcontacten(null));

        var result = await ctrl.Create(NewRequest());

        Assert.IsType<BadRequestObjectResult>(result.Result);
    }

    [Fact]
    public async Task Create_Returns201_WhenEigenaarAanwezig()
    {
        var eigenaar = new Eigenaar { Id = Guid.NewGuid(), Voornaam = "Jan", Achternaam = "Test", Geboortedatum = new DateOnly(1970, 1, 1) };
        var ctrl = MakeController(eigenaarRepo: new FakeEigenaarRepoForNoodcontacten(eigenaar));

        var result = await ctrl.Create(NewRequest());

        Assert.IsType<CreatedAtActionResult>(result.Result);
    }

    // ── Update ─────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Update_Returns404_WhenNietGevonden()
    {
        var ctrl = MakeController();
        var result = await ctrl.Update(Guid.NewGuid(), NewRequest());
        Assert.IsType<NotFoundResult>(result.Result);
    }

    [Fact]
    public async Task Update_Returns200_WhenGevonden()
    {
        var contact = NewContact();
        var repo = new FakeNoodcontactRepo(byId: contact);
        var ctrl = MakeController(repo: repo);

        var result = await ctrl.Update(contact.Id, NewRequest("Gewijzigd Contact"));

        Assert.IsType<OkObjectResult>(result.Result);
        Assert.True(repo.WasCommitted);
    }

    // ── Delete ─────────────────────────────────────────────────────────────────

    [Fact]
    public async Task Delete_Returns404_WhenNietGevonden()
    {
        var ctrl = MakeController();
        var result = await ctrl.Delete(Guid.NewGuid());
        Assert.IsType<NotFoundResult>(result);
    }

    [Fact]
    public async Task Delete_Returns204_WhenGevonden()
    {
        var contact = NewContact();
        var repo = new FakeNoodcontactRepo(byId: contact);
        var ctrl = MakeController(repo: repo);

        var result = await ctrl.Delete(contact.Id);

        Assert.IsType<NoContentResult>(result);
        Assert.True(repo.WasCommitted);
    }

    // ── ExportGedeeld ──────────────────────────────────────────────────────────

    [Fact]
    public async Task ExportGedeeld_ReturnsFileResult_MetGedeeldeContacts()
    {
        var gedeeld = new List<Noodcontact> { NewContact("Gedeeld") };
        var ctrl = MakeController(repo: new FakeNoodcontactRepo(gedeeld: gedeeld));

        var result = await ctrl.ExportGedeeld();

        Assert.IsType<FileContentResult>(result);
    }

    // ── ImportGedeeld ──────────────────────────────────────────────────────────

    [Fact]
    public async Task ImportGedeeld_Returns400_WhenGeenEigenaar()
    {
        var ctrl = MakeController(eigenaarRepo: new FakeEigenaarRepoForNoodcontacten(null));

        var result = await ctrl.ImportGedeeld(new List<GedeeldNoodcontactDto>());

        Assert.IsType<BadRequestObjectResult>(result);
    }

    [Fact]
    public async Task ImportGedeeld_ReturnsOk_MetAantalToegevoegdEnOvergeslagen()
    {
        var eigenaar = new Eigenaar { Id = Guid.NewGuid(), Voornaam = "Jan", Achternaam = "Test", Geboortedatum = new DateOnly(1970, 1, 1) };
        var bestaand = new Noodcontact { Naam = "Bestaand", Relatie = "Familie", Rol = "Huisarts", Email = "a@b.nl", Telefoon = "0600000000", EigenaarId = eigenaar.Id };
        var repo = new FakeNoodcontactRepo(all: new List<Noodcontact> { bestaand });

        var contacten = new List<GedeeldNoodcontactDto>
        {
            // Duplicate — should be skipped
            new("Bestaand", "Familie", "0600000000", "a@b.nl", null, null, null, "Huisarts", null),
            // New — should be added
            new("Nieuw", "Vriend", null, null, null, null, null, "Contactpersoon", null),
        };

        var ctrl = MakeController(repo: repo, eigenaarRepo: new FakeEigenaarRepoForNoodcontacten(eigenaar));
        var result = await ctrl.ImportGedeeld(contacten);

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(ok.Value);
    }
}

// ── Fakes ──────────────────────────────────────────────────────────────────────

sealed class FakeNoodcontactRepo : INoodcontactRepository
{
    private readonly List<Noodcontact> _all;
    private readonly Noodcontact? _byId;
    private readonly List<Noodcontact> _gedeeld;
    private bool _committed;

    public FakeNoodcontactRepo(
        List<Noodcontact>? all = null,
        Noodcontact? byId = null,
        List<Noodcontact>? gedeeld = null)
    {
        _all = all ?? new List<Noodcontact>();
        _byId = byId;
        _gedeeld = gedeeld ?? new List<Noodcontact>();
    }

    public Task<List<Noodcontact>> GetAllByNameAsync() => Task.FromResult(_all);
    public Task<Noodcontact?> FindByIdAsync(Guid id) => Task.FromResult(_byId);
    public Task<List<Noodcontact>> GetGedeeldByNameAsync() => Task.FromResult(_gedeeld);
    public Task AddAsync(Noodcontact n) { _all.Add(n); return Task.CompletedTask; }
    public Task RemoveAsync(Noodcontact n) { _all.Remove(n); return Task.CompletedTask; }
    public Task CommitAsync() { _committed = true; return Task.CompletedTask; }

    public bool WasCommitted => _committed;
}

sealed class FakeEigenaarRepoForNoodcontacten : IEigenaarRepository
{
    private Eigenaar? _eigenaar;

    public FakeEigenaarRepoForNoodcontacten(Eigenaar? eigenaar = null) => _eigenaar = eigenaar;
    // Parameterless ctor: defaults to a pre-seeded eigenaar for happy-path tests
    public FakeEigenaarRepoForNoodcontacten()
    {
        _eigenaar = new Eigenaar { Id = Guid.NewGuid(), Voornaam = "Default", Achternaam = "Eigenaar", Geboortedatum = new DateOnly(1970, 1, 1) };
    }

    public Task<Eigenaar?> FindAsync() => Task.FromResult(_eigenaar);
    public Task AddAsync(Eigenaar eigenaar) { _eigenaar = eigenaar; return Task.CompletedTask; }
    public Task CommitAsync() => Task.CompletedTask;
}
