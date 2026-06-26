using BLL.DTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Interfaces
{
    public interface IBadgeService
    {
        Task<IEnumerable<UserBadgeDTO>> GetUserBadgesAsync(string userId);
        Task<UserBadgeDTO> AwardBadgeAsync(string userId, string badgeId);
        Task<bool> RevokeBadgeAsync(string userId, string badgeId);
        Task CheckAndAwardBadgesAsync(string userId, int currentPoints);
    }
}
