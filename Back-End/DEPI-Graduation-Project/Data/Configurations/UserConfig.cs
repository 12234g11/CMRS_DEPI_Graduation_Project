using DEPI_Graduation_Project.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace DEPI_Graduation_Project.Data.Configurations
{
    public class UserConfig : IEntityTypeConfiguration<ApplicationUser>
    {
        public void Configure(EntityTypeBuilder<ApplicationUser> builder)
        {
            builder.HasIndex(u => u.NormalizedEmail)
                .IsUnique();

            builder.Property(u => u.TrustScore)
                .HasDefaultValue(0.0f);

            builder.Property(u => u.CreatedAt)
                .HasDefaultValueSql("GETDATE()");

        }
    }
}
