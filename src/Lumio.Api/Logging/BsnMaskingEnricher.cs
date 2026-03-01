using System.Text.RegularExpressions;
using Serilog.Core;
using Serilog.Events;

namespace Lumio.Api.Logging;

/// <summary>
/// Serilog <see cref="ILogEventEnricher"/> that masks BSN (Burgerservicenummer) patterns
/// in ALL log properties — both property names that suggest BSN and any string value
/// matching the BSN digit pattern (\b\d{9}\b).
///
/// Implements GAP-SEC-03 / GUARD-SEC-01: a BSN MUST NEVER appear in Lumio log output.
///
/// Registration:
///   var loggerConfig = new LoggerConfiguration()
///       .Enrich.With&lt;BsnMaskingEnricher&gt;()
///       ...;
///
/// Alternative (destructuring policy for structured objects) is provided by
/// <see cref="BsnMaskingDestructuringPolicy"/>.
/// </summary>
public sealed partial class BsnMaskingEnricher : ILogEventEnricher
{
    // A BSN is exactly 9 consecutive decimal digits delimited by a word boundary.
    // We intentionally mask on digit count alone (no checksum) to catch malformed values too.
    [GeneratedRegex(@"\b\d{9}\b", RegexOptions.Compiled)]
    private static partial Regex BsnPattern();

    internal const string MaskValue = "***BSN***";

    /// <inheritdoc />
    public void Enrich(LogEvent logEvent, ILogEventPropertyFactory propertyFactory)
    {
        if (logEvent.Properties.Count == 0) return;

        foreach (var key in logEvent.Properties.Keys.ToList())
        {
            var masked = MaskProperty(logEvent.Properties[key]);
            if (masked != logEvent.Properties[key])
                logEvent.AddOrUpdateProperty(new LogEventProperty(key, masked));
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static LogEventPropertyValue MaskProperty(LogEventPropertyValue value) =>
        value switch
        {
            ScalarValue sv when sv.Value is string s => new ScalarValue(MaskBsn(s)),
            StructureValue sv => new StructureValue(
                sv.Properties.Select(p => new LogEventProperty(p.Name, MaskProperty(p.Value))),
                sv.TypeTag),
            SequenceValue sv => new SequenceValue(sv.Elements.Select(MaskProperty)),
            DictionaryValue dv => new DictionaryValue(
                dv.Elements.Select(kvp => new KeyValuePair<ScalarValue, LogEventPropertyValue>(
                    new ScalarValue(MaskBsn(kvp.Key.Value?.ToString() ?? string.Empty)),
                    MaskProperty(kvp.Value)))),
            _ => value,
        };

    internal static string MaskBsn(string input) =>
        BsnPattern().Replace(input, MaskValue);
}
