using Lumio.Api.Services.Pdf.Data;
using Lumio.Api.Services.Pdf.Generators;
using QuestPDF.Fluent;

namespace Lumio.Api.Services.Pdf;

public interface ILumioPdfService
{
    Task<byte[]> GenerateTestamentPdf();
    Task<byte[]> GenerateEuthanasiePdf();
    Task<byte[]> GenerateDonorPdf();
    Task<byte[]> GenerateDigitaalBezitPdf();
    Task<byte[]> GenerateBoedelPdf();
    Task<byte[]> GenerateUitvaartPdf();
    Task<byte[]> GenerateDocumentenOverzichtPdf();
    Task<byte[]> GenerateCompleetPdf();
    Task<byte[]> GenerateNoodkaartPdf();
    Task<byte[]> GenerateTestamentConceptPdf();
    Task<byte[]> GenerateWilsverklaringPdf();
    Task<byte[]> GenerateNoodprocedurePdf();
    Task<byte[]> GenerateBoedelbeschrijvingPdf();
    Task<byte[]> GenerateErfgenaamPdf(Guid erfgenaamId);
    Task<byte[]> GenerateExecuteurRapportPdf();
    Task<byte[]> GenerateNotarisPdf();
}

public class LumioPdfService : ILumioPdfService
{
    private readonly PdfDataLoader _loader;
    private readonly TestamentGenerator _testament;
    private readonly EuthanasieGenerator _euthanasie;
    private readonly DonorGenerator _donor;
    private readonly DigitaalBezitGenerator _digitaalBezit;
    private readonly BoedelGenerator _boedel;
    private readonly UitvaartGenerator _uitvaart;
    private readonly DocumentenGenerator _documenten;
    private readonly CompleetGenerator _compleet;
    private readonly NoodkaartGenerator _noodkaart;
    private readonly TestamentConceptGenerator _testamentConcept;
    private readonly WilsverklaringGenerator _wilsverklaring;
    private readonly NoodprocedureGenerator _noodprocedure;
    private readonly BoedelbeschrijvingGenerator _boedelbeschrijving;
    private readonly ErfgenaamGenerator _erfgenaam;
    private readonly ExecuteurRapportGenerator _executeurRapport;
    private readonly NotarisGenerator _notaris;

    public LumioPdfService(
        PdfDataLoader loader,
        TestamentGenerator testament,
        EuthanasieGenerator euthanasie,
        DonorGenerator donor,
        DigitaalBezitGenerator digitaalBezit,
        BoedelGenerator boedel,
        UitvaartGenerator uitvaart,
        DocumentenGenerator documenten,
        CompleetGenerator compleet,
        NoodkaartGenerator noodkaart,
        TestamentConceptGenerator testamentConcept,
        WilsverklaringGenerator wilsverklaring,
        NoodprocedureGenerator noodprocedure,
        BoedelbeschrijvingGenerator boedelbeschrijving,
        ErfgenaamGenerator erfgenaam,
        ExecuteurRapportGenerator executeurRapport,
        NotarisGenerator notaris)
    {
        _loader = loader;
        _testament = testament;
        _euthanasie = euthanasie;
        _donor = donor;
        _digitaalBezit = digitaalBezit;
        _boedel = boedel;
        _uitvaart = uitvaart;
        _documenten = documenten;
        _compleet = compleet;
        _noodkaart = noodkaart;
        _testamentConcept = testamentConcept;
        _wilsverklaring = wilsverklaring;
        _noodprocedure = noodprocedure;
        _boedelbeschrijving = boedelbeschrijving;
        _erfgenaam = erfgenaam;
        _executeurRapport = executeurRapport;
        _notaris = notaris;
    }

    // ── helpers ────────────────────────────────────────────────────────────────

    private static byte[] Build(PdfDataContext data, IPdfPageGenerator generator)
        => Document.Create(c => generator.AddPages(c, data)).GeneratePdf();

    private async Task<byte[]> All(IPdfPageGenerator generator)
        => Build(await _loader.LoadAllAsync(), generator);

    // ── public API ─────────────────────────────────────────────────────────────

    public Task<byte[]> GenerateTestamentPdf()           => All(_testament);
    public Task<byte[]> GenerateEuthanasiePdf()          => All(_euthanasie);
    public Task<byte[]> GenerateDonorPdf()               => All(_donor);
    public Task<byte[]> GenerateDigitaalBezitPdf()       => All(_digitaalBezit);
    public Task<byte[]> GenerateBoedelPdf()              => All(_boedel);
    public Task<byte[]> GenerateUitvaartPdf()            => All(_uitvaart);
    public Task<byte[]> GenerateDocumentenOverzichtPdf() => All(_documenten);
    public Task<byte[]> GenerateCompleetPdf()            => All(_compleet);
    public Task<byte[]> GenerateNoodkaartPdf()           => All(_noodkaart);
    public Task<byte[]> GenerateTestamentConceptPdf()    => All(_testamentConcept);
    public Task<byte[]> GenerateWilsverklaringPdf()      => All(_wilsverklaring);
    public Task<byte[]> GenerateNoodprocedurePdf()       => All(_noodprocedure);
    public Task<byte[]> GenerateBoedelbeschrijvingPdf()  => All(_boedelbeschrijving);
    public Task<byte[]> GenerateExecuteurRapportPdf()    => All(_executeurRapport);
    public Task<byte[]> GenerateNotarisPdf()             => All(_notaris);

    public async Task<byte[]> GenerateErfgenaamPdf(Guid erfgenaamId)
    {
        var data = await _loader.LoadForErfgenaamAsync(erfgenaamId);
        if (data is null) return [];
        return Build(data, _erfgenaam);
    }
}
