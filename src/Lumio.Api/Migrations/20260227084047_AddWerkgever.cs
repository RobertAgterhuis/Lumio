using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lumio.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddWerkgever : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Werkgevers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    EigenaarId = table.Column<Guid>(type: "TEXT", nullable: false),
                    BedrijfsNaam = table.Column<string>(type: "TEXT", nullable: false),
                    KvKNummer = table.Column<string>(type: "TEXT", nullable: true),
                    Adres = table.Column<string>(type: "TEXT", nullable: true),
                    Postcode = table.Column<string>(type: "TEXT", nullable: true),
                    Vestigingsplaats = table.Column<string>(type: "TEXT", nullable: true),
                    Website = table.Column<string>(type: "TEXT", nullable: true),
                    TelefoonHoofdkantoor = table.Column<string>(type: "TEXT", nullable: true),
                    Functietitel = table.Column<string>(type: "TEXT", nullable: true),
                    Afdeling = table.Column<string>(type: "TEXT", nullable: true),
                    StartdatumDienstverband = table.Column<DateOnly>(type: "TEXT", nullable: true),
                    IsZzp = table.Column<bool>(type: "INTEGER", nullable: false),
                    PensioenfondNaam = table.Column<string>(type: "TEXT", nullable: true),
                    PensioenfondTelefoon = table.Column<string>(type: "TEXT", nullable: true),
                    PensioenfondEmail = table.Column<string>(type: "TEXT", nullable: true),
                    HrContactNaam = table.Column<string>(type: "TEXT", nullable: true),
                    HrContactTelefoon = table.Column<string>(type: "TEXT", nullable: true),
                    HrContactEmail = table.Column<string>(type: "TEXT", nullable: true),
                    LeidinggevendeNaam = table.Column<string>(type: "TEXT", nullable: true),
                    LeidinggevendeTelefoon = table.Column<string>(type: "TEXT", nullable: true),
                    LeidinggevendeEmail = table.Column<string>(type: "TEXT", nullable: true),
                    Notities = table.Column<string>(type: "TEXT", nullable: true),
                    AangemaaktOp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    GewijzigdOp = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Werkgevers", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Werkgevers");
        }
    }
}
