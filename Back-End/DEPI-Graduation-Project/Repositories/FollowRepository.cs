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
    public class FollowRepository : GenericRepository<Follow>, IFollowRepository
    {
        public FollowRepository(BalaghDBContext context) : base(context)
        {
        }

        public async Task<bool> IsFollowingAsync(string userId, string reportId)
        {
            return await _context.Follows
                .AnyAsync(f => f.UserId == userId && f.ReportId == reportId);
        }

        public async Task<List<Follow>> GetFollowersByReportIdAsync(string reportId)
        {
            return await _context.Follows
                .Where(f => f.ReportId == reportId)
                .Include(f => f.User)
                .ToListAsync();
        }

        public async Task<List<Follow>> GetFollowedReportsByUserIdAsync(string userId)
        {
            return await _context.Follows
                .Where(f => f.UserId == userId)
                .Include(f => f.Report)
                .ToListAsync();
        }

        public async Task<int> UnfollowAsync(string userId, string reportId)
        {
            var follow = await _context.Follows
                .FirstOrDefaultAsync(f => f.UserId == userId && f.ReportId == reportId);

            if (follow == null) throw new KeyNotFoundException("Follow relationship not found");

            _context.Follows.Remove(follow);
            return await _context.SaveChangesAsync();
        }
    }
}