using DEPI_Graduation_Project.Entities;

namespace DEPI_Graduation_Project.Interfaces
{
    public interface ICompanyRepository : IGenericRepository<Company>
    {
        Task<IEnumerable<Company>> GetByServiceCategoryAsync(string categoryId);
    }
}
