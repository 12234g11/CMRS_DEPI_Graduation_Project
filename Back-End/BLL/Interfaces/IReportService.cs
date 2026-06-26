using BLL.DTO;

namespace BLL.Interfaces
{
    public interface IReportService
    {
        Task<List<ReportDTO>> GetAllReportsForUserAsync(string currentUserId);
        Task<ReportDTO> GetByIdAsync(string id);
        Task<List<ReportDTO>> GetAllAsync();
        Task AddAsync(CreateReportDTO entity, string userId);
        Task<ReportDTO> UpdateAsync(string id, UpdateReportDTO entity);
        Task DeleteAsync(string id);
        Task<List<ReportDTO>> GetReportsByUserIdAsync(string id);
        Task<List<ReportDTO>> GetReportsByAreaAsync(string id);
        Task UpdateReportStatusAsync(string id, string changedBy, string role, string status);
        Task<IEnumerable<ReportDTO>> GetReportByCategoryIdAsync(string id);
        Task<int> GetNumberOfReportsByStatusAsync(string status);
        Task<int> GetNumberOfReportsByUserAsync(string id);
        Task<IEnumerable<ReportDTO>> GetNearbyAsync(float lat, float lng, float radiusKm);
        Task<int> GetNumberOfReportsAsync();
        Task<int> GetTotalNumberOfRatings(string id);

    }
}