using DEPI_Graduation_Project.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI_Graduation_Project.Data.Configurations
{
    public class FollowConfig : IEntityTypeConfiguration<Follow>
    {
        public void Configure(EntityTypeBuilder<Follow> builder)
        {
            builder.HasKey(f => f.FollowId);

            // Prevent same user from following same report twice
            builder.HasIndex(f => new { f.UserId, f.ReportId })
                .IsUnique();

            builder.Property(f => f.CreatedAt)
                .HasDefaultValueSql("GETDATE()");

            // FK → User
            builder.HasOne(f => f.User)
                .WithMany(u => u.Follows)
                .HasForeignKey(f => f.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // FK → Report
            builder.HasOne(f => f.Report)
                .WithMany(r => r.Follows)
                .HasForeignKey(f => f.ReportId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.ToTable("Follows");
        }
    }
}
