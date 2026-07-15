using Azure;
using Inventory_System.Core.Bases;
using Inventory_System.Core.Features.Users.Commands.Models;
using Inventory_System.Infrastructure.Identity;
using Inventory_System.Service.Abstracts;
using Inventory_System.Service.Models;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Text;

namespace Inventory_System.Core.Features.Users.Commands.Handlers
{
    internal class ForgotPasswordHandler : IRequestHandler<ForgotPasswordCommand, Result<string>>
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly ILogger<ForgotPasswordHandler> _logger;
        private readonly IEmailService _emailService;
        private readonly FrontendSettings _frontendSettings;
        private readonly IEmailTemplateService _emailTemplateService;

        public ForgotPasswordHandler(UserManager<ApplicationUser> userManager,IOptions<FrontendSettings> frontendSettings, ILogger<ForgotPasswordHandler> logger, IEmailService emailService, IEmailTemplateService emailTemplateService)
        {
            _userManager = userManager;
            _frontendSettings = frontendSettings.Value;
            _logger = logger;
            _emailService = emailService;
            _emailTemplateService = emailTemplateService;
        }

        public async Task<Result<string>> Handle(ForgotPasswordCommand request, CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);
            if (user == null)
                return Result<string>.Success("If the email exists the reset link has been sent");


            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

            var resetLink = $"{_frontendSettings.BaseUrl}/reset-password" + $"?email={Uri.EscapeDataString(user.Email!)}" + $"&token={Uri.EscapeDataString(token)}";

            // Email Body
            var body = _emailTemplateService.GetResetPasswordTemplate( user.UserName, resetLink);

            try
            {
                await _emailService.SendEmailAsync(user.Email, "Reset Password",body);
                _logger.LogInformation("Password reset email sent successfully to {Email}.",user.Email);
                return Result<string>.Success("If the email exists, the reset link has been sent.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send password reset email to {Email}.",user.Email);
                return Result<string>.Failure("Something went wrong while sending the email.", ResultStatus.ValidationError);
            }
         

        }
    }
}
