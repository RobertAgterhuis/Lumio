using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lumio.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddWilsverklaringV2Fields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SituatieNotitie",
                table: "Wilsverklaringen",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "SituatieOpties",
                table: "Wilsverklaringen",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Vertegenwoordiger2Email",
                table: "Wilsverklaringen",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Vertegenwoordiger2Naam",
                table: "Wilsverklaringen",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Vertegenwoordiger2Relatie",
                table: "Wilsverklaringen",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Vertegenwoordiger2Telefoon",
                table: "Wilsverklaringen",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SituatieNotitie",
                table: "Wilsverklaringen");

            migrationBuilder.DropColumn(
                name: "SituatieOpties",
                table: "Wilsverklaringen");

            migrationBuilder.DropColumn(
                name: "Vertegenwoordiger2Email",
                table: "Wilsverklaringen");

            migrationBuilder.DropColumn(
                name: "Vertegenwoordiger2Naam",
                table: "Wilsverklaringen");

            migrationBuilder.DropColumn(
                name: "Vertegenwoordiger2Relatie",
                table: "Wilsverklaringen");

            migrationBuilder.DropColumn(
                name: "Vertegenwoordiger2Telefoon",
                table: "Wilsverklaringen");
        }
    }
}
