using Lumio.Api.Services.Security;
using Microsoft.AspNetCore.Mvc;

namespace Lumio.Api.Controllers;

[ApiController]
[Route("api/status")]
public class StatusController : ControllerBase
{
    [HttpGet]
    public IActionResult GetStatus([FromServices] IMasterPasswordService passwordService)
    {
        return Ok(new
        {
            status = "ok",
            versie = "1.0.0",
            isOntgrendeld = passwordService.IsUnlocked,
            isEersteKeer = passwordService.IsFirstRun
        });
    }
}
