using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Hurma.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateVetModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<double>(
                name: "Longitude",
                table: "Vets",
                type: "float",
                nullable: true,
                oldClrType: typeof(double),
                oldType: "float");

            migrationBuilder.AlterColumn<double>(
                name: "Latitude",
                table: "Vets",
                type: "float",
                nullable: true,
                oldClrType: typeof(double),
                oldType: "float");

            migrationBuilder.AddColumn<bool>(
                name: "IsOnDuty",
                table: "Vets",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "PhotoUrl",
                table: "Vets",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "WorkHours",
                table: "Vets",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "Appointments",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    VetId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Phone = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Date = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Notes = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Appointments", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Appointments_Vets_VetId",
                        column: x => x.VetId,
                        principalTable: "Vets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.UpdateData(
                table: "Vets",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "IsOnDuty", "PhotoUrl", "WorkHours" },
                values: new object[] { true, "https://place-puppy.com/400x300", "09:00-20:00" });

            migrationBuilder.UpdateData(
                table: "Vets",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "IsOnDuty", "PhotoUrl", "WorkHours" },
                values: new object[] { false, "https://place-puppy.com/401x301", "10:00-22:00" });

            migrationBuilder.UpdateData(
                table: "Vets",
                keyColumn: "Id",
                keyValue: 3,
                columns: new[] { "IsOnDuty", "PhotoUrl", "WorkHours" },
                values: new object[] { false, "https://place-puppy.com/402x302", "08:30-18:30" });

            migrationBuilder.CreateIndex(
                name: "IX_Appointments_VetId",
                table: "Appointments",
                column: "VetId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Appointments");

            migrationBuilder.DropColumn(
                name: "IsOnDuty",
                table: "Vets");

            migrationBuilder.DropColumn(
                name: "PhotoUrl",
                table: "Vets");

            migrationBuilder.DropColumn(
                name: "WorkHours",
                table: "Vets");

            migrationBuilder.AlterColumn<double>(
                name: "Longitude",
                table: "Vets",
                type: "float",
                nullable: false,
                defaultValue: 0.0,
                oldClrType: typeof(double),
                oldType: "float",
                oldNullable: true);

            migrationBuilder.AlterColumn<double>(
                name: "Latitude",
                table: "Vets",
                type: "float",
                nullable: false,
                defaultValue: 0.0,
                oldClrType: typeof(double),
                oldType: "float",
                oldNullable: true);
        }
    }
}
