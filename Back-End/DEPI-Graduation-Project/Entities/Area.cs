using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI_Graduation_Project.Entities
{
    public class Area
    {
        public string AreaId { get; set; }
        public string City { get; set; } = string.Empty;
        public string? Address { get; set; }
        public string? DetailedAddress { get; set; }
        public float HealthScore { get; set; }

        public ICollection<Report> Reports { get; set; } = new List<Report>();
        public ICollection<Company> Companies { get; set; } = new List<Company>();
    }
}
