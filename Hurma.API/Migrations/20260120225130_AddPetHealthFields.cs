using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hurma.API.Migrations
{
    /// <inheritdoc />
    public partial class AddPetHealthFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ExternalParasiteVaccine",
                table: "Pets");

            migrationBuilder.DropColumn(
                name: "InternalParasiteVaccine",
                table: "Pets");

            migrationBuilder.RenameColumn(
                name: "RabiesVaccine",
                table: "Pets",
                newName: "AiNotes");

            migrationBuilder.AddColumn<double>(
                name: "AiScore",
                table: "Pets",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ExternalParasiteDate",
                table: "Pets",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "InternalParasiteDate",
                table: "Pets",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RabiesVaccineDate",
                table: "Pets",
                type: "datetime2",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Pets_UserId",
                table: "Pets",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Pets_Users_UserId",
                table: "Pets",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Pets_Users_UserId",
                table: "Pets");

            migrationBuilder.DropIndex(
                name: "IX_Pets_UserId",
                table: "Pets");

            migrationBuilder.DropColumn(
                name: "AiScore",
                table: "Pets");

            migrationBuilder.DropColumn(
                name: "ExternalParasiteDate",
                table: "Pets");

            migrationBuilder.DropColumn(
                name: "InternalParasiteDate",
                table: "Pets");

            migrationBuilder.DropColumn(
                name: "RabiesVaccineDate",
                table: "Pets");

            migrationBuilder.RenameColumn(
                name: "AiNotes",
                table: "Pets",
                newName: "RabiesVaccine");

            migrationBuilder.AddColumn<string>(
                name: "ExternalParasiteVaccine",
                table: "Pets",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InternalParasiteVaccine",
                table: "Pets",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
