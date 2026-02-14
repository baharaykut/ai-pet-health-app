using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Hurma.API.Migrations
{
    /// <inheritdoc />
    public partial class InitArticles : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AiAnalyses_Pets_PetId",
                table: "AiAnalyses");

            migrationBuilder.DeleteData(
                table: "Adoptions",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Adoptions",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 1);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 2);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Products",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.CreateTable(
                name: "Articles",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Summary = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Content = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Articles", x => x.Id);
                });

            migrationBuilder.UpdateData(
                table: "Vets",
                keyColumn: "Id",
                keyValue: 3,
                column: "IsOnDuty",
                value: true);

            migrationBuilder.AddForeignKey(
                name: "FK_AiAnalyses_Pets_PetId",
                table: "AiAnalyses",
                column: "PetId",
                principalTable: "Pets",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AiAnalyses_Pets_PetId",
                table: "AiAnalyses");

            migrationBuilder.DropTable(
                name: "Articles");

            migrationBuilder.InsertData(
                table: "Adoptions",
                columns: new[] { "Id", "Breed", "Contact", "Description", "Location", "Name", "PhotoUrl", "Type" },
                values: new object[,]
                {
                    { 1, "Golden Retriever", "@baharaykut", "Sıcakkanlı, oyuncu bir dost arıyor ❤️", "Bilecik Merkez", "Mayki", "https://place-puppy.com/300x300", "Köpek" },
                    { 2, "Van Kedisi", "0555 555 55 55", "Süt beyaz tüyleriyle minik bir melek 😺", "Bozüyük", "Mırmır", "https://placekitten.com/300/300", "Kedi" }
                });

            migrationBuilder.InsertData(
                table: "Products",
                columns: new[] { "Id", "Category", "Description", "Name", "PhotoUrl", "Price" },
                values: new object[,]
                {
                    { 1, "Kedi Ürünleri", "Yüksek proteinli tavuklu kuru kedi maması.", "Reflex Kedi Maması", "https://placekitten.com/400/400", 229.90m },
                    { 2, "Köpek Ürünleri", "Yetişkin köpekler için vitaminli kuru mama.", "Bonacibo Köpek Maması", "https://place-puppy.com/400x400", 349.90m },
                    { 3, "Kuş Ürünleri", "Orta boy, sağlam metal kuş kafesi.", "Kuş Kafesi", "https://placebear.com/400/400", 599.00m },
                    { 4, "Aksesuar", "3 parçadan oluşan interaktif kedi oyuncağı.", "Kedi Oyuncağı Seti", "https://placekitten.com/401/401", 129.50m }
                });

            migrationBuilder.UpdateData(
                table: "Vets",
                keyColumn: "Id",
                keyValue: 3,
                column: "IsOnDuty",
                value: false);

            migrationBuilder.AddForeignKey(
                name: "FK_AiAnalyses_Pets_PetId",
                table: "AiAnalyses",
                column: "PetId",
                principalTable: "Pets",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }
    }
}
