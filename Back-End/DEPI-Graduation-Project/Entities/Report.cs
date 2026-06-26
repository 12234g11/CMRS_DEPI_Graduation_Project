using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI_Graduation_Project.Entities
{
    public class Report
    {
        public string ReportId { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public float Latitude { get; set; }
        public float Longitude { get; set; }
        public string Status { get; set; }
        public int Priority { get; set; }
        public int DuplicateCount { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime LastUpdatedAt { get; set; }

        // Relations
        public string UserId { get; set; }
        public string IssueCategoryId { get; set; }
        public string AreaId { get; set; }

        // Navigation properties
        public ApplicationUser User { get; set; }
        public IssueCategory IssueCategory { get; set; }
        public Area Area { get; set; }
        public ICollection<ReportImage> ReportImages { get; set; }
        public ICollection<ReportRating> ReportRatings { get; set; }
        public ICollection<ReportStatusHistory> ReportStatusHistories { get; set; }
        public ICollection<Follow> Follows { get; set; }
        public ICollection<Verification> Verifications { get; set; }
        public ICollection<TaskAssignment> TaskAssignments { get; set; }
        public ICollection<Notification> Notifications { get; set; }

    }
}
