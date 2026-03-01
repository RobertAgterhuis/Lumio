using FluentValidation;
using FluentValidation.AspNetCore;
using Lumio.Api.Data;
using Lumio.Api.Logging;
using Serilog;
using Serilog.Events;
using Lumio.Api.Middleware;
using Lumio.Api.Rules.Configuration;
using Lumio.Api.Services;
using Lumio.Api.Services.Export;
using Lumio.Api.Services.Pdf;
using Lumio.Api.Services.Pdf.Data;
using Lumio.Api.Services.Pdf.Generators;
using Lumio.Api.Services.Security;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.FileProviders;
using QuestPDF.Drawing;
using QuestPDF.Infrastructure;

// Initialize SQLCipher provider
SQLitePCL.Batteries_V2.Init();

var builder = WebApplication.CreateBuilder(args);

// QuestPDF community license
QuestPDF.Settings.License = LicenseType.Community;

// Register DM Sans font weights so QuestPDF can use them across all generators
foreach (var weight in new[] { "Regular", "Medium", "SemiBold", "Bold" })
    FontManager.RegisterFontFromEmbeddedResource($"Lumio.Api.Resources.Fonts.DMSans-{weight}.ttf");

// Determine data directory (relative to exe for USB portability)
var dataDir = Environment.GetEnvironmentVariable("LUMIO_DATA_DIR")
    ?? Path.Combine(AppContext.BaseDirectory, "..", "data");
dataDir = Path.GetFullPath(dataDir);
Directory.CreateDirectory(dataDir);

// ── Serilog: file + console logging ──────────────────────────────────────
var logDir = Path.Combine(dataDir, "logs");
Directory.CreateDirectory(logDir);
Log.Logger = new LoggerConfiguration()
    .MinimumLevel.Information()
    .MinimumLevel.Override("Microsoft.AspNetCore", LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.EntityFrameworkCore.Database.Command", LogEventLevel.Warning)
    .MinimumLevel.Override("Microsoft.EntityFrameworkCore.Query", LogEventLevel.Error)
    .Enrich.FromLogContext()
    // GAP-SEC-03: BSN mag nooit in logs verschijnen (GUARD-SEC-01)
    .Enrich.With<BsnMaskingEnricher>()
    .WriteTo.Console(outputTemplate: "{Timestamp:HH:mm:ss} [{Level:u3}] {SourceContext}: {Message:lj}{NewLine}{Exception}")
    .WriteTo.File(
        path: Path.Combine(logDir, "lumio-.log"),
        rollingInterval: RollingInterval.Day,
        retainedFileCountLimit: 30,
        outputTemplate: "{Timestamp:yyyy-MM-dd HH:mm:ss.fff} [{Level:u3}] {SourceContext}: {Message:lj}{NewLine}{Exception}")
    .CreateLogger();
builder.Host.UseSerilog();
// ─────────────────────────────────────────────────────────────────────────

builder.Configuration["DataDir"] = dataDir;

// ── Business Rules configuratie laden ──
builder.Services.AddLumioRules(builder.Configuration);

// Profile service (singleton — manages profile manifest)
builder.Services.AddSingleton<IProfileService, ProfileService>();

// Security services (singletons — hold state across requests)
// GAP-SEC-01: SQLCipher KDF service — ensures ≥310 000 PBKDF2-SHA512 iterations
builder.Services.AddSingleton<ISqlCipherKdfService, SqlCipherKdfService>();
builder.Services.AddSingleton<IMasterPasswordService, MasterPasswordService>();
builder.Services.AddSingleton<IShamirService, ShamirService>();
// GAP-SEC-02: Brute-force bescherming — max 5 pogingen, 15 min lockout
builder.Services.AddSingleton<IBruteForceProtectionService, BruteForceProtectionService>();
builder.Services.AddScoped<IEncryptionService, EncryptionService>();
builder.Services.AddScoped<ILumioPdfService, LumioPdfService>();
// PDF generators (scoped — depend on scoped IStringLocalizer + PdfDataLoader)
builder.Services.AddScoped<PdfDataLoader>();
builder.Services.AddScoped<TestamentGenerator>();
builder.Services.AddScoped<EuthanasieGenerator>();
builder.Services.AddScoped<DonorGenerator>();
builder.Services.AddScoped<DigitaalBezitGenerator>();
builder.Services.AddScoped<BoedelGenerator>();
builder.Services.AddScoped<UitvaartGenerator>();
builder.Services.AddScoped<DocumentenGenerator>();
builder.Services.AddScoped<CompleetGenerator>();
builder.Services.AddScoped<NoodkaartGenerator>();
builder.Services.AddScoped<TestamentConceptGenerator>();
builder.Services.AddScoped<WilsverklaringGenerator>();
builder.Services.AddScoped<NoodprocedureGenerator>();
builder.Services.AddScoped<BoedelbeschrijvingGenerator>();
builder.Services.AddScoped<ErfgenaamGenerator>();
builder.Services.AddScoped<ExecuteurRapportGenerator>();
builder.Services.AddScoped<NotarisGenerator>();
builder.Services.AddSingleton<IAuditService, AuditService>();
// T-006: Registered via interface for compensating-transaction testability
builder.Services.AddSingleton<Lumio.Api.Services.Video.IVideoStorageService, Lumio.Api.Services.Video.VideoStorageService>();

// Status + Export services (scoped — depend on LumioDbContext)
builder.Services.AddScoped<IStatusFactsBuilder, StatusFactsBuilder>();
builder.Services.AddScoped<IExportStatusService, ExportStatusService>();
builder.Services.AddScoped<IExportDataService, ExportDataService>();
builder.Services.AddScoped<IZipExportService, ZipExportService>();
builder.Services.AddScoped<INuvExportService, NuvExportService>();
builder.Services.AddScoped<IHtmlExportService, HtmlExportService>();
builder.Services.AddScoped<IEncryptedBackupService, EncryptedBackupService>();

// EF Core with SQLCipher — dynamic DB path based on active profile
builder.Services.AddDbContext<LumioDbContext>((serviceProvider, options) =>
{
    var passwordService = serviceProvider.GetRequiredService<IMasterPasswordService>();
    if (passwordService.IsUnlocked && passwordService.ActiveDbPath is { } activeDbPath)
    {
        // Build the connection string inside UsePassword so the password is never stored
        // as a managed string beyond the brief span of this callback.
        var connStr = string.Empty;
        passwordService.UsePassword(pw =>
        {
            connStr = new SqliteConnectionStringBuilder
            {
                DataSource = activeDbPath,
                Mode = SqliteOpenMode.ReadWriteCreate,
                Password = System.Text.Encoding.UTF8.GetString(pw)
            }.ToString();
        });
        options.UseSqlite(connStr);
    }
    else
    {
        // Provide a dummy in-memory connection when locked.
        // The middleware will block requests before they reach controllers.
        options.UseSqlite("Data Source=:memory:");
    }
    // Suppress the pending-model-changes warning: migrations are applied at runtime on unlock.
    options.ConfigureWarnings(w => w.Ignore(RelationalEventId.PendingModelChangesWarning));
});

// CORS — GAP-ARC-01: alleen localhost- en Electron-origins
// LocalOriginValidationMiddleware geeft een aanvullende server-side check op /api/ routes.
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy
            .WithOrigins(
                "app://lumio",
                "file://",
                "http://localhost",
                "http://localhost:3000",
                "http://localhost:5123",
                "http://127.0.0.1",
                "http://127.0.0.1:5123")
            .AllowAnyMethod()
            .AllowAnyHeader();
    });
});

builder.Services.AddLocalization(options => options.ResourcesPath = "Resources");
builder.Services.AddControllers()
    .ConfigureApiBehaviorOptions(options =>
    {
        // Return RFC 9457 ProblemDetails for validation errors
        options.InvalidModelStateResponseFactory = context =>
        {
            var problemDetails = new Microsoft.AspNetCore.Mvc.ValidationProblemDetails(context.ModelState)
            {
                Type = "https://httpstatuses.com/400",
                Title = "Validatiefout",
                Status = StatusCodes.Status400BadRequest,
                Instance = context.HttpContext.Request.Path
            };
            return new Microsoft.AspNetCore.Mvc.BadRequestObjectResult(problemDetails)
            {
                ContentTypes = { "application/problem+json" }
            };
        };
    });
builder.Services.AddProblemDetails();
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new()
    {
        Title = "Lumio API",
        Version = "v1",
        Description = "Offline digitale nalatenschap beheer — Lumio"
    });
});

// Determine port from env or default
var port = Environment.GetEnvironmentVariable("ASPNETCORE_URLS")
    ?? "http://127.0.0.1:5123";
builder.WebHost.UseUrls(port);

var app = builder.Build();

app.UseCors();

var supportedCultures = new[] { "nl", "en" };
app.UseRequestLocalization(options =>
{
    options.SetDefaultCulture("nl")
        .AddSupportedCultures(supportedCultures)
        .AddSupportedUICultures(supportedCultures);
});

app.UseMiddleware<ExceptionHandlingMiddleware>();
// GAP-ARC-01: Valideer Origin header — blokkeer niet-localhost origins op /api/ routes
app.UseMiddleware<LocalOriginValidationMiddleware>();
app.UseMiddleware<DatabaseUnlockMiddleware>();

// ── Automatische request logging voor alle controllers ───────────────
app.UseSerilogRequestLogging(opts =>
{
    // Compacte output: "GET /api/erfgenamen → 200 in 12ms"
    opts.MessageTemplate =
        "{RequestMethod} {RequestPath} → {StatusCode} in {Elapsed:0}ms";

    // Geen logs voor Swagger-UI en statische bestanden
    opts.GetLevel = (ctx, _, ex) =>
    {
        if (ex is not null) return LogEventLevel.Error;
        // Swagger en statische assets niet loggen
        if (ctx.Request.Path.StartsWithSegments("/swagger")
            || !ctx.Request.Path.StartsWithSegments("/api"))
            return LogEventLevel.Verbose;
        // Notities-endpoint: 404 = "nog geen notitie" — verwachte lege staat, geen warning
        if (ctx.Response.StatusCode == 404
            && ctx.Request.Path.StartsWithSegments("/api/notities"))
            return LogEventLevel.Information;
        return ctx.Response.StatusCode >= 500
            ? LogEventLevel.Error
            : ctx.Response.StatusCode >= 400
                ? LogEventLevel.Warning
                : LogEventLevel.Information;
    };
});
// ─────────────────────────────────────────────────────────────────────

app.UseSwagger();
app.UseSwaggerUI();

app.MapControllers();

// Serve the static frontend (Next.js export) if the directory exists
var frontendDir = Environment.GetEnvironmentVariable("LUMIO_FRONTEND_DIR")
    ?? Path.Combine(AppContext.BaseDirectory, "..", "frontend");
frontendDir = Path.GetFullPath(frontendDir);

if (Directory.Exists(frontendDir))
{
    var fileProvider = new PhysicalFileProvider(frontendDir);

    // Register .md as a known content type so help markdown files are served correctly
    var contentTypeProvider = new Microsoft.AspNetCore.StaticFiles.FileExtensionContentTypeProvider();
    contentTypeProvider.Mappings[".md"] = "text/plain; charset=utf-8";

    // Rewrite Next.js RSC dot-separated paths to subdirectory paths
    app.UseMiddleware<RscRewriteMiddleware>();
    app.UseDefaultFiles(new DefaultFilesOptions { FileProvider = fileProvider });
    app.UseStaticFiles(new StaticFileOptions
    {
        FileProvider = fileProvider,
        ContentTypeProvider = contentTypeProvider
    });

    // SPA fallback: serve index.html for any non-API route that doesn't match a file
    app.MapFallback(async context =>
    {
        context.Response.ContentType = "text/html";
        await context.Response.SendFileAsync(
            Path.Combine(frontendDir, "index.html"));
    });

    Console.WriteLine($"Frontend pad: {frontendDir}");
}
else
{
    Console.WriteLine($"Frontend niet gevonden: {frontendDir}");
}

Log.Information("Lumio API gestart op {Port}", port);
Log.Information("Data map: {DataDir}", dataDir);
Log.Information("Log map: {LogDir}", logDir);

try
{
    app.Run();
}
finally
{
    Log.CloseAndFlush();
}
