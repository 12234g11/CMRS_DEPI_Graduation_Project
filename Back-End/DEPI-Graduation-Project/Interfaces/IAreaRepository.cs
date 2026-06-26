using DEPI_Graduation_Project.Entities;

namespace DEPI_Graduation_Project.Interfaces
{
    public interface IAreaRepository : IGenericRepository<Area>
    {
        Task UpdateHealthScoreAsync(string areaId, float score);

        Task<Area?> GetByDetailsAsync(string City, string Address, string DetailedAddress);
    }
}
