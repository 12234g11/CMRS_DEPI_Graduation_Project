using BLL.DTO;

namespace BLL.Interfaces
{
    public interface ICompanyService
    {
        Task<CompanyDTO> GetByIdAsync(string id);
        Task<List<CompanyDTO>> GetAllAsync();
        Task<IEnumerable<CompanyDTO>> GetByCategoryAsync(string categoryId);
        Task DeleteAsync(string id);
    }
}
