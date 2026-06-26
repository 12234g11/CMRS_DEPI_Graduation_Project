using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI_Graduation_Project.Entities
{
    public class UserBadge
    {
        public string UserBadgeId { get; set; }
        public DateTime AwardedAt { get; set; }

        // Relations
        public string UserId { get; set; }
        public string BadgeId { get; set; }

        // Navigation properties
        public ApplicationUser User { get; set; }
        public Badge Badge { get; set; }
    }
}
