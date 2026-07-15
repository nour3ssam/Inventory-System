using FluentValidation;
using Inventory_System.Core.Features.Users.Commands.Models;
using System;
using System.Collections.Generic;
using System.Text;

namespace Inventory_System.Core.Features.Users.Commands.Validators
{
    public class ResetPasswordValidator : AbstractValidator<ResetPasswordCommand>
    {
        public ResetPasswordValidator()
        {
            RuleFor(x => x.Email)
                .NotEmpty()
                .EmailAddress();

            RuleFor(x => x.Token)
                .NotEmpty();

            RuleFor(x => x.Password)
                .NotEmpty()
                .Matches(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$")
                .WithMessage("Password must contain Uppercase, Lowercase, Digit and Special Character.");

            RuleFor(x => x.ConfirmPassword)
                .Equal(x => x.Password)
                .WithMessage("Password and ConfirmPassword must match.");
        }
    }
}
