using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Lumio.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddVideoboodschappen : Migration
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

            migrationBuilder.CreateTable(
                name: "Videoboodschappen",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    EigenaarId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Titel = table.Column<string>(type: "TEXT", nullable: false),
                    Beschrijving = table.Column<string>(type: "TEXT", nullable: true),
                    BestandsNaam = table.Column<string>(type: "TEXT", nullable: false),
                    ContentType = table.Column<string>(type: "TEXT", nullable: false),
                    BestandsGrootte = table.Column<long>(type: "INTEGER", nullable: false),
                    DuurSeconden = table.Column<int>(type: "INTEGER", nullable: true),
                    AangemaaktOp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    GewijzigdOp = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Videoboodschappen", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Videoboodschappen_Eigenaren_EigenaarId",
                        column: x => x.EigenaarId,
                        principalTable: "Eigenaren",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VideoboodschapBlobs",
                columns: table => new
                {
                    VideoboodschapId = table.Column<Guid>(type: "TEXT", nullable: false),
                    Inhoud = table.Column<byte[]>(type: "BLOB", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VideoboodschapBlobs", x => x.VideoboodschapId);
                    table.ForeignKey(
                        name: "FK_VideoboodschapBlobs_Videoboodschappen_VideoboodschapId",
                        column: x => x.VideoboodschapId,
                        principalTable: "Videoboodschappen",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "VideoboodschapOntvangers",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "TEXT", nullable: false),
                    VideoboodschapId = table.Column<Guid>(type: "TEXT", nullable: false),
                    ErfgenaamId = table.Column<Guid>(type: "TEXT", nullable: false),
                    AangemaaktOp = table.Column<DateTime>(type: "TEXT", nullable: false),
                    GewijzigdOp = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VideoboodschapOntvangers", x => x.Id);
                    table.ForeignKey(
                        name: "FK_VideoboodschapOntvangers_Videoboodschappen_VideoboodschapId",
                        column: x => x.VideoboodschapId,
                        principalTable: "Videoboodschappen",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Schulden_BezitId",
                table: "Schulden",
                column: "BezitId");

            migrationBuilder.CreateIndex(
                name: "IX_VideoboodschapOntvangers_VideoboodschapId",
                table: "VideoboodschapOntvangers",
                column: "VideoboodschapId");

            migrationBuilder.CreateIndex(
                name: "IX_Videoboodschappen_EigenaarId",
                table: "Videoboodschappen",
                column: "EigenaarId");

            migrationBuilder.AddForeignKey(
                name: "FK_Schulden_FysiekeBezittingen_BezitId",
                table: "Schulden",
                column: "BezitId",
                principalTable: "FysiekeBezittingen",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Schulden_FysiekeBezittingen_BezitId",
                table: "Schulden");

            migrationBuilder.DropTable(
                name: "VideoboodschapBlobs");

            migrationBuilder.DropTable(
                name: "VideoboodschapOntvangers");

            migrationBuilder.DropTable(
                name: "Videoboodschappen");

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
