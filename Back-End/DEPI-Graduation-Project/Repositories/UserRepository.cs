using DEPI_Graduation_Project.Data.Context;
using DEPI_Graduation_Project.Entities;
using DEPI_Graduation_Project.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI_Graduation_Project.Repositories
{
    public class UserRepository : GenericRepository<ApplicationUser>, IUserRepository
    {
        private readonly UserManager<ApplicationUser> _userManager;

        public UserRepository(BalaghDBContext context, UserManager<ApplicationUser> userManager)
            : base(context)
        {
            _userManager = userManager;
        }

        public async Task<ApplicationUser?> GetByEmailAsync(string email)
        {
            return await _userManager.FindByEmailAsync(email);
        }

        public async Task<ApplicationUser?> GetByPhoneAsync(string phone)
        {
            return await _context.Users
                .FirstOrDefaultAsync(u => u.PhoneNumber == phone);
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            return await _userManager.FindByEmailAsync(email) is not null;
        }

        public async Task UpdateTrustScoreAsync(string userId, float score)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user is null)
                throw new KeyNotFoundException($"User with ID '{userId}' not found.");

            user.TrustScore = score;
            await _context.SaveChangesAsync();
        }

    }
}
