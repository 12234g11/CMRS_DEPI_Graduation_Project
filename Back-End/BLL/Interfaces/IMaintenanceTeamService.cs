using BLL.DTO;

namespace BLL.Interfaces
{
    public interface IMaintenanceTeamService
    {
        Task<MaintenanceTeamDTO> GetByIdAsync(string id);
        Task<List<MaintenanceTeamDTO>> GetAllAsync();
        Task<MaintenanceTeamDTO> CreateAsync(CreateMaintenanceTeamDTO dto);
        Task DeleteAsync(string id);
    }
}
