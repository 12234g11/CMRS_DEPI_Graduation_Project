using DEPI_Graduation_Project.Data.Context;
using DEPI_Graduation_Project.Entities;
using DEPI_Graduation_Project.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI_Graduation_Project.Repositories
{
    public class UserBadgeRepository : GenericRepository<UserBadge>, IUserBadgeRepository
    {
        public UserBadgeRepository(BalaghDBContext context) : base(context)
        {
        }

        public async Task<IEnumerable<UserBadge>> GetByUserIdAsync(string userId)
        {
            return await _context.UserBadges
                .Include(ub => ub.Badge)
                .Where(ub => ub.UserId == userId)
                .OrderByDescending(ub => ub.AwardedAt)
                .ToListAsync();
        }

        public async Task<UserBadge?> GetByUserAndBadgeAsync(string userId, string badgeId)
        {
            return await _context.UserBadges
                .Include(ub => ub.Badge)
                .FirstOrDefaultAsync(ub => ub.UserId == userId && ub.BadgeId == badgeId);
        }

        public async Task<bool> ExistsAsync(string userId, string badgeId)
        {
            return await _context.UserBadges
                .AnyAsync(ub => ub.UserId == userId && ub.BadgeId == badgeId);
        }
    }
}
