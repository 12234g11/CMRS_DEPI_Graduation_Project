using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI_Graduation_Project.Entities
{
    public class MaintenanceTeam
    {
        public string TeamId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Phone { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string? Photo { get; set; }

        public ICollection<TaskAssignment> TaskAssignments { get; set; } = new List<TaskAssignment>();
    }
}
