using Lumio.Api.Logging;
using Serilog;
using Serilog.Core;
using Serilog.Events;

namespace Lumio.Api.Tests.Logging;

/// <summary>
/// Unit tests for <see cref="BsnMaskingEnricher"/> — GAP-SEC-03 / GUARD-SEC-01.
///
/// AC: Serilog enricher maskeert BSN-patronen (9-cijferige getallen).
/// AC: Unit test bewijst dat BSN nooit in log output verschijnt (regex check op output).
/// </summary>
public class BsnMaskingEnricherTests
{
    private const string Mask = BsnMaskingEnricher.MaskValue;

    // ── MaskBsn static helper ────────────────────────────────────────────────

    [Theory]
    [InlineData("123456789", "***BSN***")]
    [InlineData("BSN: 123456789 aanwezig", "BSN: ***BSN*** aanwezig")]
    [InlineData("Patiënt 123456789 en voogd 987654321",
                "Patiënt ***BSN*** en voogd ***BSN***")]
    public void MaskBsn_MasksBsnPattern(string input, string expected)
    {
        var result = BsnMaskingEnricher.MaskBsn(input);
        Assert.Equal(expected, result);
    }

    [Theory]
    [InlineData("12345678")]        // 8 digits — not a BSN
    [InlineData("1234567890")]       // 10 digits — not a BSN
    [InlineData("geen getal hier")]
    public void MaskBsn_DoesNotMaskNonBsnValues(string input)
    {
        var result = BsnMaskingEnricher.MaskBsn(input);
        Assert.Equal(input, result);
    }

    [Fact]
    public void MaskBsn_EmptyString_ReturnsEmpty()
    {
        Assert.Equal(string.Empty, BsnMaskingEnricher.MaskBsn(string.Empty));
    }

    [Fact]
    public void MaskBsn_MultipleBsns_AllMasked()
    {
        var result = BsnMaskingEnricher.MaskBsn("BSN-1: 111222333, BSN-2: 444555666");
        Assert.DoesNotContain("111222333", result);
        Assert.DoesNotContain("444555666", result);
        Assert.Equal(2, CountOccurrences(result, Mask));
    }

    // ── Serilog integration: enricher masks structured properties ────────────

    [Fact]
    public void Logger_WithEnricher_MasksBsnInStructuredProperty()
    {
        // Arrange: capture sink stores emitted events
        var sink = new CaptureSink();
        var log = new LoggerConfiguration()
            .Enrich.With<BsnMaskingEnricher>()
            .WriteTo.Sink(sink)
            .CreateLogger();

        // Act: log a message with a BSN structured property
        log.Information("Patiënt {Bsn} opgenomen", "123456789");
        log.Dispose();

        // Assert: the captured event's Bsn property value must be masked
        var evt = Assert.Single(sink.Events);
        Assert.True(evt.Properties.TryGetValue("Bsn", out var prop));
        var rendered = prop.ToString().Trim('"');
        Assert.DoesNotContain("123456789", rendered);
        Assert.Contains(Mask, rendered);
    }

    [Fact]
    public void Logger_WithEnricher_DoesNotMaskNonBsnProperties()
    {
        var sink = new CaptureSink();
        var log = new LoggerConfiguration()
            .Enrich.With<BsnMaskingEnricher>()
            .WriteTo.Sink(sink)
            .CreateLogger();

        log.Information("Gebruiker {Naam} ingelogd", "Alice");
        log.Dispose();

        var evt = Assert.Single(sink.Events);
        Assert.True(evt.Properties.TryGetValue("Naam", out var prop));
        Assert.Equal("\"Alice\"", prop.ToString());
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private static int CountOccurrences(string text, string pattern)
    {
        var count = 0;
        var idx = 0;
        while ((idx = text.IndexOf(pattern, idx, StringComparison.Ordinal)) != -1)
        {
            count++;
            idx += pattern.Length;
        }
        return count;
    }

    /// <summary>Simple in-test sink that captures <see cref="LogEvent"/>s for assertions.</summary>
    private sealed class CaptureSink : ILogEventSink
    {
        public readonly List<LogEvent> Events = [];
        public void Emit(LogEvent logEvent) => Events.Add(logEvent);
    }
}


