using BLL.DTO;
using BLL.Interfaces;
using DEPI_Graduation_Project.Entities;
using DEPI_Graduation_Project.Interfaces;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Services
{
    public class UserService : IUserService
    {
        private readonly IUserRepository _userRepository;
        private readonly IUserBadgeRepository _userBadgeRepository;
        private readonly UserManager<ApplicationUser> _userManager;

        public UserService(IUserRepository userRepository, IUserBadgeRepository userBadgeRepository, UserManager<ApplicationUser> userManager)
        {
            _userRepository = userRepository;
            _userBadgeRepository = userBadgeRepository;
            _userManager = userManager;
        }

        public async Task<ProfileDTO> GetProfileAsync(string userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user is null)
                throw new KeyNotFoundException("لا يوجد مستخدم بهذا المعرف.");

            var userBadges = await _userBadgeRepository.GetByUserIdAsync(userId);

            return MapToProfileDTO(user, userBadges);
        }

        public async Task<ProfileDTO> UpdateProfileAsync(string userId, UpdateProfileDTO dto)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user is null)
                throw new KeyNotFoundException("لا يوجد مستخدم بهذا المعرف.");

            if (!string.IsNullOrWhiteSpace(dto.UserName))
                user.UserName = dto.UserName;

            if (!string.IsNullOrWhiteSpace(dto.PhoneNumber))
                user.PhoneNumber = dto.PhoneNumber;

            if (!string.IsNullOrWhiteSpace(dto.Email))
            {
                var existingUser = await _userManager.FindByEmailAsync(dto.Email);
                if (existingUser != null && existingUser.Id != userId)
                    throw new InvalidOperationException("هذا البريد الإلكتروني مستخدم بالفعل.");
                user.Email = dto.Email;
            }

            await _userRepository.UpdateAsync(user);

            var userBadges = await _userBadgeRepository.GetByUserIdAsync(userId);
            await _userManager.UpdateAsync(user);

            return MapToProfileDTO(user, userBadges);
        }

        // ── Helpers ──────────────────────────────────────────────────────────
        private static ProfileDTO MapToProfileDTO(
            ApplicationUser user,
            IEnumerable<UserBadge> userBadges)
        {
            return new ProfileDTO
            {
                UserName = user.UserName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                TrustScore = user.TrustScore,
                CreatedAt = user.CreatedAt,
                Badges = userBadges.Select(ub => new UserBadgeDTO
                {
                    UserBadgeId = ub.UserBadgeId,
                    AwardedAt = ub.AwardedAt,
                    Badge = new BadgeDTO
                    {
                        BadgeId = ub.Badge.badgeId,
                        Name = ub.Badge.Name,
                        Description = ub.Badge.Description,
                        RequiredPoints = ub.Badge.requiredPoints,
                        IconUrl = ub.Badge.IconUrl
                    }
                })
            };
        }
    }
}
