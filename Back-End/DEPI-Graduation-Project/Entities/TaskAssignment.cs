using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI_Graduation_Project.Entities
{
    public class TaskAssignment
    {
        public string TaskId { get; set; }
        public string ReportId { get; set; }
        public string? TeamId { get; set; }
        public string? CompanyId { get; set; }
        public string AssignedBy { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime AssignedAt { get; set; }

        public Report Report { get; set; } = null!;
        public MaintenanceTeam? MaintenanceTeam { get; set; }
        public Company? Company { get; set; }
        public ApplicationUser AssignedByUser { get; set; } = null!;
    }
}
