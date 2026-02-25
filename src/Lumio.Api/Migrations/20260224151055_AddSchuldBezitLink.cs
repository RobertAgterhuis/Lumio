using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lumio.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddSchuldBezitLink : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "BezitId",
                table: "Schulden",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LeaseMaatschappij",
                table: "Schulden",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Schulden_BezitId",
                table: "Schulden",
                column: "BezitId");

            // NOTE: AddForeignKey is intentionally omitted — SQLite does not support
            // ALTER TABLE ADD CONSTRAINT FOREIGN KEY on existing tables. EF Core
            // navigation properties work via shadow columns without a DB-level FK.
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Schulden_BezitId",
                table: "Schulden");

            migrationBuilder.DropColumn(
                name: "BezitId",
                table: "Schulden");

            migrationBuilder.DropColumn(
                name: "LeaseMaatschappij",
                table: "Schulden");
        }
    }
}
