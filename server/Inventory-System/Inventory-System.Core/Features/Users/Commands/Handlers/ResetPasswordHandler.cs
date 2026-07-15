using Inventory_System.Core.Bases;
using Inventory_System.Core.Features.Users.Commands.Models;
using Inventory_System.Infrastructure.Identity;
using Inventory_System.Service.Abstracts;
using MediatR;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text;

namespace Inventory_System.Core.Features.Users.Commands.Handlers
{
    internal class ResetPasswordHandler : IRequestHandler<ResetPasswordCommand, Result<string>>
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IAuthenticationService _authenticationService;
        private readonly ILogger<ResetPasswordHandler> _logger;

        public ResetPasswordHandler(UserManager<ApplicationUser> userManager, IAuthenticationService authenticationService, ILogger<ResetPasswordHandler> logger)
        {
            _userManager = userManager;
            _authenticationService = authenticationService;
            _logger = logger;
        }

        public async Task<Result<string>> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
        {
            var user = await _userManager.FindByEmailAsync(request.Email);

            if (user is null)
                return Result<string>.Failure("Invalid email or token", ResultStatus.ValidationError);

            string decodedToken;
            try
            {
                decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(request.Token));
            }
            catch
            {
                return Result<string>.Failure("Invalid reset token.", ResultStatus.ValidationError);
            }

            var result = await _userManager.ResetPasswordAsync(user,decodedToken,request.Password);
            if (!result.Succeeded){
                var errors = string.Join(", ", result.Errors.Select(e => e.Description));
                _logger.LogWarning(
                    "Password reset failed for {Email}. Errors: {Errors}",
                    request.Email,
                    errors);

                return Result<string>.Failure(errors, ResultStatus.ValidationError);
            }

            await _authenticationService.RevokeAllRefreshTokensAsync(user.Id); 

            _logger.LogInformation("Password reset successfully for {Email}",request.Email);

            return Result<string>.Success("Password has been reset successfully");
        }
    }
}
