using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI_Graduation_Project.Entities
{
    public class Company
    {
        public string CompanyId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string AreaId { get; set; }
        public string ServiceCategoryId { get; set; }
        public DateTime CreatedAt { get; set; }
        public Area Area { get; set; } = null!;
        public IssueCategory ServiceCategory { get; set; } = null!;
        public ICollection<TaskAssignment> TaskAssignments { get; set; } = new List<TaskAssignment>();
        public ICollection<ReportStatusHistory> ReportStatusHistories { get; set; }
    }
}
