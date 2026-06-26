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
    public class ReportStatusHistoryConfig : IEntityTypeConfiguration<ReportStatusHistory>
    {
        public void Configure(EntityTypeBuilder<ReportStatusHistory> builder)
        {
            builder.HasKey(r => r.ReportStatusHistoryId);

            builder.Property(r => r.Status)
                .IsRequired()
                .HasDefaultValue("Pending");

            builder.Property(r => r.ChangedAt)
                .IsRequired()
                .HasDefaultValueSql("GETDATE()");

            // Relations (One-To-Many)
            builder.HasOne(rs => rs.Report)
                .WithMany(r => r.ReportStatusHistories)
                .HasForeignKey(rs => rs.ReportId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(rs => rs.User)
                .WithMany(u => u.ReportStatusHistories)
                .HasForeignKey(rs => rs.AdminId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.HasOne(rs => rs.Company)
                .WithMany(c => c.ReportStatusHistories)
                .HasForeignKey(rs => rs.AdminId)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
}
