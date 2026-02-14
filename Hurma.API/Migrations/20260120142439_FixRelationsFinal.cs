using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hurma.API.Migrations
{
    /// <inheritdoc />
    public partial class FixRelationsFinal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AiAnalyses_Pets_PetId1",
                table: "AiAnalyses");

            migrationBuilder.DropForeignKey(
                name: "FK_AiAnalyses_Users_UserId1",
                table: "AiAnalyses");

            migrationBuilder.DropIndex(
                name: "IX_AiAnalyses_PetId1",
                table: "AiAnalyses");

            migrationBuilder.DropIndex(
                name: "IX_AiAnalyses_UserId1",
                table: "AiAnalyses");

            migrationBuilder.DropColumn(
                name: "PetId1",
                table: "AiAnalyses");

            migrationBuilder.DropColumn(
                name: "UserId1",
                table: "AiAnalyses");

            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "AiAnalyses",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AlterColumn<string>(
                name: "Summary",
                table: "AiAnalyses",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(2000)",
                oldMaxLength: 2000);

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "AiAnalyses",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(50)",
                oldMaxLength: 50);

            migrationBuilder.AlterColumn<string>(
                name: "ImageUrl",
                table: "AiAnalyses",
                type: "nvarchar(max)",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Details",
                table: "AiAnalyses",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(4000)",
                oldMaxLength: 4000);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "Title",
                table: "AiAnalyses",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Summary",
                table: "AiAnalyses",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "Status",
                table: "AiAnalyses",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AlterColumn<string>(
                name: "ImageUrl",
                table: "AiAnalyses",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)",
                oldNullable: true);

            migrationBuilder.AlterColumn<string>(
                name: "Details",
                table: "AiAnalyses",
                type: "nvarchar(4000)",
                maxLength: 4000,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<int>(
                name: "PetId1",
                table: "AiAnalyses",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UserId1",
                table: "AiAnalyses",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_AiAnalyses_PetId1",
                table: "AiAnalyses",
                column: "PetId1");

            migrationBuilder.CreateIndex(
                name: "IX_AiAnalyses_UserId1",
                table: "AiAnalyses",
                column: "UserId1");

            migrationBuilder.AddForeignKey(
                name: "FK_AiAnalyses_Pets_PetId1",
                table: "AiAnalyses",
                column: "PetId1",
                principalTable: "Pets",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_AiAnalyses_Users_UserId1",
                table: "AiAnalyses",
                column: "UserId1",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
