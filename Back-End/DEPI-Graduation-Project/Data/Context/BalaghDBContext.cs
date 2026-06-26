using DEPI_Graduation_Project.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Reflection;

namespace DEPI_Graduation_Project.Data.Context
{
    public class BalaghDBContext : IdentityDbContext<ApplicationUser>
    {
        public BalaghDBContext(DbContextOptions<BalaghDBContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(BalaghDBContext).Assembly);
        }

        public DbSet<Badge> Badges { get; set; }
        public DbSet<UserBadge> UserBadges { get; set; }
        public DbSet<Report> Reports { get; set; }
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<Follow> Follows { get; set; }
        public DbSet<Verification> Verifications { get; set; }
        public DbSet<ReportRating> ReportRatings { get; set; }
        public DbSet<ReportStatusHistory> ReportStatusHistories { get; set; }
        public DbSet<ReportImage> ReportImages { get; set; }
        public DbSet<IssueCategory> IssueCategories { get; set; }
        public DbSet<Area> Areas { get; set; }
        public DbSet<TaskAssignment> TaskAssignments { get; set; }
        public DbSet<Company> Companies { get; set; }
        public DbSet<MaintenanceTeam> MaintenanceTeams { get; set; }
    }
}
