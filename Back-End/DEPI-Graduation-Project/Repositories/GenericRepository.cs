using DEPI_Graduation_Project.Data.Context;
using DEPI_Graduation_Project.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace DEPI_Graduation_Project.Repositories
{
    public class GenericRepository<T> : IGenericRepository<T> where T : class
    {
        protected readonly BalaghDBContext _context;

        public GenericRepository(BalaghDBContext balaghDBContext)
        {
            _context = balaghDBContext;
        }

        public async Task AddAsync(T entity)
        {
            await _context.Set<T>().AddAsync(entity);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(string id)
        {
            var entity = await _context.Set<T>().FindAsync(id);
            if (entity == null) throw new KeyNotFoundException();
            _context.Set<T>().Remove(entity);
            await _context.SaveChangesAsync();
        }

        public async Task<T> UpdateAsync(T entity)
        {
            _context.Set<T>().Update(entity);
            await _context.SaveChangesAsync();
            return entity;
        }
        public async Task<List<T>> GetAllAsync()
        {
            return await _context.Set<T>().ToListAsync();
        }
        public async Task<T> GetByIdAsync(string id)
        {
            return await _context.Set<T>().FindAsync(id);
        }

        public async Task SaveChangesAsync()
        {
            await _context.SaveChangesAsync();
        }
    }
}
