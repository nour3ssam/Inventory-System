using Inventory_System.Core.Bases;
using MediatR;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace Inventory_System.Core.Features.Users.Commands.Models
{
    public class ResetPasswordCommand : IRequest<Result<string>>
    {
        public string Email { get; set; } = default!;
        public string Token { get; set; } = default!;
        public string Password { get; set; } = default!;
        public string ConfirmPassword { get; set; } = default!;
    }
}
