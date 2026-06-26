using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI_Graduation_Project.Interfaces
{
    public interface IGenericRepository<T> where T : class
    {
        Task<T> GetByIdAsync(string id);
        Task<List<T>> GetAllAsync();
        Task AddAsync(T entity);
        Task<T> UpdateAsync(T entity);
        Task DeleteAsync(string id);
        Task SaveChangesAsync();
    }
}
