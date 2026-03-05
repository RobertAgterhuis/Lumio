using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lumio.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddVehicleResidualValueFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "KentekenBewijsDocumentGroepId",
                table: "FysiekeBezittingen",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "RestWaarde",
                table: "FysiekeBezittingen",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "KentekenBewijsDocumentGroepId",
                table: "FysiekeBezittingen");

            migrationBuilder.DropColumn(
                name: "RestWaarde",
                table: "FysiekeBezittingen");
        }
    }
}
