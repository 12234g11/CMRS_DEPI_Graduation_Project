using DEPI_Graduation_Project.Data.Context;
using DEPI_Graduation_Project.Entities;
using DEPI_Graduation_Project.Interfaces;

namespace DEPI_Graduation_Project.Repositories
{
    public class MaintenanceTeamRepository : GenericRepository<MaintenanceTeam>, IMaintenanceTeamRepository
    {
        public MaintenanceTeamRepository(BalaghDBContext context) : base(context)
        {
        }
    }
}
