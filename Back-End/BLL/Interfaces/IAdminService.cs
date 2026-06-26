using BLL.DTO;

namespace BLL.Interfaces
{
    public interface IAdminService
    {
        Task ApproveReportAsync(string reportId, string adminId);
        Task RejectReportAsync(string reportId, string adminId);
        Task AssignReportToTeamAsync(string reportId, string teamId, string assignedBy);
        Task<IEnumerable<ReportDTO>> GetFilteredReportsAsync(string? companyId = null,
                                                              string? status = null,
                                                              string? areaId = null);
        Task UploadProofAsync(string reportId, string imageUrl);
    }
}
