using BLL.DTO;
using BLL.Interfaces;
using DEPI_Graduation_Project.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace BLL.Services
{
    public class AnalyticsService : IAnalyticsService
    {
        private readonly IAreaRepository _areaRepository;
        private readonly ITaskAssignmentRepository _taskAssignmentRepository;
        private readonly IReportRepository _reportRepository;

        public AnalyticsService(IAreaRepository areaRepository,
                                ITaskAssignmentRepository taskAssignmentRepository,
                                IReportRepository reportRepository)
        {
            _areaRepository = areaRepository;
            _taskAssignmentRepository = taskAssignmentRepository;
            _reportRepository = reportRepository;
        }

        public async Task<AnalyticsDTO> GetIssueStatsAsync()
        {
            var reports = await _reportRepository.GetAllAsync();
            var assignments = await _taskAssignmentRepository.GetAllAsync();

            return new AnalyticsDTO
            {
                TotalReports = reports.Count,
                PendingReports = reports.Count(r => r.Status == "Pending"),
                InProgressReports = reports.Count(r => r.Status == "InProgress"),
                ResolvedReports = reports.Count(r => r.Status == "Resolved"),
                TotalAssignments = assignments.Count,
                ReportsByCategory = reports
                    .GroupBy(r => r.IssueCategoryId ?? "Unknown")
                    .ToDictionary(g => g.Key, g => g.Count()),
                ReportsByArea = reports
                    .GroupBy(r => r.AreaId ?? "Unknown")
                    .ToDictionary(g => g.Key, g => g.Count())
            };
        }

        public async Task<IEnumerable<PredictionDTO>> PredictProblematicAreasAsync()
        {
            var areas = await _areaRepository.GetAllAsync();
            var reports = await _reportRepository.GetAllAsync();

            return areas.Select(area =>
            {
                var openReports = reports.Count(r =>
                    r.AreaId == area.AreaId &&
                    r.Status != "Resolved" && r.Status != "Rejected");

                var riskLevel = (area.HealthScore, openReports) switch
                {
                    _ when area.HealthScore < 30 || openReports > 20 => "High",
                    _ when area.HealthScore < 60 || openReports > 10 => "Medium",
                    _ => "Low"
                };

                return new PredictionDTO
                {
                    AreaId = area.AreaId,
                    HealthScore = area.HealthScore,
                    OpenReports = openReports,
                    RiskLevel = riskLevel
                };
            }).OrderBy(p => p.HealthScore);
        }

        public async Task UpdateAreaHealthScoreAsync(string areaId, float score)
        {
            await _areaRepository.UpdateHealthScoreAsync(areaId, score);
        }
    }
}
