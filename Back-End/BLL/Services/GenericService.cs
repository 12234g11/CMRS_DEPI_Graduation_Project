using BLL.Interfaces;
using DEPI_Graduation_Project.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.Services
{
    public class GenericService<T> : IGenericService<T> where T : class
    {
        private readonly IGenericRepository<T> _genericRepository;

        public GenericService(IGenericRepository<T> genericRepository)
        {
            _genericRepository = genericRepository;
        }

        public async Task<T> GetByIdAsync(string id)
        {
            return await _genericRepository.GetByIdAsync(id);
        }

        public Task AddAsync(T entity)
        {
            return _genericRepository.AddAsync(entity);
        }

        public async Task<T> UpdateAsync(T entity)
        {
            return await _genericRepository.UpdateAsync(entity);
        }

        public Task DeleteAsync(string id)
        {
            return _genericRepository.DeleteAsync(id);
        }

        public async Task<List<T>> GetAllAsync()
        {
            return await _genericRepository.GetAllAsync();
        }

    }
}
