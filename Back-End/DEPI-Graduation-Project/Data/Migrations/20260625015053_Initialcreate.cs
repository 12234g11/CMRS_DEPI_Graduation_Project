using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace DEPI_Graduation_Project.Data.Migrations
{
    /// <inheritdoc />
    public partial class Initialcreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AREA",
                columns: table => new
                {
                    AreaId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    city = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    address = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: true),
                    detailed_address = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: true),
                    health_score = table.Column<float>(type: "real", nullable: false, defaultValue: 100f)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AREA", x => x.AreaId);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUsers",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    TrustScore = table.Column<float>(type: "real", nullable: false, defaultValue: 0f),
                    City = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Role = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    UserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedUserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SecurityStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "bit", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "bit", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUsers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Badges",
                columns: table => new
                {
                    badgeId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    requiredPoints = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    IconUrl = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Badges", x => x.badgeId);
                });

            migrationBuilder.CreateTable(
                name: "IssueCategories",
                columns: table => new
                {
                    CategoryId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_IssueCategories", x => x.CategoryId);
                });

            migrationBuilder.CreateTable(
                name: "MaintenanceTeams",
                columns: table => new
                {
                    TeamId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    department = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    photo = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MaintenanceTeams", x => x.TeamId);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoleClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoleClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserLogins",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderKey = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderDisplayName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserLogins", x => new { x.LoginProvider, x.ProviderKey });
                    table.ForeignKey(
                        name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserRoles",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserTokens",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                    table.ForeignKey(
                        name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserBadges",
                columns: table => new
                {
                    UserBadgeId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    AwardedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    BadgeId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserBadges", x => x.UserBadgeId);
                    table.ForeignKey(
                        name: "FK_UserBadges_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserBadges_Badges_BadgeId",
                        column: x => x.BadgeId,
                        principalTable: "Badges",
                        principalColumn: "badgeId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "COMPANY",
                columns: table => new
                {
                    CompanyId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    name = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    email = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    phone = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    password = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    area_id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    service_category_id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    created_at = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_COMPANY", x => x.CompanyId);
                    table.ForeignKey(
                        name: "FK_COMPANY_AREA_area_id",
                        column: x => x.area_id,
                        principalTable: "AREA",
                        principalColumn: "AreaId",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_COMPANY_IssueCategories_service_category_id",
                        column: x => x.service_category_id,
                        principalTable: "IssueCategories",
                        principalColumn: "CategoryId",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Reports",
                columns: table => new
                {
                    ReportId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    Latitude = table.Column<float>(type: "real", nullable: false),
                    Longitude = table.Column<float>(type: "real", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Pending"),
                    Priority = table.Column<int>(type: "int", nullable: false, defaultValue: 1),
                    DuplicateCount = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    LastUpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    IssueCategoryId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    AreaId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Reports", x => x.ReportId);
                    table.ForeignKey(
                        name: "FK_Reports_AREA_AreaId",
                        column: x => x.AreaId,
                        principalTable: "AREA",
                        principalColumn: "AreaId",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Reports_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Reports_IssueCategories_IssueCategoryId",
                        column: x => x.IssueCategoryId,
                        principalTable: "IssueCategories",
                        principalColumn: "CategoryId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Follows",
                columns: table => new
                {
                    FollowId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ReportId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Follows", x => x.FollowId);
                    table.ForeignKey(
                        name: "FK_Follows_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Follows_Reports_ReportId",
                        column: x => x.ReportId,
                        principalTable: "Reports",
                        principalColumn: "ReportId");
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    NotificationId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ReportId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Message = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    IsRead = table.Column<bool>(type: "bit", nullable: false, defaultValue: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.NotificationId);
                    table.ForeignKey(
                        name: "FK_Notifications_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Notifications_Reports_ReportId",
                        column: x => x.ReportId,
                        principalTable: "Reports",
                        principalColumn: "ReportId");
                });

            migrationBuilder.CreateTable(
                name: "ReportImages",
                columns: table => new
                {
                    ImageId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ImageUrl = table.Column<string>(type: "nvarchar(300)", maxLength: 300, nullable: false),
                    UploadedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    ReportId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReportImages", x => x.ImageId);
                    table.ForeignKey(
                        name: "FK_ReportImages_Reports_ReportId",
                        column: x => x.ReportId,
                        principalTable: "Reports",
                        principalColumn: "ReportId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ReportRatings",
                columns: table => new
                {
                    ReportRatingId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Rating = table.Column<int>(type: "int", nullable: false, defaultValue: 0),
                    RatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ReportId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReportRatings", x => x.ReportRatingId);
                    table.ForeignKey(
                        name: "FK_ReportRatings_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ReportRatings_Reports_ReportId",
                        column: x => x.ReportId,
                        principalTable: "Reports",
                        principalColumn: "ReportId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ReportStatusHistories",
                columns: table => new
                {
                    ReportStatusHistoryId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(max)", nullable: false, defaultValue: "Pending"),
                    ChangedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()"),
                    ReportId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    AdminId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    CompnayId = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ReportStatusHistories", x => x.ReportStatusHistoryId);
                    table.ForeignKey(
                        name: "FK_ReportStatusHistories_AspNetUsers_AdminId",
                        column: x => x.AdminId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_ReportStatusHistories_COMPANY_AdminId",
                        column: x => x.AdminId,
                        principalTable: "COMPANY",
                        principalColumn: "CompanyId");
                    table.ForeignKey(
                        name: "FK_ReportStatusHistories_Reports_ReportId",
                        column: x => x.ReportId,
                        principalTable: "Reports",
                        principalColumn: "ReportId");
                });

            migrationBuilder.CreateTable(
                name: "TaskAssignments",
                columns: table => new
                {
                    TaskId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    report_id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    team_id = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    company_id = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    assigned_by = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false, defaultValue: "Pending"),
                    assigned_at = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETUTCDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_TaskAssignments", x => x.TaskId);
                    table.CheckConstraint("CK_TaskAssignment_Assignee", "team_id IS NOT NULL OR company_id IS NOT NULL");
                    table.ForeignKey(
                        name: "FK_TaskAssignments_AspNetUsers_assigned_by",
                        column: x => x.assigned_by,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_TaskAssignments_COMPANY_company_id",
                        column: x => x.company_id,
                        principalTable: "COMPANY",
                        principalColumn: "CompanyId",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_TaskAssignments_MaintenanceTeams_team_id",
                        column: x => x.team_id,
                        principalTable: "MaintenanceTeams",
                        principalColumn: "TeamId",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_TaskAssignments_Reports_report_id",
                        column: x => x.report_id,
                        principalTable: "Reports",
                        principalColumn: "ReportId",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Verifications",
                columns: table => new
                {
                    VerificationId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ReportId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Vote = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "GETDATE()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Verifications", x => x.VerificationId);
                    table.ForeignKey(
                        name: "FK_Verifications_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_Verifications_Reports_ReportId",
                        column: x => x.ReportId,
                        principalTable: "Reports",
                        principalColumn: "ReportId");
                });

            migrationBuilder.InsertData(
                table: "Badges",
                columns: new[] { "badgeId", "Description", "IconUrl", "Name", "requiredPoints" },
                values: new object[,]
                {
                    { "badge-report-1", "بعت أول تبليغ ليك — شكراً إنك اهتميت!", "/icons/badges/reporter-1.svg", "مبلّغ مبتدئ", 1 },
                    { "badge-report-2", "بعت 10 تبليغات — أنت من الناس اللي بتفرق!", "/icons/badges/reporter-2.svg", "مبلّغ نشيط", 10 },
                    { "badge-report-3", "بعت 50 تبليغ — عينك على كل حاجة!", "/icons/badges/reporter-3.svg", "مبلّغ محترف", 50 },
                    { "badge-report-4", "بعت 100 تبليغ — أنت ركيزة المجتمع!", "/icons/badges/reporter-4.svg", "حارس الشارع", 100 },
                    { "badge-resolved-1", "اتحل أول تبليغ بعتته — كلامك وصل!", "/icons/badges/resolved-1.svg", "صاحب التأثير", 1 },
                    { "badge-resolved-2", "اتحلت 10 من تبليغاتك — أنت بتغير حاجات حقيقية!", "/icons/badges/resolved-2.svg", "صانع الفرق", 10 },
                    { "badge-resolved-3", "اتحلت 30 من تبليغاتك — الشارع أحسن بسببك!", "/icons/badges/resolved-3.svg", "بطل الحي", 30 },
                    { "badge-trust-1", "وصلت Trust Score فوق 60% — تبليغاتك جادة!", "/icons/badges/trust-1.svg", "موثوق", 60 },
                    { "badge-trust-2", "وصلت Trust Score فوق 80% — الناس بتوثق فيك!", "/icons/badges/trust-2.svg", "مصداقية عالية", 80 },
                    { "badge-trust-3", "وصلت Trust Score فوق 95% — أنت الأعلى موثوقية!", "/icons/badges/trust-3.svg", "مرجع المجتمع", 95 }
                });

            migrationBuilder.InsertData(
                table: "IssueCategories",
                columns: new[] { "CategoryId", "description", "name" },
                values: new object[,]
                {
                    { "1", "Lighting", "الإضاءة" },
                    { "2", "Water & Drainage", "المياه والصرف" },
                    { "3", "Cleaning", "النظافة" },
                    { "4", "Roads & Pavements", "الطرق والأرصفة" },
                    { "5", "Public Safety", "السلامة العامة" },
                    { "6", "Electricity", "الكهرباء" },
                    { "7", "Trees & Gardens", "الأشجار والحدائق" },
                    { "8", "Other", "أخرى" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoleClaims_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles",
                column: "NormalizedName",
                unique: true,
                filter: "[NormalizedName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserClaims_UserId",
                table: "AspNetUserClaims",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserLogins_UserId",
                table: "AspNetUserLogins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserRoles_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "AspNetUsers",
                column: "NormalizedEmail",
                unique: true,
                filter: "[NormalizedEmail] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "AspNetUsers",
                column: "NormalizedUserName",
                unique: true,
                filter: "[NormalizedUserName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_COMPANY_area_id",
                table: "COMPANY",
                column: "area_id");

            migrationBuilder.CreateIndex(
                name: "IX_COMPANY_email",
                table: "COMPANY",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_COMPANY_service_category_id",
                table: "COMPANY",
                column: "service_category_id");

            migrationBuilder.CreateIndex(
                name: "IX_Follows_ReportId",
                table: "Follows",
                column: "ReportId");

            migrationBuilder.CreateIndex(
                name: "IX_Follows_UserId_ReportId",
                table: "Follows",
                columns: new[] { "UserId", "ReportId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_ReportId",
                table: "Notifications",
                column: "ReportId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId",
                table: "Notifications",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ReportImages_ReportId",
                table: "ReportImages",
                column: "ReportId");

            migrationBuilder.CreateIndex(
                name: "IX_ReportRatings_ReportId",
                table: "ReportRatings",
                column: "ReportId");

            migrationBuilder.CreateIndex(
                name: "IX_ReportRatings_UserId",
                table: "ReportRatings",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Reports_AreaId",
                table: "Reports",
                column: "AreaId");

            migrationBuilder.CreateIndex(
                name: "IX_Reports_IssueCategoryId",
                table: "Reports",
                column: "IssueCategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Reports_UserId",
                table: "Reports",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ReportStatusHistories_AdminId",
                table: "ReportStatusHistories",
                column: "AdminId");

            migrationBuilder.CreateIndex(
                name: "IX_ReportStatusHistories_ReportId",
                table: "ReportStatusHistories",
                column: "ReportId");

            migrationBuilder.CreateIndex(
                name: "IX_TaskAssignments_assigned_by",
                table: "TaskAssignments",
                column: "assigned_by");

            migrationBuilder.CreateIndex(
                name: "IX_TaskAssignments_company_id",
                table: "TaskAssignments",
                column: "company_id");

            migrationBuilder.CreateIndex(
                name: "IX_TaskAssignments_report_id",
                table: "TaskAssignments",
                column: "report_id");

            migrationBuilder.CreateIndex(
                name: "IX_TaskAssignments_team_id",
                table: "TaskAssignments",
                column: "team_id");

            migrationBuilder.CreateIndex(
                name: "IX_UserBadges_BadgeId",
                table: "UserBadges",
                column: "BadgeId");

            migrationBuilder.CreateIndex(
                name: "IX_UserBadges_UserId",
                table: "UserBadges",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_Verifications_ReportId",
                table: "Verifications",
                column: "ReportId");

            migrationBuilder.CreateIndex(
                name: "IX_Verifications_UserId_ReportId",
                table: "Verifications",
                columns: new[] { "UserId", "ReportId" });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AspNetRoleClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserLogins");

            migrationBuilder.DropTable(
                name: "AspNetUserRoles");

            migrationBuilder.DropTable(
                name: "AspNetUserTokens");

            migrationBuilder.DropTable(
                name: "Follows");

            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "ReportImages");

            migrationBuilder.DropTable(
                name: "ReportRatings");

            migrationBuilder.DropTable(
                name: "ReportStatusHistories");

            migrationBuilder.DropTable(
                name: "TaskAssignments");

            migrationBuilder.DropTable(
                name: "UserBadges");

            migrationBuilder.DropTable(
                name: "Verifications");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "COMPANY");

            migrationBuilder.DropTable(
                name: "MaintenanceTeams");

            migrationBuilder.DropTable(
                name: "Badges");

            migrationBuilder.DropTable(
                name: "Reports");

            migrationBuilder.DropTable(
                name: "AREA");

            migrationBuilder.DropTable(
                name: "AspNetUsers");

            migrationBuilder.DropTable(
                name: "IssueCategories");
        }
    }
}
