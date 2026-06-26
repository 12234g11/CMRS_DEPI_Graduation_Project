using DEPI_Graduation_Project.Data.Context;
using DEPI_Graduation_Project.Entities;
using DEPI_Graduation_Project.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DEPI_Graduation_Project.Repositories
{
    public class AreaRepository : GenericRepository<Area>, IAreaRepository
    {
        public AreaRepository(BalaghDBContext context) : base(context)
        {
        }

        public async Task UpdateHealthScoreAsync(string areaId, float score)
        {
            var area = await _context.Areas.FindAsync(areaId);
            if (area == null) throw new KeyNotFoundException("Area not found.");
            area.HealthScore = score;
            await _context.SaveChangesAsync();
        }

        public async Task<Area?> GetByDetailsAsync(string city, string address, string detailedAddress)
        {
            return await _context.Areas.FirstOrDefaultAsync(a =>
                    a.City == city &&
                    a.Address == address &&
                    a.DetailedAddress == detailedAddress);
        }
    }
}
