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
        [Required]
        public string Email { get; set; }

        [Required]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$",
         ErrorMessage = "Password must contain Uppercase, Lowercase, Digit and Special Character")]
        public string Password { get; set; }
        [Required]
        [Compare("Password", ErrorMessage = "Password and ConfirmPassword must match")]
        public string ConfirmPassword { get; set; }
    }
}
