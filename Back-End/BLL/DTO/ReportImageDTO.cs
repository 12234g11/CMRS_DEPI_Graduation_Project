using DEPI_Graduation_Project.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace BLL.DTO
{
    public class ReportImageDTO
    {
        public string ImageUrl { get; set; }

    }

    public static class ReportImageDTOExtensions
    {
        public static ReportImageDTO ToReportImageDTO(this ReportImage reportImage)
        {
            return new ReportImageDTO
            {
                ImageUrl = reportImage.ImageUrl,
            };
        }
    }
}
