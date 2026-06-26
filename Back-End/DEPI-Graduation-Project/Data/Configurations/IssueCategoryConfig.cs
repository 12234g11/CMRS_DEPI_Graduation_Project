using DEPI_Graduation_Project.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection.Emit;
using System.Text;
using System.Threading.Tasks;

namespace DEPI_Graduation_Project.Data.Configurations
{
    internal class IssueCategoryConfig : IEntityTypeConfiguration<IssueCategory>
    {
        public void Configure(EntityTypeBuilder<IssueCategory> builder)
        {

            builder.HasKey(c => c.CategoryId);

            builder.Property(c => c.Name)
                .HasColumnName("name")
                .IsRequired()
                .HasMaxLength(100);

            builder.Property(c => c.Description)
                .HasColumnName("description")
                .HasMaxLength(500);

            builder.HasData(
               new IssueCategory
               {
                   CategoryId = "1",
                   Name = "الإضاءة",
                   Description = "Lighting"
               },
               new IssueCategory
               {
                   CategoryId = "2",
                   Name = "المياه والصرف",
                   Description = "Water & Drainage"
               },
               new IssueCategory
               {
                   CategoryId = "3",
                   Name = "النظافة",
                   Description = "Cleaning"
               },
               new IssueCategory
               {
                   CategoryId = "4",
                   Name = "الطرق والأرصفة",
                   Description = "Roads & Pavements"
               },
               new IssueCategory
               {
                   CategoryId = "5",
                   Name = "السلامة العامة",
                   Description = "Public Safety"
               },
               new IssueCategory
               {
                   CategoryId = "6",
                   Name = "الكهرباء",
                   Description = "Electricity"
               },
               new IssueCategory
               {
                   CategoryId = "7",
                   Name = "الأشجار والحدائق",
                   Description = "Trees & Gardens"
               },
               new IssueCategory
               {
                   CategoryId = "8",
                   Name = "أخرى",
                   Description = "Other"
               }
           );
        }
    }
}
