using BLL.DTO;
using BLL.Interfaces;
using DEPI_Graduation_Project.Interfaces;

namespace BLL.Services
{
    public class AdminService : IAdminService
    {
        // AdminService accesses Report domain through IReportRepository interface.
        // TaskAssignment domain is accessed through ITaskAssignmentService — not its repository directly.
        // (cross-domain rule: no service bypasses another domain's service layer)
        private readonly IReportRepository _reportRepository;
        private readonly ITaskAssignmentService _taskAssignmentService;

        public AdminService(IReportRepository reportRepository,
                            ITaskAssignmentService taskAssignmentService)
        {
            _reportRepository = reportRepository;
            _taskAssignmentService = taskAssignmentService;
        }

        public async Task ApproveReportAsync(string reportId, string adminId)
        {
            await _reportRepository.UpdateReportStatusAsync(reportId, adminId, "Admin", "Approved");
        }

        public async Task RejectReportAsync(string reportId, string adminId)
        {
            await _reportRepository.UpdateReportStatusAsync(reportId, adminId, "Admin", "Rejected");
        }

        public async Task AssignReportToTeamAsync(string reportId, string teamId, string assignedBy)
        {
            await _taskAssignmentService.AssignReportAsync(new CreateTaskAssignmentDTO
            {
                ReportId = reportId,
                TeamId = teamId,
                AssignedBy = assignedBy
            });
        }

        public async Task<IEnumerable<ReportDTO>> GetFilteredReportsAsync(string? companyId = null,
                                                                           string? status = null,
                                                                           string? areaId = null)
        {
            var reports = await _reportRepository.GetAllAsync();

            if (!string.IsNullOrEmpty(status))
                reports = reports.Where(r => r.Status == status).ToList();

            if (!string.IsNullOrEmpty(areaId))
                reports = reports.Where(r => r.AreaId == areaId).ToList();

            return reports.Select(r => r.ToReportDTO());
        }

        public async Task UploadProofAsync(string reportId, string imageUrl)
        {
            var report = await _reportRepository.GetByIdAsync(reportId);
            if (report == null) throw new KeyNotFoundException("Report not found.");
            report.ReportImages.FirstOrDefault(ri => ri.ReportId == reportId).ImageUrl = imageUrl;
            await _reportRepository.UpdateAsync(report);
        }
    }
}
