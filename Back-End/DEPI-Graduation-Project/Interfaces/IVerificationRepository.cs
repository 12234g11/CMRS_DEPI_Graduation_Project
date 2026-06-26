using DEPI_Graduation_Project.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI_Graduation_Project.Interfaces
{
    public interface IVerificationRepository : IGenericRepository<Verification>
    {
        Task<bool> HasUserVerifiedAsync(string userId, string reportId);
        Task<int> GetUpvoteCountAsync(string reportId);
        Task<int> GetDownvoteCountAsync(string reportId);
        Task<List<Verification>> GetByReportIdAsync(string reportId);
    }
}