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
    public class ReportRatingRepository : GenericRepository<ReportRating>, IReportRatingRepository
    {
        public ReportRatingRepository(BalaghDBContext context) : base(context)
        {
        }

        // Get rating for specific report and specific user
        public async Task<ReportRating> GetReportRatingByUserIdAsync(string reportId, string CurrentUserId)
        {
            var reportRating = await _context.ReportRatings
                .FirstOrDefaultAsync(r => r.ReportId == reportId && r.UserId == CurrentUserId);
            return reportRating;
        }
    }
}
