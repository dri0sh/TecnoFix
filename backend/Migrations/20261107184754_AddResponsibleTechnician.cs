using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddResponsibleTechnician : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ResponsibleTechnicianId",
                table: "RepairOrders",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_RepairOrders_ResponsibleTechnicianId",
                table: "RepairOrders",
                column: "ResponsibleTechnicianId");

            migrationBuilder.AddForeignKey(
                name: "FK_RepairOrders_Usuarios_ResponsibleTechnicianId",
                table: "RepairOrders",
                column: "ResponsibleTechnicianId",
                principalTable: "Usuarios",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_RepairOrders_Usuarios_ResponsibleTechnicianId",
                table: "RepairOrders");

            migrationBuilder.DropIndex(
                name: "IX_RepairOrders_ResponsibleTechnicianId",
                table: "RepairOrders");

            migrationBuilder.DropColumn(
                name: "ResponsibleTechnicianId",
                table: "RepairOrders");
        }
    }
}
