using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI_Graduation_Project.Entities
{
    public class ReportStatusHistory
    {
        public string ReportStatusHistoryId { get; set; }
        public string Status { get; set; }
        public DateTime ChangedAt { get; set; }

        // Relations

        public string ReportId { get; set; }
        public string? AdminId { get; set; }
        public string? CompnayId { get; set; }

        // Navigation properties

        public Report Report { get; set; }
        public Company Company { get; set; }

        public ApplicationUser User { get; set; }


    }
}
