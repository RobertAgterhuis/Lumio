using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lumio.Api.Migrations
{
    /// <inheritdoc />
    public partial class B03_BestemdeErfgenaamFk : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "BestemdeErfgenaam",
                table: "FysiekeBezittingen");

            migrationBuilder.AddColumn<Guid>(
                name: "BestemdeErfgenaamId",
                table: "FysiekeBezittingen",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_FysiekeBezittingen_BestemdeErfgenaamId",
                table: "FysiekeBezittingen",
                column: "BestemdeErfgenaamId");

            migrationBuilder.AddForeignKey(
                name: "FK_FysiekeBezittingen_Erfgenamen_BestemdeErfgenaamId",
                table: "FysiekeBezittingen",
                column: "BestemdeErfgenaamId",
                principalTable: "Erfgenamen",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_FysiekeBezittingen_Erfgenamen_BestemdeErfgenaamId",
                table: "FysiekeBezittingen");

            migrationBuilder.DropIndex(
                name: "IX_FysiekeBezittingen_BestemdeErfgenaamId",
                table: "FysiekeBezittingen");

            migrationBuilder.DropColumn(
                name: "BestemdeErfgenaamId",
                table: "FysiekeBezittingen");

            migrationBuilder.AddColumn<string>(
                name: "BestemdeErfgenaam",
                table: "FysiekeBezittingen",
                type: "TEXT",
                nullable: true);
        }
    }
}
