using DEPI_Graduation_Project.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.DTO
{
    public class IssueCategoryDTO
    {
        public string CategoryId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
    }

    public static class IssueCategoryDTOExtensions
    {
        public static IssueCategoryDTO ToIssueCategoryDTO(this IssueCategory issueCategory)
        {
            return new IssueCategoryDTO
            {
                CategoryId = issueCategory.CategoryId,
                Name = issueCategory.Name,
                Description = issueCategory.Description
            };
        }
    }
}
