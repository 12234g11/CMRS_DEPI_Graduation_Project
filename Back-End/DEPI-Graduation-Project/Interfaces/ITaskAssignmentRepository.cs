using DEPI_Graduation_Project.Entities;

namespace DEPI_Graduation_Project.Interfaces
{
    public interface ITaskAssignmentRepository : IGenericRepository<TaskAssignment>
    {
        Task<IEnumerable<TaskAssignment>> GetByTeamIdAsync(string teamId);
        Task<IEnumerable<TaskAssignment>> GetByCompanyIdAsync(string companyId);
        Task UpdateStatusAsync(string taskId, string status);
    }
}
