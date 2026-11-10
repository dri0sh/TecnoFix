using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddDiagnosisAndBudgetToRepairOrder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TechnicalDiagnosis",
                table: "RepairOrders",
                type: "character varying(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "LaborCost",
                table: "RepairOrders",
                type: "numeric(12,2)",
                precision: 12,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "PartsCost",
                table: "RepairOrders",
                type: "numeric(12,2)",
                precision: 12,
                scale: 2,
                nullable: true);

            migrationBuilder.AddColumn<decimal>(
                name: "TotalCost",
                table: "RepairOrders",
                type: "numeric(12,2)",
                precision: 12,
                scale: 2,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TechnicalDiagnosis",
                table: "RepairOrders");

            migrationBuilder.DropColumn(
                name: "LaborCost",
                table: "RepairOrders");

            migrationBuilder.DropColumn(
                name: "PartsCost",
                table: "RepairOrders");

            migrationBuilder.DropColumn(
                name: "TotalCost",
                table: "RepairOrders");
        }
    }
}

