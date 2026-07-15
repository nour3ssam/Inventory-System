using Inventory_System.Core.Bases;
using Inventory_System.Core.Features.Users.Commands.Models;
using Inventory_System.Infrastructure.Identity;
using Inventory_System.Service.Abstracts;
using MediatR;
using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Text;

namespace Inventory_System.Core.Features.Users.Commands.Handlers
{
    internal class ResetPasswordHandler : IRequestHandler<ResetPasswordCommand, Result<string>>
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IAuthenticationService _authenticationService;
        public ResetPasswordHandler(UserManager<ApplicationUser> userManager, IAuthenticationService authenticationService)
        {
            _userManager = userManager;
            _authenticationService = authenticationService;
        }

        public Task<Result<string>> Handle(ResetPasswordCommand request, CancellationToken cancellationToken)
        {
            throw new NotImplementedException();
        }
    }
}
