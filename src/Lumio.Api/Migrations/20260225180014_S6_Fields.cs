using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lumio.Api.Migrations
{
    /// <inheritdoc />
    public partial class S6_Fields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "OnboardingVoltooid",
                table: "Eigenaren",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<bool>(
                name: "TijdlijnBekeken",
                table: "Eigenaren",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OnboardingVoltooid",
                table: "Eigenaren");

            migrationBuilder.DropColumn(
                name: "TijdlijnBekeken",
                table: "Eigenaren");
        }
    }
}
