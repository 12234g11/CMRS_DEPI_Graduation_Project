using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI_Graduation_Project.Entities
{
    public class ReportRating
    {
        public string ReportRatingId { get; set; }
        public int Rating { get; set; }
        public DateTime RatedAt { get; set; }

        // Relations
        public string UserId { get; set; }
        public string ReportId { get; set; }

        // Navigation properties
        public ApplicationUser User { get; set; }
        public Report Report { get; set; }

    }
}
