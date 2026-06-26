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
    public class VerificationRepository : GenericRepository<Verification>, IVerificationRepository
    {
        public VerificationRepository(BalaghDBContext context) : base(context)
        {
        }

        public async Task<bool> HasUserVerifiedAsync(string userId, string reportId)
        {
            return await _context.Verifications
                .AnyAsync(v => v.UserId == userId && v.ReportId == reportId);
        }

        public async Task<int> GetUpvoteCountAsync(string reportId)
        {
            return await _context.Verifications
                .CountAsync(v => v.ReportId == reportId && v.Vote > 0);
        }

        public async Task<int> GetDownvoteCountAsync(string reportId)
        {
            return await _context.Verifications
                .CountAsync(v => v.ReportId == reportId && v.Vote < 0);
        }

        public async Task<List<Verification>> GetByReportIdAsync(string reportId)
        {
            return await _context.Verifications
                .Where(v => v.ReportId == reportId)
                .Include(v => v.User)
                .ToListAsync();
        }
    }
}