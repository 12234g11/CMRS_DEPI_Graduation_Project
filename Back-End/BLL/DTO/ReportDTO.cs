using DEPI_Graduation_Project.Entities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace BLL.DTO
{
    public class ReportDTO
    {
        public string id { get; set; }

        [Required(ErrorMessage = "العنوان مطلوب")]
        [MaxLength(50, ErrorMessage = "العنوان يجب أن لا يتجاوز 50 حرف")]
        public string Title { get; set; }

        [Required(ErrorMessage = "الوصف مطلوب")]
        [MaxLength(300, ErrorMessage = "الوصف يجب أن لا يتجاوز 300 حرف")]
        public string Description { get; set; }

        [Required(ErrorMessage = "خط العرض مطلوب")]
        public float Latitude { get; set; }

        [Required(ErrorMessage = "خط الطول مطلوب")]
        public float Longitude { get; set; }

        [DefaultValue("Pending")]
        public string Status { get; set; }

        [Required(ErrorMessage = "الأولوية مطلوبة")]
        public int Priority { get; set; }

        public DateTime CreatedAt { get; set; }

        public string UserId { get; set; }
        public string IssueCategoryId { get; set; }
        public string AreaId { get; set; }
        public AreaDTO Area { get; set; }

        public ICollection<ReportImageDTO> ReportImages { get; set; }
        public ICollection<ReportRatingDTO> ReportRatings { get; set; }
        //public ICollection<ReportStatusHistory> ReportStatusHistories { get; set; }
    }

    public static class ReportDTOExtensions
    {
        public static ReportDTO ToReportDTO(this Report report)
        {
            return new ReportDTO
            {
                id = report.ReportId,
                Title = report.Title,
                Description = report.Description,
                Latitude = report.Latitude,
                Longitude = report.Longitude,
                Status = report.Status,
                Priority = report.Priority,
                CreatedAt = report.CreatedAt,
                UserId = report.UserId,
                IssueCategoryId = report.IssueCategoryId.ToString(),
                AreaId = report.AreaId,

                Area = new AreaDTO
                {
                    AreaId = report.Area.AreaId,
                    City = report.Area.City,
                    Address = report.Area.Address,
                    DetailedAddress = report.Area.DetailedAddress,
                    HealthScore = report.Area.HealthScore
                },

                ReportImages = report.ReportImages
                    .Select(i => new ReportImageDTO
                    {
                        ImageUrl = i.ImageUrl
                    }).ToList(),

                ReportRatings = report.ReportRatings
                    .Select(i => new ReportRatingDTO
                    {
                        Rating = i.Rating,
                    }).ToList(),
            };
        }
    }
}
