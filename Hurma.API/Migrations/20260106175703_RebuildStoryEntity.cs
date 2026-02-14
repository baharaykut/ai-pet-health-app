using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hurma.API.Migrations
{
    /// <inheritdoc />
    public partial class RebuildStoryEntity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Stories_Pets_PetId",
                table: "Stories");

            migrationBuilder.DropForeignKey(
                name: "FK_Stories_Users_UserId",
                table: "Stories");

            migrationBuilder.DropIndex(
                name: "IX_Stories_PetId",
                table: "Stories");

            migrationBuilder.DropIndex(
                name: "IX_Stories_UserId",
                table: "Stories");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "StoryComments");

            migrationBuilder.DropColumn(
                name: "ExpireAt",
                table: "Stories");

            migrationBuilder.RenameColumn(
                name: "PetId",
                table: "Stories",
                newName: "LikeCount");

            migrationBuilder.RenameColumn(
                name: "MediaUrl",
                table: "Stories",
                newName: "UserName");

            migrationBuilder.RenameColumn(
                name: "IsVideo",
                table: "Stories",
                newName: "IsVetPost");

            migrationBuilder.RenameColumn(
                name: "Caption",
                table: "Stories",
                newName: "ImageUrl");

            migrationBuilder.AddColumn<string>(
                name: "Content",
                table: "Stories",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Articles_CreatedAt",
                table: "Articles",
                column: "CreatedAt");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Articles_CreatedAt",
                table: "Articles");

            migrationBuilder.DropColumn(
                name: "Content",
                table: "Stories");

            migrationBuilder.RenameColumn(
                name: "UserName",
                table: "Stories",
                newName: "MediaUrl");

            migrationBuilder.RenameColumn(
                name: "LikeCount",
                table: "Stories",
                newName: "PetId");

            migrationBuilder.RenameColumn(
                name: "IsVetPost",
                table: "Stories",
                newName: "IsVideo");

            migrationBuilder.RenameColumn(
                name: "ImageUrl",
                table: "Stories",
                newName: "Caption");

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "StoryComments",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "ExpireAt",
                table: "Stories",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.CreateIndex(
                name: "IX_Stories_PetId",
                table: "Stories",
                column: "PetId");

            migrationBuilder.CreateIndex(
                name: "IX_Stories_UserId",
                table: "Stories",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Stories_Pets_PetId",
                table: "Stories",
                column: "PetId",
                principalTable: "Pets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Stories_Users_UserId",
                table: "Stories",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
