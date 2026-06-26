using DEPI_Graduation_Project.Data.Context;
using DEPI_Graduation_Project.Entities;
using DEPI_Graduation_Project.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DEPI_Graduation_Project.Repositories
{
    public class CompanyRepository : GenericRepository<Company>, ICompanyRepository
    {
        public CompanyRepository(BalaghDBContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Company>> GetByServiceCategoryAsync(string categoryId)
        {
            return await _context.Companies
                .Where(c => c.ServiceCategoryId == categoryId)
                .Include(c => c.Area)
                .Include(c => c.ServiceCategory)
                .ToListAsync();
        }
    }
}
