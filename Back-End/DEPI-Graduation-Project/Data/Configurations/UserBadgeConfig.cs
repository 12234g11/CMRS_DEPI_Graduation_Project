using DEPI_Graduation_Project.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Metadata.Conventions;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI_Graduation_Project.Data.Configurations
{
    internal class UserBadgeConfig : IEntityTypeConfiguration<UserBadge>
    {
        public void Configure(EntityTypeBuilder<UserBadge> builder)
        {
            builder.HasKey(ub => ub.UserBadgeId);

            builder.Property(ub => ub.AwardedAt)
                .IsRequired()
                .HasDefaultValueSql("GETDATE()");

            // Relations (Many-To-One)
            builder.HasOne(ub => ub.User)
                .WithMany(u => u.UserBadges)
                .HasForeignKey(ub => ub.UserId);

            builder.HasOne(ub => ub.Badge)
                .WithMany(b => b.UserBadges)
                .HasForeignKey(ub => ub.BadgeId);

            builder.ToTable("UserBadges");
        }
    }
}
