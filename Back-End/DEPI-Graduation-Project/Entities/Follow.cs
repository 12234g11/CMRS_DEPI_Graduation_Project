using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI_Graduation_Project.Entities
{
    public class Follow
    {
        public string FollowId { get; set; }
        public string UserId { get; set; }
        public string ReportId { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation Properties
        public ApplicationUser User { get; set; }
        public Report Report { get; set; }
    }
}
