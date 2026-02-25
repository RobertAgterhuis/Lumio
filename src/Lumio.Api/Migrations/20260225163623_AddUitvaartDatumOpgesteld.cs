using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lumio.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddUitvaartDatumOpgesteld : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateOnly>(
                name: "DatumOpgesteld",
                table: "UitvaartWensen",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DatumOpgesteld",
                table: "UitvaartWensen");
        }
    }
}
