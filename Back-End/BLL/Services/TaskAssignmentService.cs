using BLL.DTO;
using BLL.Interfaces;
using DEPI_Graduation_Project.Entities;
using DEPI_Graduation_Project.Interfaces;

namespace BLL.Services
{
    public class TaskAssignmentService : ITaskAssignmentService
    {
        private readonly ITaskAssignmentRepository _taskAssignmentRepository;

        public TaskAssignmentService(ITaskAssignmentRepository taskAssignmentRepository)
        {
            _taskAssignmentRepository = taskAssignmentRepository;
        }

        public async Task<TaskAssignmentDTO> GetByIdAsync(string id)
        {
            var task = await _taskAssignmentRepository.GetByIdAsync(id);
            if (task == null) throw new KeyNotFoundException("Task assignment not found.");
            return task.ToTaskAssignmentDTO();
        }

        public async Task<List<TaskAssignmentDTO>> GetAllAsync()
        {
            var tasks = await _taskAssignmentRepository.GetAllAsync();
            return tasks.Select(t => t.ToTaskAssignmentDTO()).ToList();
        }

        public async Task<TaskAssignmentDTO> AssignReportAsync(CreateTaskAssignmentDTO dto)
        {
            var task = new TaskAssignment
            {
                TaskId     = Guid.NewGuid().ToString(),
                ReportId   = dto.ReportId,
                TeamId     = dto.TeamId,
                CompanyId  = dto.CompanyId,
                AssignedBy = dto.AssignedBy,
                Status     = "Assigned",
                AssignedAt = DateTime.UtcNow
            };
            await _taskAssignmentRepository.AddAsync(task);
            return task.ToTaskAssignmentDTO();
        }

        public async Task UpdateStatusAsync(string taskId, string status)
        {
            await _taskAssignmentRepository.UpdateStatusAsync(taskId, status);
        }

        public async Task DeleteAsync(string id)
        {
            await _taskAssignmentRepository.DeleteAsync(id);
        }

        public async Task<IEnumerable<TaskAssignmentDTO>> GetByTeamIdAsync(string teamId)
        {
            var tasks = await _taskAssignmentRepository.GetByTeamIdAsync(teamId);
            return tasks.Select(t => t.ToTaskAssignmentDTO());
        }

        public async Task<IEnumerable<TaskAssignmentDTO>> GetByCompanyIdAsync(string companyId)
        {
            var tasks = await _taskAssignmentRepository.GetByCompanyIdAsync(companyId);
            return tasks.Select(t => t.ToTaskAssignmentDTO());
        }
    }

    // ─── Mapping helpers (kept local, no AutoMapper dependency) ──────────────
    internal static class TaskAssignmentMappings
    {
        internal static TaskAssignmentDTO ToTaskAssignmentDTO(this TaskAssignment t) => new()
        {
            TaskId     = t.TaskId,
            ReportId   = t.ReportId,
            TeamId     = t.TeamId,
            CompanyId  = t.CompanyId,
            AssignedBy = t.AssignedBy,
            Status     = t.Status,
            AssignedAt = t.AssignedAt
        };
    }
}
