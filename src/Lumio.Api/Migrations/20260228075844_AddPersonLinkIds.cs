using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lumio.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPersonLinkIds : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "ErfgenaamId",
                table: "UitvaartGenodigden",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "NoodcontactId",
                table: "UitvaartGenodigden",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ErfgenaamId",
                table: "Executeurs",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "NoodcontactId",
                table: "Executeurs",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ErfgenaamId",
                table: "Begunstigden",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "NoodcontactId",
                table: "Begunstigden",
                type: "TEXT",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ErfgenaamId",
                table: "UitvaartGenodigden");

            migrationBuilder.DropColumn(
                name: "NoodcontactId",
                table: "UitvaartGenodigden");

            migrationBuilder.DropColumn(
                name: "ErfgenaamId",
                table: "Executeurs");

            migrationBuilder.DropColumn(
                name: "NoodcontactId",
                table: "Executeurs");

            migrationBuilder.DropColumn(
                name: "ErfgenaamId",
                table: "Begunstigden");

            migrationBuilder.DropColumn(
                name: "NoodcontactId",
                table: "Begunstigden");
        }
    }
}
