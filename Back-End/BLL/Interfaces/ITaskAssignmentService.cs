using BLL.DTO;

namespace BLL.Interfaces
{
    public interface ITaskAssignmentService
    {
        Task<TaskAssignmentDTO> GetByIdAsync(string id);
        Task<List<TaskAssignmentDTO>> GetAllAsync();
        Task<TaskAssignmentDTO> AssignReportAsync(CreateTaskAssignmentDTO dto);
        Task UpdateStatusAsync(string taskId, string status);
        Task DeleteAsync(string id);
        Task<IEnumerable<TaskAssignmentDTO>> GetByTeamIdAsync(string teamId);
        Task<IEnumerable<TaskAssignmentDTO>> GetByCompanyIdAsync(string companyId);
    }
}
