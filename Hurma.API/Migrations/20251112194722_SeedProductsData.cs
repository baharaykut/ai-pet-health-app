using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace Hurma.API.Migrations
{
    /// <inheritdoc />
    public partial class SeedProductsData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
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
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
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
        }
    }
}
