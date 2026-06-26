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
    public class NotificationConfig : IEntityTypeConfiguration<Notification>
    {
        public void Configure(EntityTypeBuilder<Notification> builder)
        {
            builder.HasKey(n => n.NotificationId);

            builder.Property(n => n.Type)
                .IsRequired()
                .HasMaxLength(50);

            builder.Property(n => n.Message)
                .IsRequired()
                .HasMaxLength(500);

            builder.Property(n => n.IsRead)
                .HasDefaultValue(false);

            builder.Property(n => n.CreatedAt)
                .HasDefaultValueSql("GETDATE()");

            // FK → User
            builder.HasOne(n => n.User)
                .WithMany(u => u.Notifications)
                .HasForeignKey(n => n.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // FK → Report
            builder.HasOne(n => n.Report)
                .WithMany(r => r.Notifications)
                .HasForeignKey(n => n.ReportId)
                .OnDelete(DeleteBehavior.NoAction);

            builder.ToTable("Notifications");
        }
    }
}
