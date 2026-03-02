namespace Lumio.Api.Tests.Collections;

/// <summary>
/// xUnit test collection that serializes all tests opening a real SQLCipher database.
/// Prevents parallel-execution issues (ClearAllPools / PRAGMA interference) between
/// SqlCipherKdfServiceTests and MasterPasswordServiceLoggingTests.
/// </summary>
[CollectionDefinition("SqlCipher", DisableParallelization = true)]
public sealed class SqlCipherCollection;
