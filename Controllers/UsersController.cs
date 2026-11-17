
// KIM — BACKEND
// PROJECT: Library Reservation Management System Practice

using System.Security.Claims;
using LibraryReservationPractice.Data;
using LibraryReservationPractice.DTOs;
using LibraryReservationPractice.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibraryReservationPractice.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly LibraryDbContext _context;

    public UsersController(LibraryDbContext context)
    {
        _context = context;
    }

    [HttpGet("me")]
    public async Task<IActionResult> GetMyProfile()
    {
        var userIdValue = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (!int.TryParse(userIdValue, out var userId))
        {
            return Unauthorized(new { message = "Invalid user token." });
        }

        var user = await _context.Users
            .Where(u => u.Id == userId)
            .Select(u => new UserResponse
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                Role = u.Role.ToString(),
                MemberNumber = u.MemberNumber,
                MembershipExpiry = u.MembershipExpiry,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt
            })
            .FirstOrDefaultAsync();

        if (user == null)
        {
            return NotFound(new { message = "User account not found." });
        }

        return Ok(user);
    }

    [HttpGet]
    [Authorize(Roles = "Admin,Librarian")]
    public async Task<IActionResult> GetAllUsers()
    {
        var query = _context.Users.AsQueryable();

        if (User.IsInRole("Librarian"))
        {
            query = query.Where(u =>
                u.Role == UserRole.Member &&
                u.IsActive);
        }

        var users = await query
            .OrderBy(u => u.FullName)
            .Select(u => new UserResponse
            {
                Id = u.Id,
                FullName = u.FullName,
                Email = u.Email,
                Role = u.Role.ToString(),
                MemberNumber = u.MemberNumber,
                MembershipExpiry = u.MembershipExpiry,
                IsActive = u.IsActive,
                CreatedAt = u.CreatedAt
            })
            .ToListAsync();

        return Ok(users);
    }

    [HttpGet("staff")]
    [Authorize(Roles = "Admin,Librarian")]
    public IActionResult StaffAccess()
    {
        return Ok(new
        {
            message = "Staff access granted.",
            role = User.FindFirstValue(ClaimTypes.Role)
        });
    }

    [HttpGet("member")]
    [Authorize(Roles = "Member")]
    public IActionResult MemberAccess()
    {
        return Ok(new
        {
            message = "Member access granted.",
            role = User.FindFirstValue(ClaimTypes.Role)
        });
    }

    [HttpGet("admin")]
    [Authorize(Roles = "Admin")]
    public IActionResult AdminAccess()
    {
        return Ok(new
        {
            message = "Admin access granted.",
            role = User.FindFirstValue(ClaimTypes.Role)
        });
    }
}
