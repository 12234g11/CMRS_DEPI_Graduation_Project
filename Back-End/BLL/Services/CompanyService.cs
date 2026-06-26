using BLL.DTO;
using BLL.Interfaces;
using DEPI_Graduation_Project.Interfaces;

namespace BLL.Services
{
    public class CompanyService : ICompanyService
    {
        private readonly ICompanyRepository _companyRepository;

        public CompanyService(ICompanyRepository companyRepository)
        {
            _companyRepository = companyRepository;
        }

        public async Task<CompanyDTO> GetByIdAsync(string id)
        {
            var company = await _companyRepository.GetByIdAsync(id);
            if (company == null) throw new KeyNotFoundException("Company not found.");
            return company.ToDTO();
        }

        public async Task<List<CompanyDTO>> GetAllAsync()
        {
            var companies = await _companyRepository.GetAllAsync();
            return companies.Select(c => c.ToDTO()).ToList();
        }

        public async Task<IEnumerable<CompanyDTO>> GetByCategoryAsync(string categoryId)
        {
            var companies = await _companyRepository.GetByServiceCategoryAsync(categoryId);
            return companies.Select(c => c.ToDTO());
        }

        public async Task DeleteAsync(string id)
        {
            await _companyRepository.DeleteAsync(id);
        }
    }

    internal static class CompanyMappings
    {
        internal static CompanyDTO ToDTO(this DEPI_Graduation_Project.Entities.Company c) => new()
        {
            CompanyId         = c.CompanyId,
            Name              = c.Name,
            Email             = c.Email,
            Phone             = c.Phone,
            AreaId            = c.AreaId,
            ServiceCategoryId = c.ServiceCategoryId,
            CreatedAt         = c.CreatedAt
        };
    }
}
