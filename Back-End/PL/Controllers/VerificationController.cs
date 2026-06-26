using BLL.DTO;
using BLL.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace PL.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class VerificationController : ApiBaseController
    {
        private readonly IVerificationService _verificationService;

        public VerificationController(IVerificationService verificationService)
        {
            _verificationService = verificationService;
        }

        /// <summary>
        /// Submits a vote for a report verification. This endpoint is accessible by any authenticated user. The request body should contain the necessary information to submit the vote.
        /// </summary>
        /// <param name="dto"></param>
        /// <returns></returns>
        [HttpPost("vote")]
        public async Task<IActionResult> Vote([FromBody] CreateVerificationDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var verification = await _verificationService.SubmitVoteAsync(dto);
            return Ok(verification);
        }

        /// <summary>
        /// Checks if a user has voted on a specific report. This endpoint returns a boolean indicating whether the user has already submitted a vote for the report or not.
        /// </summary>
        /// <param name="reportId"></param>
        /// <param name="userId"></param>
        /// <returns></returns>
        [HttpGet("{reportId}/has-voted")]
        public async Task<IActionResult> HasVoted([FromRoute] string reportId, [FromQuery] string userId)
        {
            var hasVoted = await _verificationService.HasUserVerifiedAsync(userId, reportId);
            return Ok(hasVoted);
        }

        /// <summary>
        /// Gets the summary of verifications for a specific report. This endpoint returns the total number of votes, the number of positive votes, and the number of negative votes for the report.
        /// </summary>
        /// <param name="reportId"></param>
        /// <returns></returns>
        [HttpGet("{reportId}/summary")]
        public async Task<IActionResult> GetSummary(string reportId)
        {
            var summary = await _verificationService.GetVerificationSummaryAsync(reportId);
            return Ok(summary);
        }

        /// <summary>
        /// Gets all verifications for a specific report. This endpoint returns a list of all verifications submitted for the report, including the user ID, vote type, and timestamp of each verification.
        /// </summary>
        /// <param name="reportId"></param>
        /// <returns></returns>
        [HttpGet("{reportId}")]
        public async Task<IActionResult> GetByReport(string reportId)
        {
            var verifications = await _verificationService.GetByReportIdAsync(reportId);
            return Ok(verifications);
        }
    }
}