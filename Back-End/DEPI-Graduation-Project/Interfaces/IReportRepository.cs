using DEPI_Graduation_Project.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI_Graduation_Project.Interfaces
{
    public interface IReportRepository : IGenericRepository<Report>
    {
        Task<IEnumerable<Report>> GetAllReportsForUserAsync(string currentUserId);
        Task<IEnumerable<Report>> GetAllReportsWithImagesAsync();
        Task<Report> GetReportByIdAsync(string id);
        Task<List<Report>> GetReportsByUserIdAsync(string id);
        Task<List<Report>> GetReportsByAreaAsync(string id);
        Task<int> UpdateReportStatusAsync(string id, string changedBy, string role, string status);
        Task<IEnumerable<Report>> GetReportByCategoryIdAsync(string id);
        Task<int> GetNumberOfReportsByStatusAsync(string status);
        Task<int> GetNumberOfReportsByUserAsync(string id);
        Task<IEnumerable<Report>> GetNearbyAsync(float lat, float lng, float radiusKm);
        Task<int> GetNumberOfReportsAsync();
        Task<int> GetTotalNumberOfRatings(string id);

    }
}
