using BLL.DTO;
using BLL.Interfaces;
using DEPI_Graduation_Project.Entities;
using DEPI_Graduation_Project.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Services
{
    public class BadgeService : IBadgeService
    {
        private readonly IBadgeRepository _badgeRepository;
        private readonly IUserBadgeRepository _userBadgeRepository;

        public BadgeService(IBadgeRepository badgeRepository, IUserBadgeRepository userBadgeRepository)
        {
            _badgeRepository = badgeRepository;
            _userBadgeRepository = userBadgeRepository;
        }

        public async Task<IEnumerable<UserBadgeDTO>> GetUserBadgesAsync(string userId)
        {
            var userBadges = await _userBadgeRepository.GetByUserIdAsync(userId);

            return userBadges.Select(ub => new UserBadgeDTO
            {
                UserBadgeId = ub.UserBadgeId,
                AwardedAt = ub.AwardedAt,
                Badge = ub.Badge.ToDTO()
            });
        }

        public async Task<UserBadgeDTO> AwardBadgeAsync(string userId, string badgeId)
        {
            var alreadyAwarded = await _userBadgeRepository.ExistsAsync(userId, badgeId);
            if (alreadyAwarded)
                throw new InvalidOperationException("User already has this badge.");

            var badge = await _badgeRepository.GetByIdAsync(badgeId);
            if (badge is null)
                throw new KeyNotFoundException($"Badge with ID '{badgeId}' not found.");

            var userBadge = new UserBadge
            {
                UserBadgeId = Guid.NewGuid().ToString(),
                UserId = userId,
                BadgeId = badgeId,
                AwardedAt = DateTime.UtcNow
            };

            await _userBadgeRepository.AddAsync(userBadge);

            return new UserBadgeDTO
            {
                UserBadgeId = userBadge.UserBadgeId,
                AwardedAt = userBadge.AwardedAt,
                Badge = new BadgeDTO
                {
                    BadgeId = badge.badgeId,
                    Name = badge.Name,
                    Description = badge.Description,
                    RequiredPoints = badge.requiredPoints,
                    IconUrl = badge.IconUrl
                }
            };
        }

        public async Task<bool> RevokeBadgeAsync(string userId, string badgeId)
        {
            var userBadge = await _userBadgeRepository.GetByUserAndBadgeAsync(userId, badgeId);
            if (userBadge is null)
                return false;

            await _userBadgeRepository.DeleteAsync(userBadge.UserBadgeId);
            return true;
        }

        public async Task CheckAndAwardBadgesAsync(string userId, int currentPoints)
        {
            var eligibleBadges = await _badgeRepository.GetBadgesByMaxPointsAsync(currentPoints);

            foreach (var badge in eligibleBadges)
            {
                var alreadyAwarded = await _userBadgeRepository.ExistsAsync(userId, badge.badgeId);
                if (!alreadyAwarded)
                {
                    var userBadge = new UserBadge
                    {
                        UserBadgeId = Guid.NewGuid().ToString(),
                        UserId = userId,
                        BadgeId = badge.badgeId,
                        AwardedAt = DateTime.UtcNow
                    };
                    await _userBadgeRepository.AddAsync(userBadge);
                }
            }
        }
    }
}
