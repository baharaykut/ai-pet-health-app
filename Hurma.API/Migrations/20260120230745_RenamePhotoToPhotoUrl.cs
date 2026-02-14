using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hurma.API.Migrations
{
    /// <inheritdoc />
    public partial class RenamePhotoToPhotoUrl : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Photo",
                table: "Pets",
                newName: "PhotoUrl");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "PhotoUrl",
                table: "Pets",
                newName: "Photo");
        }
    }
}
