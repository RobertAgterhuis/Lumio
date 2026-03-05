using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lumio.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddUitvaartContactToEigenaar : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "UitvaartOndernemerContactId",
                table: "Eigenaren",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Eigenaren_UitvaartOndernemerContactId",
                table: "Eigenaren",
                column: "UitvaartOndernemerContactId");

            migrationBuilder.AddForeignKey(
                name: "FK_Eigenaren_SharedContacts_UitvaartOndernemerContactId",
                table: "Eigenaren",
                column: "UitvaartOndernemerContactId",
                principalTable: "SharedContacts",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Eigenaren_SharedContacts_UitvaartOndernemerContactId",
                table: "Eigenaren");

            migrationBuilder.DropIndex(
                name: "IX_Eigenaren_UitvaartOndernemerContactId",
                table: "Eigenaren");

            migrationBuilder.DropColumn(
                name: "UitvaartOndernemerContactId",
                table: "Eigenaren");
        }
    }
}
