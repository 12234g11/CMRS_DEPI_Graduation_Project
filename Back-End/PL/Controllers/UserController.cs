using BLL.DTO;
using BLL.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace PL.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ApiBaseController
    {
        private readonly IUserService _userService;
        private readonly IBadgeService _badgeService;

        public UserController(IUserService userService, IBadgeService badgeService)
        {
            _userService = userService;
            _badgeService = badgeService;
        }

        /// <summary>
        /// Get the profile of the currently authenticated user. Only accessible by the user themselves.
        /// </summary>
        /// <returns></returns>
        // GET /api/users/me
        [HttpGet("me")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> GetMyProfile()
        {
            var profile = await _userService.GetProfileAsync(CurrentUserId);
            return Ok(profile);
        }

        /// <summary>
        /// Update the profile of the currently authenticated user. Only accessible by the user themselves.
        /// </summary>
        /// <param name="dto"></param>
        /// <returns></returns>
        // PUT /api/users/me
        [HttpPut("me")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateProfileDTO dto)
        {
            var updated = await _userService.UpdateProfileAsync(CurrentUserId, dto);
            return Ok(updated);
        }

        /// <summary>
        /// Get all badges for a specific user. Accessible by the user themselves or Admins.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        // GET /api/users/{id}/badges
        [HttpGet("{id}/badges")]
        [Authorize(Roles = "User, Admin")]
        public async Task<IActionResult> GetUserBadges(string id)
        {
            var badges = await _badgeService.GetUserBadgesAsync(id);
            return Ok(badges);
        }

        /// <summary>
        /// Award a badge to a user. Only accessible by Admins.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="dto"></param>
        /// <returns></returns>
        // POST /api/users/{id}/badges
        [HttpPost("{id}/badges")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> AwardBadge(string id, [FromBody] AwardBadgeDTO dto)
        {
            try
            {
                var awarded = await _badgeService.AwardBadgeAsync(id, dto.BadgeId);
                return Ok(awarded);
            }
            catch (InvalidOperationException ex)
            {
                return Conflict(new { message = ex.Message });
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { message = ex.Message });
            }
        }

        /// <summary>
        /// Revoke a badge from a user. Only accessible by Admins.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="badgeId"></param>
        /// <returns></returns>
        // DELETE /api/users/{id}/badges/{badgeId}
        [HttpDelete("{id}/badges/{badgeId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> RevokeBadge(string id, string badgeId)
        {
            var removed = await _badgeService.RevokeBadgeAsync(id, badgeId);
            if (!removed)
                return NotFound(new { message = "This user does not have that badge." });

            return NoContent();
        }

    }
}
