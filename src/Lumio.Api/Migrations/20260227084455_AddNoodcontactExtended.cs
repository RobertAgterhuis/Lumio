using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lumio.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddNoodcontactExtended : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BedrijfsNaam",
                table: "Noodcontacten",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Functie",
                table: "Noodcontacten",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Prioriteit",
                table: "Noodcontacten",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BedrijfsNaam",
                table: "Noodcontacten");

            migrationBuilder.DropColumn(
                name: "Functie",
                table: "Noodcontacten");

            migrationBuilder.DropColumn(
                name: "Prioriteit",
                table: "Noodcontacten");
        }
    }
}
