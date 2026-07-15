using Inventory_System.Core.Features.Users.Commands.Models;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Inventory_System.API.Controllers
{
    [Route("api/[controller]")]
    public class AuthController : BaseApiController
    {
        private readonly IMediator _mediator;

        public AuthController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost("Register")]
        public async Task<IActionResult> Register([FromBody] RegisterUserCommand command)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState); 

            var response = await _mediator.Send(command);
            return NewResult(response);
        }

        [HttpPost("Login")]
        public async Task<IActionResult> Login([FromBody] LoginUserCommand command)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var response = await _mediator.Send(command);
            return NewResult(response);
        }

        [Authorize]
        [HttpPost("Logout")] 
        public async Task<IActionResult> Logout([FromBody] LogoutCommand command)
        {
            var response = await _mediator.Send(command);
            return NewResult(response);
        }


        [HttpPost("RefreshToken")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenCommand command)
        {

            var response = await _mediator.Send(command);
            return NewResult(response);
        }

        [Authorize]
        [HttpPut("Profile")]
        public async Task<IActionResult> Update([FromBody] UpdateUserCommand command)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var response = await _mediator.Send(command);
            return NewResult(response);
        }

        [Authorize]
        [HttpDelete("Profile")]
        public async Task<IActionResult> Delete(DeleteCurrentUserCommand command)
        {
            var response = await _mediator.Send(command);
            return NewResult(response);
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordCommand command)
        {
            var result = await _mediator.Send(command);
            return NewResult(result);
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordCommand command)
        {
            var result = await _mediator.Send(command);
            return NewResult(result);
        }



    }
}
