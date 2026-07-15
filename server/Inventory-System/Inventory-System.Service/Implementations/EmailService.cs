using Inventory_System.Service.Abstracts;
using Inventory_System.Service.Models;
using MailKit.Security;
using MailKit.Net.Smtp;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MimeKit;
using System;
using System.Collections.Generic;
using System.Text;

namespace Inventory_System.Service.Implementations
{
    public class EmailService : IEmailService
    {
        private readonly EmailSettings _settings;
        private readonly ILogger<EmailService> _logger;
        public EmailService(IOptions<EmailSettings> settings, ILogger<EmailService> logger)
        {
            _settings = settings.Value;
            _logger = logger;
        }

        public async Task SendEmailAsync(string to, string subject, string htmlBody)
        {
            try
            {
                using (var client = new SmtpClient())
                {
                    // Use SecureSocketOptions.Auto. Hardcoding 'true' means strict SSL (usually port 465) 
                    // and will throw an exception if your SMTP uses STARTTLS (like port 587).
                    await client.ConnectAsync(_settings.Host, _settings.Port, SecureSocketOptions.Auto);

                    await client.AuthenticateAsync(_settings.Email, _settings.Password);
                    // ... rest of the email sending logic   

                    var bodyBuilder = new BodyBuilder()
                    {
                        HtmlBody = htmlBody,
                    };

                    var message = new MimeMessage()
                    {
                        Subject = subject,
                        From = { new MailboxAddress(_settings.DisplayName, _settings.Email) },
                        To = { new MailboxAddress("testing", to) },
                        Body = bodyBuilder.ToMessageBody(),
                    };

                    await client.SendAsync(message);
                    await client.DisconnectAsync(true);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send email to {Email}", to);
                throw;
            }
        }

    }
}
