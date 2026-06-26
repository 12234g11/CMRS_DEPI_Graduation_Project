using DEPI_Graduation_Project.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI_Graduation_Project.Interfaces
{
    public interface IUserRepository : IGenericRepository<ApplicationUser>
    {
        Task<ApplicationUser?> GetByEmailAsync(string email);
        Task<ApplicationUser?> GetByPhoneAsync(string phone);
        Task<bool> EmailExistsAsync(string email);
        Task UpdateTrustScoreAsync(string userId, float score);
    }
}
