using BLL.DTO;

namespace BLL.Interfaces
{
    public interface IAnalyticsService
    {
        Task<AnalyticsDTO> GetIssueStatsAsync();
        Task<IEnumerable<PredictionDTO>> PredictProblematicAreasAsync();
        Task UpdateAreaHealthScoreAsync(string areaId, float score);
    }
}
