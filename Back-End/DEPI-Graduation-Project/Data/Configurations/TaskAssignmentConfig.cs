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
    internal class TaskAssignmentConfig : IEntityTypeConfiguration<TaskAssignment>
    {
        public void Configure(EntityTypeBuilder<TaskAssignment> builder)
        {

            builder.HasKey(t => t.TaskId);

            builder.Property(t => t.ReportId)
                .HasColumnName("report_id")
                .IsRequired();

            builder.Property(t => t.TeamId)
                .HasColumnName("team_id");

            builder.Property(t => t.CompanyId)
                .HasColumnName("company_id");

            builder.Property(t => t.AssignedBy)
                .HasColumnName("assigned_by")
                .IsRequired();

            builder.Property(t => t.Status)
                .HasColumnName("status")
                .IsRequired()
                .HasMaxLength(50)
                .HasDefaultValue("Pending");

            builder.Property(t => t.AssignedAt)
                .HasColumnName("assigned_at")
                .HasDefaultValueSql("GETUTCDATE()");

            // Business rule: a task must be assigned to at least one of team or company
            builder.HasCheckConstraint(
                "CK_TaskAssignment_Assignee",
                "team_id IS NOT NULL OR company_id IS NOT NULL"
            );

            // Relationships
            builder.HasOne(t => t.Report)
                .WithMany(r => r.TaskAssignments)
                .HasForeignKey(t => t.ReportId)
                .OnDelete(DeleteBehavior.Cascade);

            builder.HasOne(t => t.MaintenanceTeam)
                .WithMany(m => m.TaskAssignments)
                .HasForeignKey(t => t.TeamId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(t => t.Company)
                .WithMany(c => c.TaskAssignments)
                .HasForeignKey(t => t.CompanyId)
                .OnDelete(DeleteBehavior.SetNull);

            builder.HasOne(t => t.AssignedByUser)
                .WithMany()
                .HasForeignKey(t => t.AssignedBy)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
