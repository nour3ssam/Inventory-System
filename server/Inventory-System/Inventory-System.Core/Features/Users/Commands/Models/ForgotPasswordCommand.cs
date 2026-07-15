using Azure;
using Inventory_System.Core.Bases;
using MediatR;
using System;
using System.Collections.Generic;
using System.Text;

namespace Inventory_System.Core.Features.Users.Commands.Models
{
    public record ForgotPasswordCommand(string Email) : IRequest<Result<string>>;
}
