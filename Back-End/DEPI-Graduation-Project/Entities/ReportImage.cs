using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI_Graduation_Project.Entities
{
    public class ReportImage
    {
        public string ImageId { get; set; }
        public string ImageUrl { get; set; }
        public DateTime UploadedAt { get; set; }

        // Relations
        public string ReportId { get; set; }

        // Navigation properties
        public Report Report { get; set; }
    }
}
