using Inventory_System.Service.Abstracts;
using Microsoft.AspNetCore.Identity.UI.Services;
using System;
using System.Collections.Generic;
using System.Text;

namespace Inventory_System.Service.Implementations
{
    internal class EmailTemplateService : IEmailTemplateService
    {
        public string GetResetPasswordTemplate(string userName, string resetLink)
        {
            return $"""
                <h2>Reset Password</h2>

                <p>Hello {userName},</p>

                <p>
                    We received a request to reset your password.
                </p>

                <p>
                    Click the button below to reset your password.
                </p>

                <p>
                    <a href="{resetLink}"
                       style="
                            background-color:#2563eb;
                            color:white;
                            padding:12px 20px;
                            text-decoration:none;
                            border-radius:5px;">
                        Reset Password
                    </a>
                </p>

                <p>
                    If you didn't request this, you can safely ignore this email.
                </p>
           """;
        }
    }
}
