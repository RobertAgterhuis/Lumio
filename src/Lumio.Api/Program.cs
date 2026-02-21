using FluentValidation;
using FluentValidation.AspNetCore;
using Lumio.Api.Data;
using Lumio.Api.Middleware;
using Lumio.Api.Services.Pdf;
using Lumio.Api.Services.Security;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using QuestPDF.Infrastructure;

// Initialize SQLCipher provider
SQLitePCL.Batteries_V2.Init();

var builder = WebApplication.CreateBuilder(args);

// QuestPDF community license
QuestPDF.Settings.License = LicenseType.Community;

// Determine data directory (relative to exe for USB portability)
var dataDir = Environment.GetEnvironmentVariable("LUMIO_DATA_DIR")
    ?? Path.Combine(AppContext.BaseDirectory, "..", "data");
dataDir = Path.GetFullPath(dataDir);
Directory.CreateDirectory(dataDir);

builder.Configuration["DataDir"] = dataDir;

// Profile service (singleton — manages profile manifest)
builder.Services.AddSingleton<IProfileService, ProfileService>();

// Security services (singletons — hold state across requests)
builder.Services.AddSingleton<IMasterPasswordService, MasterPasswordService>();
builder.Services.AddSingleton<IShamirService, ShamirService>();
builder.Services.AddScoped<IEncryptionService, EncryptionService>();
builder.Services.AddScoped<ILumioPdfService, LumioPdfService>();

// EF Core with SQLCipher — dynamic DB path based on active profile
builder.Services.AddDbContext<LumioDbContext>((serviceProvider, options) =>
{
    var passwordService = serviceProvider.GetRequiredService<IMasterPasswordService>();
    if (passwordService.IsUnlocked && passwordService.ActiveDbPath is { } activeDbPath)
    {
        var connStr = new SqliteConnectionStringBuilder
        {
            DataSource = activeDbPath,
            Mode = SqliteOpenMode.ReadWriteCreate,
            Password = passwordService.CurrentPassword
        }.ToString();
        options.UseSqlite(connStr);
    }
    else
    {
        // Provide a dummy in-memory connection when locked.
        // The middleware will block requests before they reach controllers.
        options.UseSqlite("Data Source=:memory:");
    }
});

// CORS — allow Electron and local dev origins
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});

builder.Services.AddControllers();
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
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseMiddleware<DatabaseUnlockMiddleware>();

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

    // Rewrite Next.js RSC dot-separated paths to subdirectory paths
    app.UseMiddleware<RscRewriteMiddleware>();
    app.UseDefaultFiles(new DefaultFilesOptions { FileProvider = fileProvider });
    app.UseStaticFiles(new StaticFileOptions { FileProvider = fileProvider });

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

Console.WriteLine($"Lumio API gestart op {port}");
Console.WriteLine($"Data map: {dataDir}");

app.Run();
