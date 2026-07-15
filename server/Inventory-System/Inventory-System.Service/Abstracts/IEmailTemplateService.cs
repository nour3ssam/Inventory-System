using System;
using System.Collections.Generic;
using System.Text;

namespace Inventory_System.Service.Abstracts
{
    public interface IEmailTemplateService
    {
        string GetResetPasswordTemplate(string userName, string resetLink);
    }
}
