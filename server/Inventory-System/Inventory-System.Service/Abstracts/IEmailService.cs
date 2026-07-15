using System;
using System.Collections.Generic;
using System.Text;

namespace Inventory_System.Service.Abstracts
{
    public interface IEmailService
    {
       public Task SendEmailAsync( string to, string subject, string htmlBody);
    }
}
