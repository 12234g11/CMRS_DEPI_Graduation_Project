using BLL.DTO;
using BLL.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace PL.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AnalyticsController : ApiBaseController
    {
        private readonly IAnalyticsService _analyticsService;

        public AnalyticsController(IAnalyticsService analyticsService)
        {
            _analyticsService = analyticsService;
        }

        /// <summary>
        /// Gets analytics statistics about reported issues, including counts, trends, and other relevant metrics. Only accessible by users with the "Admin" role.
        /// </summary>
        /// <returns></returns>
        // GET api/analytics/stats
        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var stats = await _analyticsService.GetIssueStatsAsync();
            return Ok(stats);
        }

        /// <summary>
        /// Gets predictions for areas that are likely to have problematic issues in the future based on historical data and trends. Only accessible by users with the "Admin" role.
        /// </summary>
        /// <returns></returns>
        // GET api/analytics/predictions
        [HttpGet("predictions")]
        public async Task<IActionResult> GetPredictions()
        {
            var predictions = await _analyticsService.PredictProblematicAreasAsync();
            return Ok(predictions);
        }

        /// <summary>
        /// Updates the health score of a specific area. Only accessible by users with the "Admin" role.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="dto"></param>
        /// <returns></returns>
        // PUT api/analytics/areas/{id}/health
        [HttpPut("areas/{id}/health")]
        public async Task<IActionResult> UpdateAreaHealth(string id, [FromBody] UpdateAreaHealthScoreDTO dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            await _analyticsService.UpdateAreaHealthScoreAsync(id, dto.HealthScore);
            return NoContent();
        }
    }
}
