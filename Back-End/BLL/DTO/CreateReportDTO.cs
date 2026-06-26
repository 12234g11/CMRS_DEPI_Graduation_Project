using BLL.DTO;
using BLL.Services;
using DEPI_Graduation_Project.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;

namespace BLL.DTO
{
    public class CreateReportDTO
    {
        [Required(ErrorMessage = "عنوان التقرير مطلوب")]
        [MaxLength(50, ErrorMessage = "عنوان التقرير يجب أن لا يتجاوز 50 حرفًا")]
        public string Title { get; set; }

        [Required(ErrorMessage = "وصف التقرير مطلوب")]
        [MaxLength(300, ErrorMessage = "وصف التقرير يجب أن لا يتجاوز 300 حرفًا")]
        public string Description { get; set; }

        [Required(ErrorMessage = "خط العرض مطلوب")]
        public float Latitude { get; set; }

        [Required(ErrorMessage = "خط الطول مطلوب")]
        public float Longitude { get; set; }

        [Required(ErrorMessage = "أولوية التقرير مطلوبة")]
        public int Priority { get; set; }

        [Required(ErrorMessage = "المدينة مطلوبة")]
        [MaxLength(100, ErrorMessage = "اسم المدينة يجب أن لا يتجاوز 100 حرفًا")]
        public string City { get; set; }

        [MaxLength(200, ErrorMessage = "العنوان يجب أن لا يتجاوز 200 حرفًا")]
        public string Address { get; set; }

        [MaxLength(300, ErrorMessage = "العنوان التفصيلي يجب أن لا يتجاوز 300 حرفًا")]
        public string DetailedAddress { get; set; }

        public string IssueCategoryId { get; set; }

        public List<IFormFile> ReportImages { get; set; }
    }

    public static class CreateReportDTOExtensions
    {
        public static Report ToReport(this CreateReportDTO dto)
        {
            return new Report
            {
                ReportId = Guid.NewGuid().ToString(),
                Title = dto.Title,
                Description = dto.Description,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude,
                Priority = dto.Priority,
                IssueCategoryId = dto.IssueCategoryId,
                Status = "قيد المراجعة",

            };
        }
    }

}


