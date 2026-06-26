using DEPI_Graduation_Project.Data.Context;
using DEPI_Graduation_Project.Entities;
using DEPI_Graduation_Project.Interfaces;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI_Graduation_Project.Repositories
{
    public class ReportRepository : GenericRepository<Report>, IReportRepository
    {
        public ReportRepository(BalaghDBContext context) : base(context)
        {
        }

        public async Task<IEnumerable<Report>> GetAllReportsForUserAsync(string currentUserId)
        {
            var filteredReports = await _context.Reports
                .Where(r =>
                    r.Status != "تحت المراجعة" ||
                    r.UserId == currentUserId
                )
                .Include(r => r.IssueCategory)
                .Include(r => r.Area)
                .Include(r => r.ReportImages)
                .Include(r => r.ReportRatings)
                .AsNoTracking()
                .ToListAsync();

            return filteredReports;
        }

        public async Task<IEnumerable<Report>> GetAllReportsWithImagesAsync()
        {
            return await _context.Reports
                .Include(r => r.ReportImages)
                .ToListAsync();
        }

        public async Task<Report> GetReportByIdAsync(string id)
        {
            var report = await _context.Reports
                .Include(r => r.ReportImages)
                .Include(r => r.IssueCategory)
                .Include(r => r.Area)
                .Include(r => r.User)
                .Include(r => r.ReportRatings)
                .FirstOrDefaultAsync(r => r.ReportId == id);

            if (report == null)
                return null;

            return report;
        }

        public async Task<IEnumerable<Report>> GetNearbyAsync(float lat, float lng, float radiusKm)
        {
            // 6371 = Earth radius in km
            return await _context.Reports
                .Where(r => r.Status != "Merged" &&
                    6371 * Math.Acos(
                        Math.Cos(Math.PI / 180 * lat) *
                        Math.Cos(Math.PI / 180 * r.Latitude) *
                        Math.Cos(Math.PI / 180 * r.Longitude - Math.PI / 180 * lng) +
                        Math.Sin(Math.PI / 180 * lat) *
                        Math.Sin(Math.PI / 180 * r.Latitude)
                    ) <= radiusKm)
                .Include(r => r.IssueCategory)
                .Include(r => r.Area)
                .Include(r => r.ReportImages)
                .ToListAsync();
        }

        public async Task<int> GetNumberOfReportsAsync()
        {
            return await _context.Reports.CountAsync();
        }

        public async Task<int> GetNumberOfReportsByStatusAsync(string status)
        {
            return await _context.Reports.CountAsync(r => r.Status == status);
        }

        public async Task<int> GetNumberOfReportsByUserAsync(string id)
        {
            return await _context.Reports.CountAsync(r => r.UserId == id);
        }

        public async Task<IEnumerable<Report>> GetReportByCategoryIdAsync(string id)
        {
            return await _context.Reports.Where(r => r.IssueCategoryId == id).ToListAsync();
        }

        public async Task<List<Report>> GetReportsByAreaAsync(string id)
        {
            return await _context.Reports.Where(r => r.AreaId == id).ToListAsync();
        }

        public async Task<List<Report>> GetReportsByUserIdAsync(string id)
        {
            return await _context.Reports.Where(r => r.UserId == id).ToListAsync();
        }

        public async Task<int> UpdateReportStatusAsync(string id, string changedBy, string role, string status)
        {
            var report = await _context.Reports.FindAsync(id);

            var reportStatusHistory = await _context.ReportStatusHistories.FirstOrDefaultAsync(r => r.ReportId == id);

            if (report != null)
            {
                if (role == "Admin")
                {
                    reportStatusHistory.AdminId = changedBy;
                }
                else
                {
                    reportStatusHistory.CompnayId = changedBy;
                }

                report.Status = status;
                report.LastUpdatedAt = DateTime.UtcNow;
                reportStatusHistory.Status = status;

                _context.Reports.Update(report);
                _context.ReportStatusHistories.Update(reportStatusHistory);
            }
            return await _context.SaveChangesAsync();
        }

        public async Task<int> GetTotalNumberOfRatings(string id)
        {
            var report = await _context.Reports
                .Include(r => r.ReportRatings)
                .FirstOrDefaultAsync(r => r.ReportId == id);
            if (report == null)
                return 0;

            var TotalRatings = report.ReportRatings.Count;
            return TotalRatings;
        }

    }
}
