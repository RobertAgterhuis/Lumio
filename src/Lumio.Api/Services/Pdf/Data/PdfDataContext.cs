using Lumio.Api.Domain.AssetRegistry;
using Lumio.Api.Domain.Common;
using Lumio.Api.Domain.DigitalEstate;
using Lumio.Api.Domain.Documents;
using Lumio.Api.Domain.DonorRegistration;
using Lumio.Api.Domain.EuthanasiaDirective;
using Lumio.Api.Domain.FuneralWishes;
using Lumio.Api.Domain.Testament;

namespace Lumio.Api.Services.Pdf.Data;

/// <summary>
/// Immutable data bag passed to every IPdfPageGenerator.
/// Populated once per request by PdfDataLoader.
/// </summary>
public record PdfDataContext(
    // ── Identity ─────────────────────────────────────────────────────────
    Eigenaar? Eigenaar,

    // ── Testament ────────────────────────────────────────────────────────
    TestamentInfo? Testament,
    IList<Begunstigde> Begunstigden,
    IList<Executeur> Executeurs,

    // ── Wilsverklaring euthanasie ─────────────────────────────────────────
    WilsverklaringEuthanasie? Wilsverklaring,
    IList<EuthanasieVoorwaarde> Voorwaarden,

    // ── Donorregistratie ──────────────────────────────────────────────────
    DonorRegistratie? Donor,
    IList<OrgaanKeuze> OrgaanKeuzes,

    // ── Digitale nalatenschap ─────────────────────────────────────────────
    IList<DigitaalAccount> DigitaleAccounts,
    IList<CryptoWallet> CryptoWallets,
    IList<WachtwoordEntry> Wachtwoorden,

    // ── Boedel / vermogen ─────────────────────────────────────────────────
    IList<FysiekBezit> FysiekeBezittingen,
    IList<Bankrekening> Bankrekeningen,
    IList<Verzekering> Verzekeringen,
    IList<Schuld> Schulden,
    IList<ErfgenaamToewijzing> ErfgenaamToewijzingen,

    // ── Uitvaart ──────────────────────────────────────────────────────────
    UitvaartWensen? Uitvaart,
    IList<CeremonieDetail> CeremonieDetails,

    // ── Documenten ────────────────────────────────────────────────────────
    IList<PersoonlijkDocument> Documenten,

    // ── Contacten ─────────────────────────────────────────────────────────
    IList<Erfgenaam> Erfgenamen,
    IList<Noodcontact> Noodcontacten,

    // ── Per-generator context (optional) ─────────────────────────────────
    /// <summary>Set only when generating an ErfgenaamPdf for a single heir.</summary>
    Erfgenaam? TargetErfgenaam = null
);
