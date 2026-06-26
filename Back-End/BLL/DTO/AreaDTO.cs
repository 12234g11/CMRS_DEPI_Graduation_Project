using DEPI_Graduation_Project.Entities;

namespace BLL.DTO
{
    public class AreaDTO
    {
        public string AreaId { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string? Address { get; set; }
        public string? DetailedAddress { get; set; }
        public float HealthScore { get; set; }
    }

    public class UpdateAreaHealthScoreDTO
    {
        public float HealthScore { get; set; }
    }

    public class AnalyticsDTO
    {
        public int TotalReports { get; set; }
        public int PendingReports { get; set; }
        public int InProgressReports { get; set; }
        public int ResolvedReports { get; set; }
        public int TotalAssignments { get; set; }

        public Dictionary<string, int> ReportsByCategory { get; set; } = new();
        public Dictionary<string, int> ReportsByArea { get; set; } = new();
    }

    public class PredictionDTO
    {
        public string AreaId { get; set; } = string.Empty;
        public string AreaName { get; set; } = string.Empty;
        public float HealthScore { get; set; }
        public int OpenReports { get; set; }
        public string RiskLevel { get; set; } = string.Empty;
    }
}
