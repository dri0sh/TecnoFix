
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class EnforceCaseInsensitiveEquipmentTypeName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_EquipmentTypes_Name",
                table: "EquipmentTypes");

            migrationBuilder.Sql("""
                CREATE UNIQUE INDEX "IX_EquipmentTypes_Name"
                ON "EquipmentTypes" (LOWER("Name"));
                """);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("""
                DROP INDEX IF EXISTS "IX_EquipmentTypes_Name";
                """);

            migrationBuilder.CreateIndex(
                name: "IX_EquipmentTypes_Name",
                table: "EquipmentTypes",
                column: "Name",
                unique: true);
        }
    }
}
