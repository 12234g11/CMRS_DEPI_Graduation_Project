using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace DEPI_Graduation_Project.Entities
{
    public class IssueCategory
    {
        public string CategoryId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;

        public ICollection<Report> Reports { get; set; } = new List<Report>();
        public ICollection<Company> Companies { get; set; } = new List<Company>();
    }
}
