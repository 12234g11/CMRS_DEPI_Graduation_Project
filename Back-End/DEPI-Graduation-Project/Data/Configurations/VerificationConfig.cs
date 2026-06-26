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
    public class VerificationConfig : IEntityTypeConfiguration<Verification>
    {
        public void Configure(EntityTypeBuilder<Verification> builder)
        {
            builder.HasKey(v => v.VerificationId);

            // Prevent same user from following same report twice
            builder.HasIndex(v => new { v.UserId, v.ReportId });

            builder.Property(v => v.Vote)
                .IsRequired();

            builder.Property(v => v.CreatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETDATE()");

            // Relations

            // FK → User
            builder.HasOne(f => f.User)
                .WithMany(u => u.Verifications)
                .HasForeignKey(f => f.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // FK → Report
            builder.HasOne(f => f.Report)
                .WithMany(r => r.Verifications)
                .HasForeignKey(f => f.ReportId)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
}
