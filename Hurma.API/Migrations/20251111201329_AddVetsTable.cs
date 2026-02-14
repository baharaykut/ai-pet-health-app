using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Hurma.API.Migrations
{
    /// <inheritdoc />
    public partial class AddVetsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Vets",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Address = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Latitude = table.Column<double>(type: "float", nullable: false),
                    Longitude = table.Column<double>(type: "float", nullable: false),
                    Rating = table.Column<double>(type: "float", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Vets", x => x.Id);
                });

            migrationBuilder.InsertData(
                table: "Vets",
                columns: new[] { "Id", "Address", "Latitude", "Longitude", "Name", "Phone", "Rating" },
                values: new object[,]
                {
                    { 1, "Atatürk Cad. No:45, Merkez, Bilecik", 40.140599999999999, 29.979299999999999, "CanVet", "0228 212 45 67", 4.7999999999999998 },
                    { 2, "Cumhuriyet Mah. 23. Sk. No:12, Bilecik", 40.142299999999999, 29.982500000000002, "Minik Dost Kliniği", "0228 214 32 10", 4.5999999999999996 },
                    { 3, "İstasyon Cad. No:76, Bilecik", 40.138100000000001, 29.984100000000002, "PatiCare Veteriner", "0228 215 19 20", 4.9000000000000004 }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Vets");
        }
    }
}
