namespace Lumio.Api.Rules.Configuration;

/// <summary>
/// Regex-patronen voor veldvalidatie.
/// </summary>
public class ValidatieOptions
{
    public string IbanRegex { get; set; } = @"^[A-Z]{2}\d{2}[A-Z0-9]{4,30}$";
    public string PostcodeRegex { get; set; } = @"^[1-9][0-9]{3}\s?[a-zA-Z]{2}$";
    public string TelefoonRegex { get; set; } = @"^[+]?[0-9\s\-()]{7,20}$";
}
