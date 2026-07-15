using System;
using System.Collections.Generic;
using System.Text;

namespace Inventory_System.Service.Models
{
    public class EmailSettings
    {
        public string Email { get; set; }
        public string DisplayName { get; set; }
        public string Password { get; set; }
        public string Host { get; set; }
        public int Port { get; set; }
    }
}
