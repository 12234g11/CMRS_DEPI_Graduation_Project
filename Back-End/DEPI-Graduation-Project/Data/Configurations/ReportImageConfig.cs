using DEPI_Graduation_Project.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI_Graduation_Project.Data.Configurations
{
    public class ReportImageConfig : IEntityTypeConfiguration<ReportImage>
    {

        public void Configure(EntityTypeBuilder<ReportImage> builder)
        {

            builder.HasKey(r => r.ImageId);

            builder.Property(r => r.ImageUrl)
                .IsRequired()
                .HasMaxLength(300);

            builder.Property(r => r.UploadedAt)
                .IsRequired()
                .HasDefaultValueSql("GETDATE()");

            // Relations (One-to-Many)
            builder.HasOne(ri => ri.Report)
                .WithMany(r => r.ReportImages)
                .HasForeignKey(ri => ri.ReportId);

        }

    }
}
