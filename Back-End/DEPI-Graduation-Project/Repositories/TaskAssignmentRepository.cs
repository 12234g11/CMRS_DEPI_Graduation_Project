using DEPI_Graduation_Project.Data.Context;
using DEPI_Graduation_Project.Entities;
using DEPI_Graduation_Project.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DEPI_Graduation_Project.Repositories
{
    public class TaskAssignmentRepository : GenericRepository<TaskAssignment>, ITaskAssignmentRepository
    {
        public TaskAssignmentRepository(BalaghDBContext context) : base(context)
        {
        }

        public async Task<IEnumerable<TaskAssignment>> GetByTeamIdAsync(string teamId)
        {
            return await _context.TaskAssignments
                .Where(t => t.TeamId == teamId)
                .Include(t => t.Report)
                .Include(t => t.MaintenanceTeam)
                .ToListAsync();
        }

        public async Task<IEnumerable<TaskAssignment>> GetByCompanyIdAsync(string companyId)
        {
            return await _context.TaskAssignments
                .Where(t => t.CompanyId == companyId)
                .Include(t => t.Report)
                .Include(t => t.Company)
                .ToListAsync();
        }

        public async Task UpdateStatusAsync(string taskId, string status)
        {
            var task = await _context.TaskAssignments.FindAsync(taskId);
            if (task == null) throw new KeyNotFoundException("Task assignment not found.");
            task.Status = status;
            await _context.SaveChangesAsync();
        }
    }
}
