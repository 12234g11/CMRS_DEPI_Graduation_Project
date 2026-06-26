using BLL.DTO;
using BLL.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace PL.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class TaskAssignmentController : ApiBaseController
    {
        private readonly ITaskAssignmentService _taskAssignmentService;

        public TaskAssignmentController(ITaskAssignmentService taskAssignmentService)
        {
            _taskAssignmentService = taskAssignmentService;
        }

        /// <summary>
        /// Gets all task assignments. This endpoint is accessible by any authenticated user.
        /// </summary>
        /// <returns></returns>
        // GET api/taskassignment
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var tasks = await _taskAssignmentService.GetAllAsync();
            return Ok(tasks);
        }

        /// <summary>
        /// Gets a task assignment by its ID. This endpoint is accessible by any authenticated user.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        // GET api/taskassignment/{id}
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
        {
            var task = await _taskAssignmentService.GetByIdAsync(id);
            if (task == null) return NotFound();
            return Ok(task);
        }

        /// <summary>
        /// Creates a new task assignment. This endpoint is accessible by any authenticated user. The request body should contain the necessary information to create the task assignment.
        /// </summary>
        /// <param name="dto"></param>
        /// <returns></returns>
        // POST api/taskassignment
        [HttpPost]
        public async Task<IActionResult> Assign([FromBody] CreateTaskAssignmentDTO dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            var created = await _taskAssignmentService.AssignReportAsync(dto);
            return Ok(created);
        }

        /// <summary>
        /// Updates the status of a task assignment. This endpoint is accessible by any authenticated user. The request body should contain the new status for the task assignment.
        /// </summary>
        /// <param name="id"></param>
        /// <param name="dto"></param>
        /// <returns></returns>
        // PUT api/taskassignment/{id}/status
        [HttpPut("{id}/status")]
        public async Task<IActionResult> UpdateStatus(string id, [FromBody] UpdateTaskAssignmentStatusDTO dto)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);
            await _taskAssignmentService.UpdateStatusAsync(id, dto.Status);
            return NoContent();
        }

        /// <summary>
        /// Deletes a task assignment by its ID. This endpoint is accessible by any authenticated user.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        // DELETE api/taskassignment/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            await _taskAssignmentService.DeleteAsync(id);
            return NoContent();
        }

        /// <summary>
        /// Gets all task assignments for a specific team. This endpoint is accessible by any authenticated user.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        // GET api/taskassignment/team/{id}
        [HttpGet("team/{id}")]
        public async Task<IActionResult> GetByTeam(string id)
        {
            var tasks = await _taskAssignmentService.GetByTeamIdAsync(id);
            return Ok(tasks);
        }

        /// <summary>
        /// Gets all task assignments for a specific company. This endpoint is accessible by any authenticated user.
        /// </summary>
        /// <param name="id"></param>
        /// <returns></returns>
        // GET api/taskassignment/company/{id}
        [HttpGet("company/{id}")]
        public async Task<IActionResult> GetByCompany(string id)
        {
            var tasks = await _taskAssignmentService.GetByCompanyIdAsync(id);
            return Ok(tasks);
        }
    }
}
