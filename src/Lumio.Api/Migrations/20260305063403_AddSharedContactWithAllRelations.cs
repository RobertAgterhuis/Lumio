using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lumio.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddSharedContactWithAllRelations : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "HuisartsContactId",
                table: "Wilsverklaringen",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "Vertegenwoordiger2ContactId",
                table: "Wilsverklaringen",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "VertegenwoordigerContactId",
                table: "Wilsverklaringen",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "UitvaartOndernemerContactId",
                table: "UitvaartWensen",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "NotarisContactId",
                table: "Testamenten",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "NotarisContactId",
                table: "Eigenaren",
                type: "TEXT",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "SharedContacts",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    EigenaarId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Type = table.Column<int>(type: "INTEGER", nullable: false),
                    SubType = table.Column<string>(type: "TEXT", nullable: true),
                    Naam = table.Column<string>(type: "TEXT", nullable: false),
                    Relatie = table.Column<string>(type: "TEXT", nullable: true),
                    Telefoon = table.Column<string>(type: "TEXT", nullable: true),
                    Email = table.Column<string>(type: "TEXT", nullable: true),
                    Adres = table.Column<string>(type: "TEXT", nullable: true),
                    Postcode = table.Column<string>(type: "TEXT", nullable: true),
                    Woonplaats = table.Column<string>(type: "TEXT", nullable: true),
                    BedrijfsNaam = table.Column<string>(type: "TEXT", nullable: true),
                    Functie = table.Column<string>(type: "TEXT", nullable: true),
                    Notities = table.Column<string>(type: "TEXT", nullable: true),
                    IsGedeeld = table.Column<bool>(type: "INTEGER", nullable: false),
                    AangemaaktOp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    GewijzigdOp = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SharedContacts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_SharedContacts_Eigenaren_EigenaarId",
                        column: x => x.EigenaarId,
                        principalTable: "Eigenaren",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Wilsverklaringen_HuisartsContactId",
                table: "Wilsverklaringen",
                column: "HuisartsContactId");

            migrationBuilder.CreateIndex(
                name: "IX_Wilsverklaringen_Vertegenwoordiger2ContactId",
                table: "Wilsverklaringen",
                column: "Vertegenwoordiger2ContactId");

            migrationBuilder.CreateIndex(
                name: "IX_Wilsverklaringen_VertegenwoordigerContactId",
                table: "Wilsverklaringen",
                column: "VertegenwoordigerContactId");

            migrationBuilder.CreateIndex(
                name: "IX_UitvaartWensen_UitvaartOndernemerContactId",
                table: "UitvaartWensen",
                column: "UitvaartOndernemerContactId");

            migrationBuilder.CreateIndex(
                name: "IX_Testamenten_NotarisContactId",
                table: "Testamenten",
                column: "NotarisContactId");

            migrationBuilder.CreateIndex(
                name: "IX_Eigenaren_NotarisContactId",
                table: "Eigenaren",
                column: "NotarisContactId");

            migrationBuilder.CreateIndex(
                name: "IX_SharedContacts_EigenaarId",
                table: "SharedContacts",
                column: "EigenaarId");

            migrationBuilder.AddForeignKey(
                name: "FK_Eigenaren_SharedContacts_NotarisContactId",
                table: "Eigenaren",
                column: "NotarisContactId",
                principalTable: "SharedContacts",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Testamenten_SharedContacts_NotarisContactId",
                table: "Testamenten",
                column: "NotarisContactId",
                principalTable: "SharedContacts",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_UitvaartWensen_SharedContacts_UitvaartOndernemerContactId",
                table: "UitvaartWensen",
                column: "UitvaartOndernemerContactId",
                principalTable: "SharedContacts",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Wilsverklaringen_SharedContacts_HuisartsContactId",
                table: "Wilsverklaringen",
                column: "HuisartsContactId",
                principalTable: "SharedContacts",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Wilsverklaringen_SharedContacts_Vertegenwoordiger2ContactId",
                table: "Wilsverklaringen",
                column: "Vertegenwoordiger2ContactId",
                principalTable: "SharedContacts",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.AddForeignKey(
                name: "FK_Wilsverklaringen_SharedContacts_VertegenwoordigerContactId",
                table: "Wilsverklaringen",
                column: "VertegenwoordigerContactId",
                principalTable: "SharedContacts",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Eigenaren_SharedContacts_NotarisContactId",
                table: "Eigenaren");

            migrationBuilder.DropForeignKey(
                name: "FK_Testamenten_SharedContacts_NotarisContactId",
                table: "Testamenten");

            migrationBuilder.DropForeignKey(
                name: "FK_UitvaartWensen_SharedContacts_UitvaartOndernemerContactId",
                table: "UitvaartWensen");

            migrationBuilder.DropForeignKey(
                name: "FK_Wilsverklaringen_SharedContacts_HuisartsContactId",
                table: "Wilsverklaringen");

            migrationBuilder.DropForeignKey(
                name: "FK_Wilsverklaringen_SharedContacts_Vertegenwoordiger2ContactId",
                table: "Wilsverklaringen");

            migrationBuilder.DropForeignKey(
                name: "FK_Wilsverklaringen_SharedContacts_VertegenwoordigerContactId",
                table: "Wilsverklaringen");

            migrationBuilder.DropTable(
                name: "SharedContacts");

            migrationBuilder.DropIndex(
                name: "IX_Wilsverklaringen_HuisartsContactId",
                table: "Wilsverklaringen");

            migrationBuilder.DropIndex(
                name: "IX_Wilsverklaringen_Vertegenwoordiger2ContactId",
                table: "Wilsverklaringen");

            migrationBuilder.DropIndex(
                name: "IX_Wilsverklaringen_VertegenwoordigerContactId",
                table: "Wilsverklaringen");

            migrationBuilder.DropIndex(
                name: "IX_UitvaartWensen_UitvaartOndernemerContactId",
                table: "UitvaartWensen");

            migrationBuilder.DropIndex(
                name: "IX_Testamenten_NotarisContactId",
                table: "Testamenten");

            migrationBuilder.DropIndex(
                name: "IX_Eigenaren_NotarisContactId",
                table: "Eigenaren");

            migrationBuilder.DropColumn(
                name: "HuisartsContactId",
                table: "Wilsverklaringen");

            migrationBuilder.DropColumn(
                name: "Vertegenwoordiger2ContactId",
                table: "Wilsverklaringen");

            migrationBuilder.DropColumn(
                name: "VertegenwoordigerContactId",
                table: "Wilsverklaringen");

            migrationBuilder.DropColumn(
                name: "UitvaartOndernemerContactId",
                table: "UitvaartWensen");

            migrationBuilder.DropColumn(
                name: "NotarisContactId",
                table: "Testamenten");

            migrationBuilder.DropColumn(
                name: "NotarisContactId",
                table: "Eigenaren");
        }
    }
}
