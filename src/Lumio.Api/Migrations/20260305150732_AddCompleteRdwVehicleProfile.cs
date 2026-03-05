using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lumio.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddCompleteRdwVehicleProfile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AantalCilinders",
                table: "FysiekeBezittingen",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "AantalZitplaatsen",
                table: "FysiekeBezittingen",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "CilinderInhoud",
                table: "FysiekeBezittingen",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Kleur",
                table: "FysiekeBezittingen",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "MassaRijklaar",
                table: "FysiekeBezittingen",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Transmissie",
                table: "FysiekeBezittingen",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Vermogen",
                table: "FysiekeBezittingen",
                type: "INTEGER",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AantalCilinders",
                table: "FysiekeBezittingen");

            migrationBuilder.DropColumn(
                name: "AantalZitplaatsen",
                table: "FysiekeBezittingen");

            migrationBuilder.DropColumn(
                name: "CilinderInhoud",
                table: "FysiekeBezittingen");

            migrationBuilder.DropColumn(
                name: "Kleur",
                table: "FysiekeBezittingen");

            migrationBuilder.DropColumn(
                name: "MassaRijklaar",
                table: "FysiekeBezittingen");

            migrationBuilder.DropColumn(
                name: "Transmissie",
                table: "FysiekeBezittingen");

            migrationBuilder.DropColumn(
                name: "Vermogen",
                table: "FysiekeBezittingen");
        }
    }
}
