using BLL.DTO;
using BLL.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace PL.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class FollowController : ApiBaseController
    {
        private readonly IFollowService _followService;

        public FollowController(IFollowService followService)
        {
            _followService = followService;
        }

        /// <summary>
        /// Follows a report. This endpoint allows a user to follow a specific report by providing the necessary information in the request body.
        /// </summary>
        /// <param name="dto"></param>
        /// <returns></returns>
        [HttpPost]
        public async Task<IActionResult> Follow([FromBody] CreateFollowDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var follow = await _followService.FollowReportAsync(dto);
            return Ok(follow);
        }

        /// <summary>
        /// Unfollows a report. This endpoint allows a user to unfollow a specific report by providing the user ID and report ID as query parameters.
        /// </summary>
        /// <param name="userId"></param>
        /// <param name="reportId"></param>
        /// <returns></returns>
        [HttpDelete]
        public async Task<IActionResult> Unfollow([FromQuery] string userId, [FromQuery] string reportId)
        {
            await _followService.UnfollowReportAsync(userId, reportId);
            return NoContent();
        }

        /// <summary>
        /// Checks if a user is following a specific report. This endpoint returns a boolean indicating whether the user is following the report or not.
        /// </summary>
        /// <param name="reportId"></param>
        /// <param name="userId"></param>
        /// <returns></returns>
        [HttpGet("{reportId}/is-following")]
        public async Task<IActionResult> IsFollowing([FromRoute] string reportId, [FromQuery] string userId)
        {
            var isFollowing = await _followService.IsFollowingAsync(userId, reportId);
            return Ok(isFollowing);
        }

        /// <summary>
        /// Gets all reports followed by a specific user. This endpoint returns a list of reports that the user is currently following.
        /// </summary>
        /// <param name="userId"></param>
        /// <returns></returns>
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetFollowedReports(string userId)
        {
            var follows = await _followService.GetFollowedReportsByUserIdAsync(userId);
            return Ok(follows);
        }

        /// <summary>
        /// Gets all users following a specific report. This endpoint returns a list of users who are currently following the specified report.
        /// </summary>
        /// <param name="reportId"></param>
        /// <returns></returns>
        [HttpGet("report/{reportId}")]
        public async Task<IActionResult> GetFollowers(string reportId)
        {
            var followers = await _followService.GetFollowersByReportIdAsync(reportId);
            return Ok(followers);
        }
    }
}