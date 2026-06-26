using DEPI_Graduation_Project.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI_Graduation_Project.Interfaces
{
    public interface IReportRatingRepository : IGenericRepository<ReportRating>
    {
        Task<ReportRating> GetReportRatingByUserIdAsync(string reportId, string CurrentUserId);

    }
}
