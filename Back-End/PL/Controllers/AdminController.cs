using BLL.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace PL.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize(Roles = "Admin")]
    public class AdminController : ApiBaseController
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        /// <summary>
        /// Approves a report with the given ID. Only accessible by users with the "Admin" role.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        // PUT api/admin/reports/{id}/approve
        [HttpPut("reports/{id}/approve")]
        public async Task<IActionResult> ApproveReport(string id)
        {
            var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            await _adminService.ApproveReportAsync(id, adminId);
            return NoContent();
        }

        /// <summary>
        /// Rejects a report with the given ID. Only accessible by users with the "Admin" role.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        // PUT api/admin/reports/{id}/reject
        [HttpPut("reports/{id}/reject")]
        public async Task<IActionResult> RejectReport(string id)
        {
            var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            await _adminService.RejectReportAsync(id, adminId);
            return NoContent();
        }

        /// <summary>
        /// Assigns a report to a team. Only accessible by users with the "Admin" role.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="teamId"></param>
        /// <returns></returns>
        // POST api/admin/reports/{id}/assign
        [HttpPost("reports/{id}/assign")]
        public async Task<IActionResult> AssignToTeam(string id, [FromQuery] string teamId)
        {
            var adminId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
            await _adminService.AssignReportToTeamAsync(id, teamId, adminId);
            return NoContent();
        }

        /// <summary>
        /// Retrieves reports filtered by company ID, status, and area ID. Only accessible by users with the "Admin" role.
        /// </summary>
        /// <param name="companyId"></param>
        /// <param name="status"></param>
        /// <param name="areaId"></param>
        /// <returns></returns>
        // GET api/admin/reports?status=&areaId=&companyId=
        [HttpGet("reports")]
        public async Task<IActionResult> GetFilteredReports([FromQuery] string? companyId,
                                                             [FromQuery] string? status,
                                                             [FromQuery] string? areaId)
        {
            var reports = await _adminService.GetFilteredReportsAsync(companyId, status, areaId);
            return Ok(reports);
        }

        /// <summary>
        /// Uploads a proof image for a report. Only accessible by users with the "Admin" role.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="imageUrl"></param>
        /// <returns></returns>
        // POST api/admin/reports/{id}/proof
        [HttpPost("reports/{id}/proof")]
        public async Task<IActionResult> UploadProof(string id, [FromBody] string imageUrl)
        {
            await _adminService.UploadProofAsync(id, imageUrl);
            return NoContent();
        }
    }
}

