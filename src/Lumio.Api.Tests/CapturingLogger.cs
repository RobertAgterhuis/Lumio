using Microsoft.Extensions.Logging;

namespace Lumio.Api.Tests;

/// <summary>
/// In-memory <see cref="ILogger{T}"/> for unit tests.
/// Captures all log entries so assertions can verify that specific warnings/errors were emitted.
/// </summary>
public sealed class CapturingLogger<T> : ILogger<T>
{
    public record LogEntry(LogLevel Level, Exception? Exception, string Message);

    private readonly List<LogEntry> _entries = new();

    public IReadOnlyList<LogEntry> Entries => _entries;

    public IReadOnlyList<LogEntry> Warnings =>
        _entries.Where(e => e.Level == LogLevel.Warning).ToList();

    public IDisposable? BeginScope<TState>(TState state) where TState : notnull => null;
    public bool IsEnabled(LogLevel logLevel) => true;

    public void Log<TState>(
        LogLevel logLevel,
        EventId eventId,
        TState state,
        Exception? exception,
        Func<TState, Exception?, string> formatter)
    {
        _entries.Add(new LogEntry(logLevel, exception, formatter(state, exception)));
    }
}
