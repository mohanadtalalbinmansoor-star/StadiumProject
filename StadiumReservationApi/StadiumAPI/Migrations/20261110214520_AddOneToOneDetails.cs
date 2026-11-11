using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace StadiumReservationApi.Migrations
{
    /// <inheritdoc />
    public partial class AddOneToOneDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "StadiumDetails",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LicenseNumber = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Capacity = table.Column<int>(type: "int", nullable: false),
                    GrassType = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    StadiumId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_StadiumDetails", x => x.Id);
                    table.ForeignKey(
                        name: "FK_StadiumDetails_Stadiums_StadiumId",
                        column: x => x.StadiumId,
                        principalTable: "Stadiums",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_StadiumDetails_StadiumId",
                table: "StadiumDetails",
                column: "StadiumId",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "StadiumDetails");
        }
    }
}
