using BLL.DTO;
using BLL.Interfaces;
using DEPI_Graduation_Project.Interfaces;

namespace BLL.Services
{
    public class FollowService : IFollowService
    {
        private readonly IFollowRepository _followRepository;

        public FollowService(IFollowRepository followRepository)
        {
            _followRepository = followRepository;
        }

        public async Task<FollowDTO> FollowReportAsync(CreateFollowDTO dto)
        {
            var alreadyFollowing = await _followRepository.IsFollowingAsync(dto.UserId, dto.ReportId);
            if (alreadyFollowing)
                throw new InvalidOperationException("User is already following this report");

            var follow = dto.ToFollow();
            await _followRepository.AddAsync(follow);
            return follow.ToFollowDTO();
        }

        public async Task UnfollowReportAsync(string userId, string reportId)
        {
            await _followRepository.UnfollowAsync(userId, reportId);
        }

        public async Task<bool> IsFollowingAsync(string userId, string reportId)
        {
            return await _followRepository.IsFollowingAsync(userId, reportId);
        }

        public async Task<List<FollowDTO>> GetFollowedReportsByUserIdAsync(string userId)
        {
            var follows = await _followRepository.GetFollowedReportsByUserIdAsync(userId);
            return follows.Select(f => f.ToFollowDTO()).ToList();
        }

        public async Task<List<FollowDTO>> GetFollowersByReportIdAsync(string reportId)
        {
            var follows = await _followRepository.GetFollowersByReportIdAsync(reportId);
            return follows.Select(f => f.ToFollowDTO()).ToList();
        }
    }
}