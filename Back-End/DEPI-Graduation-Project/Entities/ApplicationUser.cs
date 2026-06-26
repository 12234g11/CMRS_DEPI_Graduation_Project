using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI_Graduation_Project.Entities
{
    public class ApplicationUser : IdentityUser
    {
        public float TrustScore { get; set; }
        public string? City { get; set; }
        public string Role { get; set; }
        public DateTime CreatedAt { get; set; }

        // Navigation Properties
        public ICollection<Report> Reports { get; set; }
        public ICollection<Notification> Notifications { get; set; }
        public ICollection<Follow> Follows { get; set; }
        public ICollection<Verification> Verifications { get; set; }
        public ICollection<ReportRating> ReportRatings { get; set; }
        public ICollection<UserBadge> UserBadges { get; set; }
        public ICollection<ReportStatusHistory> ReportStatusHistories { get; set; }
    }
}
