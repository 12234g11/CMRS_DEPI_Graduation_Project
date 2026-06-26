using BLL.DTO;
using DEPI_Graduation_Project.Entities;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace BLL.DTO
{
    public class UpdateReportDTO
    {
        [Required(ErrorMessage = "معرف التقرير مطلوب")]
        public string Id { get; set; }

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

        [Required(ErrorMessage = "الأولوية مطلوبة")]
        public int Priority { get; set; }

        [DefaultValue("Pending")]
        public string status { get; set; }
        //public string AreaId { get; set; }
        //public Area Area { get; set; }
        //public ICollection<ReportImageDTO> ReportImages { get; set; }
    }

    public static class UpdateReportDTOExtensions
    {
        public static Report ToReport(this UpdateReportDTO updateReportDTO, string Id)
        {
            return new Report
            {
                ReportId = Id,
                Title = updateReportDTO.Title,
                Description = updateReportDTO.Description,
                Latitude = updateReportDTO.Latitude,
                Longitude = updateReportDTO.Longitude,
                Priority = updateReportDTO.Priority,
                Status = updateReportDTO.status,
                //AreaId = updateReportDTO.AreaId,
                //Area = updateReportDTO.Area,
                //ReportImages = updateReportDTO.ReportImages?.Select(img => img.ToReportImage()).ToList()

            };
        }
    }
}
