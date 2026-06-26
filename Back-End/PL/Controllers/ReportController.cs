using BLL.DTO;
using BLL.Interfaces;
using DEPI_Graduation_Project.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace PL.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ReportController : ApiBaseController
    {
        private readonly IReportService _reportService;
        private readonly IGenericService<IssueCategory> _issueCategoryService;
        private readonly IGenericService<Area> _areaService;
        private readonly IReportRatingService _reportRatingService;

        public ReportController(IReportService reportService, IGenericService<IssueCategory> issueCategory, IGenericService<Area> areaService, IReportRatingService reportRatingService)
        {
            _reportService = reportService;
            _issueCategoryService = issueCategory;
            _areaService = areaService;
            _reportRatingService = reportRatingService;
        }

        /// <summary>
        /// Get All Report For Admins only
        /// </summary>
        /// <returns></returns>
        [HttpGet("getAll")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAll()
        {
            var reports = await _reportService.GetAllAsync();
            return Ok(reports);
        }

        /// <summary>
        /// Get All Reports for Users and Accessible by Admins
        /// </summary>
        /// <returns></returns>
        [HttpGet("user/getAll")]
        [Authorize(Roles = "Admin,User")]
        public async Task<IActionResult> GetAllReportsForUser()
        {
            if (string.IsNullOrEmpty(CurrentUserId))
                return Unauthorized("يجب تقديم معرف المستخدم.");
            var reports = await _reportService.GetAllReportsForUserAsync(CurrentUserId);
            return Ok(reports);
        }

        /// <summary>
        /// Gets a report by its ID. This endpoint is accessible by any authenticated user.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var report = await _reportService.GetByIdAsync(id);
            if (report == null)
                return NotFound();
            return Ok(report);
        }

        /// <summary>
        /// Creates a new report. This endpoint is accessible by any authenticated user. The request body should contain the necessary information to create the report.
        /// </summary>
        /// <param name="reportDto"></param>
        /// <returns></returns>
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Create([FromForm] CreateReportDTO dto)
        {

            if (string.IsNullOrEmpty(CurrentUserId))
                return Unauthorized("يجب تقديم معرف المستخدم.");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            await _reportService.AddAsync(dto, CurrentUserId);

            return Ok();
        }

        /// <summary>
        /// Updates an existing report. This endpoint is accessible by any authenticated user. The request body should contain the necessary information to update the report.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="dto"></param>
        /// <returns></returns>
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] UpdateReportDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var updated = await _reportService.UpdateAsync(id, dto);
            return Ok(updated);
        }

        /// <summary>
        /// Deletes a report by its ID. This endpoint is accessible by any authenticated user.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> Delete(string id)
        {
            await _reportService.DeleteAsync(id);
            return NoContent();
        }

        /// <summary>
        /// Gets reports that are nearby a specific location within a given radius. This endpoint is accessible by any authenticated user.
        /// </summary>
        /// <param name="lat"></param>
        /// <param name="lng"></param>
        /// <param name="radiusKm"></param>
        /// <returns></returns>
        [HttpGet("nearby")]
        public async Task<IActionResult> GetNearby([FromQuery] float lat,
                                                    [FromQuery] float lng,
                                                    [FromQuery] float radiusKm = 5)
        {
            var reports = await _reportService.GetNearbyAsync(lat, lng, radiusKm);
            return Ok(reports);
        }

        /// <summary>
        /// Gets reports submitted by a specific user. This endpoint is accessible by any authenticated user.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("user/{id}")]
        public async Task<IActionResult> GetByUser(string id)
        {
            var reports = await _reportService.GetReportsByUserIdAsync(id);
            return Ok(reports);
        }

        /// <summary>
        /// Gets reports associated with a specific area. This endpoint is accessible by any authenticated user.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("area/{id}")]
        public async Task<IActionResult> GetByArea(string id)
        {
            var reports = await _reportService.GetReportsByAreaAsync(id);
            return Ok(reports);
        }

        /// <summary>
        /// Gets reports associated with a specific category. This endpoint is accessible by any authenticated user.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("category/{id}")]
        public async Task<IActionResult> GetReportByCategory(string id)
        {
            var reports = await _reportService.GetReportByCategoryIdAsync(id);
            return Ok(reports);
        }

        /// <summary>
        /// Gets the total number of reports in the system. This endpoint is accessible by any authenticated user.
        /// </summary>
        /// <returns></returns>
        [HttpGet("count")]
        public async Task<IActionResult> GetNumberOfReports()
        {
            var count = await _reportService.GetNumberOfReportsAsync();
            return Ok(count);
        }

        /// <summary>
        /// Gets the number of reports with a specific status. This endpoint is accessible by any authenticated user.
        /// </summary>
        /// <param name="status"></param>
        /// <returns></returns>
        [HttpGet("count/status/{status}")]
        public async Task<IActionResult> GetNumberOfReportsByStatus(string status)
        {
            var count = await _reportService.GetNumberOfReportsByStatusAsync(status);
            return Ok(count);
        }

        /// <summary>
        /// Gets the number of reports submitted by a specific user. This endpoint is accessible by any authenticated user.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("count/user/{id}")]
        public async Task<IActionResult> GetNumberOfReportsByUser(string id)
        {
            var count = await _reportService.GetNumberOfReportsByUserAsync(id);
            return Ok(count);
        }

        /// <summary>
        /// Gets an issue category by its ID. This endpoint is accessible by any authenticated user.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("categories/{id}")]
        public async Task<IActionResult> GetCategoryById(string id)
        {
            var category = await _issueCategoryService.GetByIdAsync(id);
            return Ok(category);
        }

        /// <summary>
        /// Gets all issue categories. This endpoint is accessible by any authenticated user.
        /// </summary>
        /// <returns></returns>
        [HttpGet("categories")]
        public async Task<IActionResult> GetAllCategories()
        {
            var categories = await _issueCategoryService.GetAllAsync();
            return Ok(categories);
        }

        /// <summary>
        /// Gets an area by its ID. This endpoint is accessible by any authenticated user.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("Areas/{id}")]
        public async Task<IActionResult> GetAreaById(string id)
        {
            var area = await _areaService.GetByIdAsync(id);
            return Ok(area);
        }
        /// <summary>
        /// Gets all areas. This endpoint is accessible by any authenticated user.
        /// </summary>
        /// <returns></returns>
        [HttpGet("Areas")]
        public async Task<IActionResult> GetAllAreas()
        {
            var areas = await _areaService.GetAllAsync();
            return Ok(areas);
        }

        /// <summary>
        /// Adds a rating for a report. This endpoint allows a user to rate a specific report by providing the necessary information in the request body.
        /// </summary>
        /// <param name="dto"></param>
        /// <returns></returns>
        [HttpPost("ratings")]
        public async Task<IActionResult> AddReportRating(ReportRatingDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            await _reportRatingService.AddAsync(dto, CurrentUserId);
            return Ok("Rating Successful");
        }

        /// <summary>
        /// Gets the rating for a specific report. This endpoint returns the rating information for the report identified by the provided report ID.
        /// </summary>
        /// <param name="reportId"></param>
        /// <returns></returns>
        [HttpGet("ratings/{id}")]
        public async Task<IActionResult> GetReportRating(string id)
        {
            var rating = await _reportRatingService.GetByIdAsync(id);
            return Ok(rating);
        }

        /// <summary>
        /// Gets the total number of ratings for a specific report. This endpoint returns the total count of ratings associated with the report identified by the provided report ID.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        [HttpGet("ratings/total/{id}")]
        public async Task<IActionResult> GetTotalRatings(string id)
        {
            var ratings = await _reportService.GetTotalNumberOfRatings(id);
            return Ok(ratings);
        }
        /// <summary>
        /// Gets the rating for a specific report submitted by the current user. This endpoint returns the rating information for the report identified by the provided report ID and the current user's ID.
        /// </summary>
        /// <param name="reportId"></param>
        /// <returns></returns>
        [HttpGet("report/rating/{reportId}")]
        public async Task<IActionResult> GetReportSpecificRating(string reportId)
        {
            var rating = await _reportRatingService.GetByReportIdAndUserIdAsync(reportId, CurrentUserId);
            return Ok(rating);
        }

        [HttpPut("ratings/{id}")]
        public async Task<IActionResult> UpdateReportRating(string id, UpdateReportRatingDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (id != dto.ReportRatingId)
            {
                return BadRequest("Report rating not found");
            }

            await _reportRatingService.UpdateAsync(id, dto);
            return Ok("Rating Updated Successfully");
        }

        /// <summary>
        /// Updates the status of a report. This endpoint allows an admin user to update the status of a specific report by providing the necessary information in the request body.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="dto"></param>
        /// <returns></returns>
        [HttpPut("status/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateReportStatus(string id, UpdateReportStatusDTO dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            if (id != dto.ReportId)
            {
                return BadRequest("Report not found");
            }

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var Role = User.FindFirst(ClaimTypes.Role)?.Value;

            await _reportService.UpdateReportStatusAsync(id, userId, Role, dto.status);
            return Ok("Report Status Updated Successfully");
        }
    }
}