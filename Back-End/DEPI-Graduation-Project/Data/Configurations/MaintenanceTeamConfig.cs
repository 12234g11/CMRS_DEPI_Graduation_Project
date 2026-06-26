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
    internal class MaintenanceTeamConfig : IEntityTypeConfiguration<MaintenanceTeam>
    {
        public void Configure(EntityTypeBuilder<MaintenanceTeam> builder)
        {

            builder.HasKey(t => t.TeamId);

            builder.Property(t => t.Name)
                .HasColumnName("name")
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(t => t.Phone)
                .HasColumnName("phone")
                .IsRequired()
                .HasMaxLength(20);

            builder.Property(t => t.Department)
                .HasColumnName("department")
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(t => t.Photo)
                .HasColumnName("photo")
                .HasMaxLength(500);
        }
    }
}
