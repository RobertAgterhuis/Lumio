using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lumio.Api.Migrations
{
    /// <inheritdoc />
    public partial class S5_DonorBeslisser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "BeslisserNaam",
                table: "DonorRegistraties",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BeslisserRelatie",
                table: "DonorRegistraties",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BeslisserTelefoon",
                table: "DonorRegistraties",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BeslisserNaam",
                table: "DonorRegistraties");

            migrationBuilder.DropColumn(
                name: "BeslisserRelatie",
                table: "DonorRegistraties");

            migrationBuilder.DropColumn(
                name: "BeslisserTelefoon",
                table: "DonorRegistraties");
        }
    }
}
