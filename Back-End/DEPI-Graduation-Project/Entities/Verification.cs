using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI_Graduation_Project.Entities
{
    public class Verification
    {
        public string VerificationId { get; set; }
        public string ReportId { get; set; }
        public string UserId { get; set; }
        public int Vote { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation Properties
        public Report Report { get; set; }
        public ApplicationUser User { get; set; }
    }
}
