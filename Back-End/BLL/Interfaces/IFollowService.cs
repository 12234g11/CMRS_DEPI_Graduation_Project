using BLL.DTO;

namespace BLL.Interfaces
{
    public interface IFollowService
    {
        Task<FollowDTO> FollowReportAsync(CreateFollowDTO dto);
        Task UnfollowReportAsync(string userId, string reportId);
        Task<bool> IsFollowingAsync(string userId, string reportId);
        Task<List<FollowDTO>> GetFollowedReportsByUserIdAsync(string userId);
        Task<List<FollowDTO>> GetFollowersByReportIdAsync(string reportId);
    }
}