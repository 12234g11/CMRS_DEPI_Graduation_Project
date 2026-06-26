using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Interfaces
{
    public interface IGenericService<T> where T : class
    {
        Task<T> GetByIdAsync(string id);
        Task<List<T>> GetAllAsync();
        Task AddAsync(T entity);
        Task<T> UpdateAsync(T entity);
        Task DeleteAsync(string id);
    }
}
