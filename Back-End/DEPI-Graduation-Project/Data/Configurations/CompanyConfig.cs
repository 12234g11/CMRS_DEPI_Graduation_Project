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
    internal class CompanyConfig : IEntityTypeConfiguration<Company>
    {
        public void Configure(EntityTypeBuilder<Company> builder)
        {
            builder.ToTable("COMPANY");

            builder.HasKey(c => c.CompanyId);

            builder.Property(c => c.Name)
                .HasColumnName("name")
                .IsRequired()
                .HasMaxLength(150);

            builder.Property(c => c.Email)
                .HasColumnName("email")
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(c => c.Phone)
                .HasColumnName("phone")
                .IsRequired()
                .HasMaxLength(20);

            builder.Property(c => c.Password)
                .HasColumnName("password")
                .IsRequired()
                .HasMaxLength(255);

            builder.Property(c => c.AreaId)
                .HasColumnName("area_id");

            builder.Property(c => c.ServiceCategoryId)
                .HasColumnName("service_category_id");

            builder.Property(c => c.CreatedAt)
                .HasColumnName("created_at")
                .HasDefaultValueSql("GETUTCDATE()");

            // Unique constraint on email
            builder.HasIndex(c => c.Email)
                .IsUnique();

            // Relationships
            builder.HasOne(c => c.Area)
                .WithMany(a => a.Companies)
                .HasForeignKey(c => c.AreaId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.HasOne(c => c.ServiceCategory)
                .WithMany(ic => ic.Companies)
                .HasForeignKey(c => c.ServiceCategoryId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
