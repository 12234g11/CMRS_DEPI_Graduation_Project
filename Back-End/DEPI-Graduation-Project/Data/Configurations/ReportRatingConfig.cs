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
    public class ReportRatingConfig : IEntityTypeConfiguration<ReportRating>
    {
        public void Configure(EntityTypeBuilder<ReportRating> builder)
        {
            builder.HasKey(r => r.ReportRatingId);

            // range constraint for Rating property (1 to 5)
            builder.Property(r => r.Rating)
                .IsRequired()
                .HasDefaultValue(0);

            builder.Property(r => r.RatedAt)
                .IsRequired()
                .HasDefaultValueSql("GETDATE()");

            // Relations (one-To-Many)
            builder.HasOne(rr => rr.Report)
                .WithMany(r => r.ReportRatings)
                .HasForeignKey(rr => rr.ReportId);

            builder.HasOne(r => r.User)
                .WithMany(u => u.ReportRatings)
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.NoAction);
        }
    }
}
