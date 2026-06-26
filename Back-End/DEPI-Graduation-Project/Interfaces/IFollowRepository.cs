using DEPI_Graduation_Project.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI_Graduation_Project.Interfaces
{
    public interface IFollowRepository : IGenericRepository<Follow>
    {
        Task<bool> IsFollowingAsync(string userId, string reportId);
        Task<List<Follow>> GetFollowersByReportIdAsync(string reportId);
        Task<List<Follow>> GetFollowedReportsByUserIdAsync(string userId);
        Task<int> UnfollowAsync(string userId, string reportId);
    }
}