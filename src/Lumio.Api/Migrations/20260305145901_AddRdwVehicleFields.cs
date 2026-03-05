using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lumio.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddRdwVehicleFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<decimal>(
                name: "RestWaarde",
                table: "FysiekeBezittingen",
                type: "decimal(18,2)",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "TEXT",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Brandstof",
                table: "FysiekeBezittingen",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Merk",
                table: "FysiekeBezittingen",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Model",
                table: "FysiekeBezittingen",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Voertuigklasse",
                table: "FysiekeBezittingen",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Brandstof",
                table: "FysiekeBezittingen");

            migrationBuilder.DropColumn(
                name: "Merk",
                table: "FysiekeBezittingen");

            migrationBuilder.DropColumn(
                name: "Model",
                table: "FysiekeBezittingen");

            migrationBuilder.DropColumn(
                name: "Voertuigklasse",
                table: "FysiekeBezittingen");

            migrationBuilder.AlterColumn<decimal>(
                name: "RestWaarde",
                table: "FysiekeBezittingen",
                type: "TEXT",
                nullable: true,
                oldClrType: typeof(decimal),
                oldType: "decimal(18,2)",
                oldNullable: true);
        }
    }
}
