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
    public class BadgeRepository : GenericRepository<Badge>, IBadgeRepository
    {
        public BadgeRepository(BalaghDBContext context) : base(context)
        {
        }

        public async Task<Badge?> GetByNameAsync(string name)
        {
            return await _context.Badges
                .FirstOrDefaultAsync(b => b.Name == name);
        }

        public async Task<IEnumerable<Badge>> GetBadgesByMaxPointsAsync(int points)
        {
            return await _context.Badges
                .Where(b => b.requiredPoints <= points)
                .OrderBy(b => b.requiredPoints)
                .ToListAsync();
        }
    }
}
