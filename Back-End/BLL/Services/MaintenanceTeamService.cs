using BLL.DTO;
using BLL.Interfaces;
using DEPI_Graduation_Project.Entities;
using DEPI_Graduation_Project.Interfaces;

namespace BLL.Services
{
    public class MaintenanceTeamService : IMaintenanceTeamService
    {
        private readonly IMaintenanceTeamRepository _teamRepository;

        public MaintenanceTeamService(IMaintenanceTeamRepository teamRepository)
        {
            _teamRepository = teamRepository;
        }

        public async Task<MaintenanceTeamDTO> GetByIdAsync(string id)
        {
            var team = await _teamRepository.GetByIdAsync(id);
            if (team == null) throw new KeyNotFoundException("Maintenance team not found.");
            return team.ToDTO();
        }

        public async Task<List<MaintenanceTeamDTO>> GetAllAsync()
        {
            var teams = await _teamRepository.GetAllAsync();
            return teams.Select(t => t.ToDTO()).ToList();
        }

        public async Task<MaintenanceTeamDTO> CreateAsync(CreateMaintenanceTeamDTO dto)
        {
            var team = new MaintenanceTeam
            {
                TeamId     = Guid.NewGuid().ToString(),
                Name       = dto.Name,
                Phone      = dto.Phone,
                Department = dto.Department,
                Photo      = dto.Photo
            };
            await _teamRepository.AddAsync(team);
            return team.ToDTO();
        }

        public async Task DeleteAsync(string id)
        {
            await _teamRepository.DeleteAsync(id);
        }
    }

    internal static class MaintenanceTeamMappings
    {
        internal static MaintenanceTeamDTO ToDTO(this MaintenanceTeam t) => new()
        {
            TeamId     = t.TeamId,
            Name       = t.Name,
            Phone      = t.Phone,
            Department = t.Department,
            Photo      = t.Photo
        };
    }
}
