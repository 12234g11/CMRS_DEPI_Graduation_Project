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
    internal class AreaConfig : IEntityTypeConfiguration<Area>
    {
        public void Configure(EntityTypeBuilder<Area> builder)
        {
            builder.ToTable("AREA");

            builder.HasKey(a => a.AreaId);

            builder.Property(a => a.City)
                .HasColumnName("city")
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(a => a.Address)
            .HasColumnName("address")
            .HasMaxLength(200);

            builder.Property(a => a.DetailedAddress)
                .HasColumnName("detailed_address")
                .HasMaxLength(300);

            builder.Property(a => a.HealthScore)
                .HasColumnName("health_score")
                .HasDefaultValue(100.0f);
        }
    }
}
