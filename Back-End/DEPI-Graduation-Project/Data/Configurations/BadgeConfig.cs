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
    public class BadgeConfig : IEntityTypeConfiguration<Badge>
    {
        public void Configure(EntityTypeBuilder<Badge> builder)
        {
            builder.HasKey(b => b.badgeId);

            builder.Property(b => b.badgeId)
                .ValueGeneratedOnAdd();

            builder.Property(b => b.Name)
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(b => b.Description)
                .HasMaxLength(500);

            builder.Property(b => b.IconUrl)
                .HasMaxLength(300);

            builder.Property(b => b.requiredPoints)
                .IsRequired()
                .HasDefaultValue(0);

            builder.HasMany(b => b.UserBadges)
                .WithOne(ub => ub.Badge)
                .HasForeignKey(ub => ub.BadgeId)
                .OnDelete(DeleteBehavior.Cascade);

            // ── Seeding ───────────────────────────────────────────────────────

            builder.HasData(

                // ── عدد التبليغات اللي بعتها ─────────────────────────────────
                new Badge
                {
                    badgeId = "badge-report-1",
                    Name = "مبلّغ مبتدئ",
                    Description = "بعت أول تبليغ ليك — شكراً إنك اهتميت!",
                    requiredPoints = 1,
                    IconUrl = "/icons/badges/reporter-1.svg"
                },
                new Badge
                {
                    badgeId = "badge-report-2",
                    Name = "مبلّغ نشيط",
                    Description = "بعت 10 تبليغات — أنت من الناس اللي بتفرق!",
                    requiredPoints = 10,
                    IconUrl = "/icons/badges/reporter-2.svg"
                },
                new Badge
                {
                    badgeId = "badge-report-3",
                    Name = "مبلّغ محترف",
                    Description = "بعت 50 تبليغ — عينك على كل حاجة!",
                    requiredPoints = 50,
                    IconUrl = "/icons/badges/reporter-3.svg"
                },
                new Badge
                {
                    badgeId = "badge-report-4",
                    Name = "حارس الشارع",
                    Description = "بعت 100 تبليغ — أنت ركيزة المجتمع!",
                    requiredPoints = 100,
                    IconUrl = "/icons/badges/reporter-4.svg"
                },

                // ── عدد التبليغات اللي اتحلت ─────────────────────────────────
                new Badge
                {
                    badgeId = "badge-resolved-1",
                    Name = "صاحب التأثير",
                    Description = "اتحل أول تبليغ بعتته — كلامك وصل!",
                    requiredPoints = 1,
                    IconUrl = "/icons/badges/resolved-1.svg"
                },
                new Badge
                {
                    badgeId = "badge-resolved-2",
                    Name = "صانع الفرق",
                    Description = "اتحلت 10 من تبليغاتك — أنت بتغير حاجات حقيقية!",
                    requiredPoints = 10,
                    IconUrl = "/icons/badges/resolved-2.svg"
                },
                new Badge
                {
                    badgeId = "badge-resolved-3",
                    Name = "بطل الحي",
                    Description = "اتحلت 30 من تبليغاتك — الشارع أحسن بسببك!",
                    requiredPoints = 30,
                    IconUrl = "/icons/badges/resolved-3.svg"
                },

                // ── الـ Trust Score (القيمة من 0 لـ 100 تمثل الـ %) ──────────
                new Badge
                {
                    badgeId = "badge-trust-1",
                    Name = "موثوق",
                    Description = "وصلت Trust Score فوق 60% — تبليغاتك جادة!",
                    requiredPoints = 60,
                    IconUrl = "/icons/badges/trust-1.svg"
                },
                new Badge
                {
                    badgeId = "badge-trust-2",
                    Name = "مصداقية عالية",
                    Description = "وصلت Trust Score فوق 80% — الناس بتوثق فيك!",
                    requiredPoints = 80,
                    IconUrl = "/icons/badges/trust-2.svg"
                },
                new Badge
                {
                    badgeId = "badge-trust-3",
                    Name = "مرجع المجتمع",
                    Description = "وصلت Trust Score فوق 95% — أنت الأعلى موثوقية!",
                    requiredPoints = 95,
                    IconUrl = "/icons/badges/trust-3.svg"
                }
            );
        }
    }
}
