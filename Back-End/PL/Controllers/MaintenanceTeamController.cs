using BLL.DTO;
using BLL.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace PL.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class MaintenanceTeamController : ApiBaseController
    {
        private readonly IMaintenanceTeamService _teamService;

        public MaintenanceTeamController(IMaintenanceTeamService teamService)
        {
            _teamService = teamService;
        }

        /// <summary>
        /// Gets all maintenance teams. This endpoint is accessible by any authenticated user.
        /// </summary>
        /// <returns></returns>
        // GET api/maintenanceteam
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var teams = await _teamService.GetAllAsync();
            return Ok(teams);
        }

        /// <summary>
        /// Gets a maintenance team by its ID. This endpoint is accessible by any authenticated user.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        // GET api/maintenanceteam/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var team = await _teamService.GetByIdAsync(id);
            if (team == null) return NotFound();
            return Ok(team);
        }

        /// <summary>
        /// Creates a new maintenance team. This endpoint is accessible by any authenticated user. The request body should contain the necessary information to create the team.
        /// </summary>
        /// <param name="dto"></param>
        /// <returns></returns>
        // POST api/maintenanceteam
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateMaintenanceTeamDTO dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var created = await _teamService.CreateAsync(dto);
            return Ok(created);
        }

        /// <summary>
        /// Updates an existing maintenance team. This endpoint is accessible by any authenticated user. The request body should contain the updated information for the team.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        // DELETE api/maintenanceteam/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            await _teamService.DeleteAsync(id);
            return NoContent();
        }
    }
}
