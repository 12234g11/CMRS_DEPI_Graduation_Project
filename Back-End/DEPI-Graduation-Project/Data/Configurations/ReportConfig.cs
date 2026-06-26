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
    public class ReportConfig : IEntityTypeConfiguration<Report>
    {
        public void Configure(EntityTypeBuilder<Report> builder)
        {
            builder.HasKey(r => r.ReportId);

            builder.Property(r => r.Title)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(r => r.Description)
                .IsRequired()
                .HasMaxLength(300);

            builder.Property(r => r.Status)
                .HasMaxLength(50)
                .HasDefaultValue("Pending");

            builder.Property(r => r.Latitude)
                .IsRequired();

            builder.Property(r => r.Longitude)
                .IsRequired();

            builder.Property(r => r.Priority)
                .IsRequired()
                .HasDefaultValue(1); // Lowest Priority

            builder.Property(r => r.DuplicateCount)
                .IsRequired()
                .HasDefaultValue(0);

            builder.Property(r => r.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETDATE()");

            // Relationships(Many - to - One)
            builder.HasOne(r => r.User)
                .WithMany(u => u.Reports)
                .HasForeignKey(r => r.UserId);

            builder.HasOne(r => r.IssueCategory)
                .WithMany(i => i.Reports)
                .HasForeignKey(r => r.IssueCategoryId);

            builder.HasOne(r => r.Area)
                .WithMany(a => a.Reports)
                .HasForeignKey(r => r.AreaId);

            // Relationships (One-to-Many)
            builder.HasMany(r => r.ReportStatusHistories)
                .WithOne(rs => rs.Report)
                .HasForeignKey(rs => rs.ReportId);

            builder.HasMany(r => r.ReportRatings)
                .WithOne(rs => rs.Report)
                .HasForeignKey(rs => rs.ReportId);

            builder.HasMany(r => r.ReportImages)
                .WithOne(rs => rs.Report)
                .HasForeignKey(rs => rs.ReportId);
        }
    }
}
