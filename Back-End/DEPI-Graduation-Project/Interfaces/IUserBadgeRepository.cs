using DEPI_Graduation_Project.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI_Graduation_Project.Interfaces
{
    public interface IUserBadgeRepository : IGenericRepository<UserBadge>
    {
        Task<IEnumerable<UserBadge>> GetByUserIdAsync(string userId);
        Task<UserBadge?> GetByUserAndBadgeAsync(string userId, string badgeId);
        Task<bool> ExistsAsync(string userId, string badgeId);
    }
}
