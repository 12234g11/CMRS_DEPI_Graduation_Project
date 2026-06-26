using BLL.DTO;
using BLL.Interfaces;
using DEPI_Graduation_Project.Entities;
using DEPI_Graduation_Project.Interfaces;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Webp;

namespace BLL.Services
{
    public class ReportService : IReportService
    {
        private readonly IReportRepository _reportRepository;
        private readonly IGenericRepository<ReportImage> _reportImageRepository;
        private readonly IAreaRepository _areaRepository;
        private readonly IGenericRepository<ReportStatusHistory> _reportStatusHistoryService;

        public ReportService(IReportRepository reportRepository,
                             IGenericRepository<ReportImage> reportImageRepository, IAreaRepository areaRepository,
                             IGenericRepository<ReportStatusHistory> reportStatusHistoryService)
        {
            _reportRepository = reportRepository;
            _reportImageRepository = reportImageRepository;
            _areaRepository = areaRepository;
            _reportStatusHistoryService = reportStatusHistoryService;
        }

        public async Task<List<ReportDTO>> GetAllReportsForUserAsync(string currentUserId)
        {
            var reports = _reportRepository.GetAllReportsForUserAsync(currentUserId);

            return reports.Result.Select(r => r.ToReportDTO()).ToList();
        }
        public async Task<ReportDTO> GetByIdAsync(string id)
        {
            var report = await _reportRepository.GetReportByIdAsync(id);
            if (report == null) throw new KeyNotFoundException("Report not found");
            return report.ToReportDTO();
        }

        public async Task<List<ReportDTO>> GetAllAsync()
        {
            var reports = await _reportRepository.GetAllReportsWithImagesAsync();
            return reports.Select(r => r.ToReportDTO()).ToList();
        }

        public async Task AddAsync(CreateReportDTO dto, string userId)
        {
            var report = dto.ToReport();

            var area = await _areaRepository.GetByDetailsAsync(dto.City, dto.Address, dto.DetailedAddress);

            if (area == null)
            {
                area = new Area
                {
                    AreaId = Guid.NewGuid().ToString(),
                    City = dto.City,
                    Address = dto.Address,
                    DetailedAddress = dto.DetailedAddress
                };

                await _areaRepository.AddAsync(area);
            }



            // 1. VALIDATION BEFORE DB
            if (dto.ReportImages?.Any() == true)
            {
                if (dto.ReportImages.Count > 5)
                    throw new Exception("الحد الأقصى المسموح به هو 5 صور.");

                const long maxSize = 5 * 1024 * 1024;
                var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".webp" };

                foreach (var file in dto.ReportImages)
                {
                    if (file.Length == 0)
                        throw new Exception("يجب تحميل صورة.");

                    if (file.Length > maxSize)
                        throw new Exception("تتجاوز الصورة 5 ميغابايت.");

                    var ext = Path.GetExtension(file.FileName).ToLowerInvariant();

                    if (!allowedExtensions.Contains(ext))
                        throw new Exception("تنسيق الصورة غير صالح.");
                }
            }
            report.UserId = userId;
            report.AreaId = area.AreaId;

            // 2. SAVE REPORT FIRST
            await _reportRepository.AddAsync(report);
            await _reportStatusHistoryService.AddAsync(new ReportStatusHistory
            {
                ReportStatusHistoryId = Guid.NewGuid().ToString(),
                ReportId = report.ReportId,
                Status = report.Status,
                ChangedAt = DateTime.UtcNow
            });

            // 3. SAVE IMAGES
            if (dto.ReportImages != null && dto.ReportImages.Any())
            {
                var uploadsFolder = Path.Combine(
                    Directory.GetCurrentDirectory(),
                    "wwwroot",
                    "uploads");

                Directory.CreateDirectory(uploadsFolder);

                foreach (var file in dto.ReportImages)
                {
                    var fileName = $"{Guid.NewGuid()}.webp";

                    var filePath = Path.Combine(uploadsFolder, fileName);

                    using var image = await Image.LoadAsync(file.OpenReadStream());

                    await image.SaveAsync(
                        filePath,
                        new WebpEncoder
                        {
                            Quality = 80
                        });

                    var reportImage = new ReportImage
                    {
                        ImageId = Guid.NewGuid().ToString(),
                        ImageUrl = $"/uploads/{fileName}",
                        UploadedAt = DateTime.UtcNow,
                        ReportId = report.ReportId
                    };

                    await _reportImageRepository.AddAsync(reportImage);
                }
            }
        }
        public async Task<ReportDTO> UpdateAsync(string id, UpdateReportDTO entity)
        {
            if (id != entity.Id)
                throw new ArgumentException("Report ID mismatch.");

            var updated = await _reportRepository.UpdateAsync(entity.ToReport(id));
            return updated.ToReportDTO();
        }

        public async Task DeleteAsync(string id)
        {
            await _reportRepository.DeleteAsync(id);
        }

        public async Task<List<ReportDTO>> GetReportsByUserIdAsync(string id)
        {
            var reports = await _reportRepository.GetReportsByUserIdAsync(id);
            return reports.Select(r => r.ToReportDTO()).ToList();
        }

        public async Task<List<ReportDTO>> GetReportsByAreaAsync(string id)
        {
            var reports = await _reportRepository.GetReportsByAreaAsync(id);
            return reports.Select(r => r.ToReportDTO()).ToList();
        }

        public async Task UpdateReportStatusAsync(string id, string changedBy, string role, string status)
        {
            await _reportRepository.UpdateReportStatusAsync(id, changedBy, role, status);
        }

        public async Task<IEnumerable<ReportDTO>> GetReportByCategoryIdAsync(string id)
        {
            var reports = await _reportRepository.GetReportByCategoryIdAsync(id);
            return reports.Select(r => r.ToReportDTO());
        }

        public async Task<int> GetNumberOfReportsByStatusAsync(string status)
            => await _reportRepository.GetNumberOfReportsByStatusAsync(status);

        public async Task<int> GetNumberOfReportsByUserAsync(string id)
            => await _reportRepository.GetNumberOfReportsByUserAsync(id);

        public async Task<IEnumerable<ReportDTO>> GetNearbyAsync(float lat, float lng, float radiusKm)
        {
            var reports = await _reportRepository.GetNearbyAsync(lat, lng, radiusKm);
            return reports.Select(r => r.ToReportDTO());
        }

        public async Task<int> GetNumberOfReportsAsync()
        {
            return await _reportRepository.GetNumberOfReportsAsync();
        }

        public async Task<int> GetTotalNumberOfRatings(string id)
        {
            return await _reportRepository.GetTotalNumberOfRatings(id);
        }



    }
}