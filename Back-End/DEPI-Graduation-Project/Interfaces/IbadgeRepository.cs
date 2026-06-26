using DEPI_Graduation_Project.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI_Graduation_Project.Interfaces
{
    public interface IBadgeRepository : IGenericRepository<Badge>
    {
        Task<Badge?> GetByNameAsync(string name);
        Task<IEnumerable<Badge>> GetBadgesByMaxPointsAsync(int points);
    }
}
