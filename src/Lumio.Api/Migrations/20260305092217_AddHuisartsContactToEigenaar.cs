using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lumio.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddHuisartsContactToEigenaar : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Huisarts",
                table: "Wilsverklaringen");

            migrationBuilder.DropColumn(
                name: "HuisartsEmail",
                table: "Wilsverklaringen");

            migrationBuilder.DropColumn(
                name: "HuisartsPraktijk",
                table: "Wilsverklaringen");

            migrationBuilder.DropColumn(
                name: "HuisartsTelefoon",
                table: "Wilsverklaringen");

            migrationBuilder.DropColumn(
                name: "Vertegenwoordiger2Email",
                table: "Wilsverklaringen");

            migrationBuilder.DropColumn(
                name: "Vertegenwoordiger2Naam",
                table: "Wilsverklaringen");

            migrationBuilder.DropColumn(
                name: "Vertegenwoordiger2Relatie",
                table: "Wilsverklaringen");

            migrationBuilder.DropColumn(
                name: "Vertegenwoordiger2Telefoon",
                table: "Wilsverklaringen");

            migrationBuilder.DropColumn(
                name: "VertegenwoordigerAdres",
                table: "Wilsverklaringen");

            migrationBuilder.DropColumn(
                name: "VertegenwoordigerEmail",
                table: "Wilsverklaringen");

            migrationBuilder.DropColumn(
                name: "VertegenwoordigerNaam",
                table: "Wilsverklaringen");

            migrationBuilder.DropColumn(
                name: "VertegenwoordigerPostcode",
                table: "Wilsverklaringen");

            migrationBuilder.DropColumn(
                name: "VertegenwoordigerRelatie",
                table: "Wilsverklaringen");

            migrationBuilder.DropColumn(
                name: "VertegenwoordigerTelefoon",
                table: "Wilsverklaringen");

            migrationBuilder.DropColumn(
                name: "VertegenwoordigerWoonplaats",
                table: "Wilsverklaringen");

            migrationBuilder.DropColumn(
                name: "UitvaartOndernemer",
                table: "UitvaartWensen");

            migrationBuilder.DropColumn(
                name: "UitvaartOndernemerAdres",
                table: "UitvaartWensen");

            migrationBuilder.DropColumn(
                name: "UitvaartOndernemerEmail",
                table: "UitvaartWensen");

            migrationBuilder.DropColumn(
                name: "UitvaartOndernemerPlaats",
                table: "UitvaartWensen");

            migrationBuilder.DropColumn(
                name: "UitvaartOndernemerPostcode",
                table: "UitvaartWensen");

            migrationBuilder.DropColumn(
                name: "UitvaartOndernemerTelefoon",
                table: "UitvaartWensen");

            migrationBuilder.DropColumn(
                name: "NotarisAdres",
                table: "Testamenten");

            migrationBuilder.DropColumn(
                name: "NotarisEmail",
                table: "Testamenten");

            migrationBuilder.DropColumn(
                name: "NotarisKantoor",
                table: "Testamenten");

            migrationBuilder.DropColumn(
                name: "NotarisNaam",
                table: "Testamenten");

            migrationBuilder.DropColumn(
                name: "NotarisPlaats",
                table: "Testamenten");

            migrationBuilder.DropColumn(
                name: "NotarisPostcode",
                table: "Testamenten");

            migrationBuilder.DropColumn(
                name: "NotarisTelefoon",
                table: "Testamenten");

            migrationBuilder.DropColumn(
                name: "Notaris",
                table: "Eigenaren");

            migrationBuilder.DropColumn(
                name: "NotarisAdres",
                table: "Eigenaren");

            migrationBuilder.DropColumn(
                name: "NotarisEmail",
                table: "Eigenaren");

            migrationBuilder.DropColumn(
                name: "NotarisKantoor",
                table: "Eigenaren");

            migrationBuilder.DropColumn(
                name: "NotarisPlaats",
                table: "Eigenaren");

            migrationBuilder.DropColumn(
                name: "NotarisPostcode",
                table: "Eigenaren");

            migrationBuilder.RenameColumn(
                name: "NotarisTelefoon",
                table: "Eigenaren",
                newName: "HuisartsContactId");

            migrationBuilder.CreateIndex(
                name: "IX_Eigenaren_HuisartsContactId",
                table: "Eigenaren",
                column: "HuisartsContactId");

            migrationBuilder.AddForeignKey(
                name: "FK_Eigenaren_SharedContacts_HuisartsContactId",
                table: "Eigenaren",
                column: "HuisartsContactId",
                principalTable: "SharedContacts",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Eigenaren_SharedContacts_HuisartsContactId",
                table: "Eigenaren");

            migrationBuilder.DropIndex(
                name: "IX_Eigenaren_HuisartsContactId",
                table: "Eigenaren");

            migrationBuilder.RenameColumn(
                name: "HuisartsContactId",
                table: "Eigenaren",
                newName: "NotarisTelefoon");

            migrationBuilder.AddColumn<string>(
                name: "Huisarts",
                table: "Wilsverklaringen",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HuisartsEmail",
                table: "Wilsverklaringen",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HuisartsPraktijk",
                table: "Wilsverklaringen",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "HuisartsTelefoon",
                table: "Wilsverklaringen",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Vertegenwoordiger2Email",
                table: "Wilsverklaringen",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Vertegenwoordiger2Naam",
                table: "Wilsverklaringen",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Vertegenwoordiger2Relatie",
                table: "Wilsverklaringen",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Vertegenwoordiger2Telefoon",
                table: "Wilsverklaringen",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VertegenwoordigerAdres",
                table: "Wilsverklaringen",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VertegenwoordigerEmail",
                table: "Wilsverklaringen",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VertegenwoordigerNaam",
                table: "Wilsverklaringen",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VertegenwoordigerPostcode",
                table: "Wilsverklaringen",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VertegenwoordigerRelatie",
                table: "Wilsverklaringen",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VertegenwoordigerTelefoon",
                table: "Wilsverklaringen",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "VertegenwoordigerWoonplaats",
                table: "Wilsverklaringen",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UitvaartOndernemer",
                table: "UitvaartWensen",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UitvaartOndernemerAdres",
                table: "UitvaartWensen",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UitvaartOndernemerEmail",
                table: "UitvaartWensen",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UitvaartOndernemerPlaats",
                table: "UitvaartWensen",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UitvaartOndernemerPostcode",
                table: "UitvaartWensen",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "UitvaartOndernemerTelefoon",
                table: "UitvaartWensen",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NotarisAdres",
                table: "Testamenten",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NotarisEmail",
                table: "Testamenten",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NotarisKantoor",
                table: "Testamenten",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NotarisNaam",
                table: "Testamenten",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NotarisPlaats",
                table: "Testamenten",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NotarisPostcode",
                table: "Testamenten",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NotarisTelefoon",
                table: "Testamenten",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Notaris",
                table: "Eigenaren",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NotarisAdres",
                table: "Eigenaren",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NotarisEmail",
                table: "Eigenaren",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NotarisKantoor",
                table: "Eigenaren",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NotarisPlaats",
                table: "Eigenaren",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NotarisPostcode",
                table: "Eigenaren",
                type: "TEXT",
                nullable: true);
        }
    }
}
