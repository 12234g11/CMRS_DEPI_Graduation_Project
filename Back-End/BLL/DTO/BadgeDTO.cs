using DEPI_Graduation_Project.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.DTO
{
    public class BadgeDTO
    {
        public string BadgeId { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int RequiredPoints { get; set; }
        public string IconUrl { get; set; }
    }

    public class UserBadgeDTO
    {
        public string UserBadgeId { get; set; }
        public DateTime AwardedAt { get; set; }
        public BadgeDTO Badge { get; set; }
    }

    public class AwardBadgeDTO
    {
        public string BadgeId { get; set; }
    }

    public static class BadgeDTOExtensions
    {
        public static BadgeDTO ToDTO(this Badge badge)
        {
            return new BadgeDTO
            {
                BadgeId = badge.badgeId,
                Name = badge.Name,
                Description = badge.Description,
                RequiredPoints = badge.requiredPoints,
                IconUrl = badge.IconUrl
            };
        }

        public static UserBadgeDTO ToDTO(this UserBadge userBadge)
        {
            return new UserBadgeDTO
            {
                UserBadgeId = userBadge.UserBadgeId,
                AwardedAt = userBadge.AwardedAt,
                Badge = userBadge.Badge.ToDTO()
            };
        }
    }
}
