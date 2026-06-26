using DEPI_Graduation_Project.Entities;
using System.ComponentModel.DataAnnotations;

namespace BLL.DTO
{
    public class UpdateReportStatusDTO
    {
        [Required(ErrorMessage = "معرف التقرير مطلوب")]
        public string ReportId { get; set; }

        [Required(ErrorMessage = "الحالة مطلوبة")]
        public string status { get; set; }

    }

    public static class UpdateReportStatusDTOExtensions
    {
        public static ReportStatusHistory ToReportStatusHistory(this UpdateReportStatusDTO dto)
        {
            return new ReportStatusHistory
            {
                ReportId = dto.ReportId,
                Status = dto.status

            };
        }
    }
}
