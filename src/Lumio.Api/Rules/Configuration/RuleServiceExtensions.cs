using Lumio.Api.Rules.Engine;
using Lumio.Api.Rules.Services;
using Microsoft.Extensions.Options;

namespace Lumio.Api.Rules.Configuration;

/// <summary>
/// Extension method voor het registreren van alle Lumio Rules configuratie, services en rule engine.
/// </summary>
public static class RuleServiceExtensions
{
    /// <summary>
    /// Laadt lumio-rules.json en lumio-workflows.json (indien aanwezig),
    /// registreert alle IOptions&lt;T&gt; bindings, domain-services (Scoped)
    /// en de Rule Engine (Singleton).
    /// </summary>
    public static IServiceCollection AddLumioRules(
        this IServiceCollection services,
        ConfigurationManager configuration)
    {
        // Probeer extern regelbestand te laden (optioneel)
        var rulesPath = Path.Combine(AppContext.BaseDirectory, "rules", "lumio-rules.json");
        if (File.Exists(rulesPath))
        {
            configuration.AddJsonFile(rulesPath, optional: true, reloadOnChange: false);
        }

        // Bind configuratie-secties naar Options
        services.Configure<LumioRulesOptions>(configuration.GetSection("lumioRules"));
        services.Configure<ErfbelastingOptions>(configuration.GetSection("erfbelasting"));
        services.Configure<LimietenOptions>(configuration.GetSection("limieten"));
        services.Configure<VeldLengtesOptions>(configuration.GetSection("veldLengtes"));
        services.Configure<ValidatieOptions>(configuration.GetSection("validatie"));
        services.Configure<EncryptieOptions>(configuration.GetSection("encryptie"));
        services.Configure<ExportOptions>(configuration.GetSection("export"));
        services.Configure<CompleetheidsOptions>(configuration.GetSection("compleetheid"));

        // Rule Engine (Singleton — workflows worden eenmalig geladen)
        services.AddSingleton<IWorkflowLoader, WorkflowLoader>();
        services.AddSingleton<IRuleEngineService, RuleEngineService>();

        // Domain services (Facts-in → Results-out)
        services.AddScoped<IErfbelastingService, ErfbelastingService>();
        services.AddScoped<INalatenschapService, NalatenschapService>();
        services.AddScoped<ICompleetheidsService, CompleetheidsService>();
        services.AddScoped<ILegitimairePortieService, LegitimairePortieService>();
        services.AddScoped<IMeldingService, MeldingService>();
        services.AddScoped<ISuggestieService, SuggestieService>();

        // Startup-validatie: log waarschuwing als regels niet gevonden
        services.AddSingleton<IStartupFilter>(sp =>
        {
            var logger = sp.GetRequiredService<ILoggerFactory>().CreateLogger("LumioRules");
            if (!File.Exists(rulesPath))
            {
                logger.LogWarning(
                    "Regelbestand niet gevonden: {Path}. Standaardwaarden worden gebruikt.",
                    rulesPath);
            }
            else
            {
                var versie = sp.GetRequiredService<IOptions<LumioRulesOptions>>().Value.Versie;
                logger.LogInformation("Lumio regels geladen: versie {Versie} van {Path}", versie, rulesPath);
            }

            return new NoOpStartupFilter();
        });

        return services;
    }

    /// <summary>No-op filter — alleen gebruikt om startup-logging te triggeren.</summary>
    private class NoOpStartupFilter : IStartupFilter
    {
        public Action<IApplicationBuilder> Configure(Action<IApplicationBuilder> next) => next;
    }
}
