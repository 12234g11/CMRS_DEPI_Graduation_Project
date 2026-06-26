using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI_Graduation_Project.Entities
{
    public class Badge
    {
        public string badgeId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int requiredPoints { get; set; }
        public string IconUrl { get; set; }

        public ICollection<UserBadge> UserBadges { get; set; }
    }
}
