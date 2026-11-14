
// KIM — BACKEND
using System.Security.Claims;
using LibraryReservationPractice.Data;
using LibraryReservationPractice.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LibraryReservationPractice.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SeatReservationsController : ControllerBase
{
    private readonly LibraryDbContext _context;

    public SeatReservationsController(LibraryDbContext context)
    {
        _context = context;
    }

    private int? GetUserId()
    {
        var value = User.FindFirstValue(ClaimTypes.NameIdentifier)
                    ?? User.FindFirstValue("sub")
                    ?? User.FindFirstValue("id");

        return int.TryParse(value, out var id) ? id : null;
    }

    private bool IsStaff()
    {
        return User.IsInRole("Admin") || User.IsInRole("Librarian");
    }

    [HttpGet("seats")]
    public async Task<IActionResult> GetSeats()
    {
        var seats = await _context.Seats
            .AsNoTracking()
            .Where(s => s.IsActive)
            .OrderBy(s => s.SeatNumber)
            .ToListAsync();

        return Ok(seats);
    }

    [HttpGet]
    public async Task<IActionResult> GetReservations()
    {
        var userId = GetUserId();

        if (userId == null)
            return Unauthorized();

        var query = _context.SeatReservations
            .Include(r => r.Seat)
            .AsNoTracking()
            .AsQueryable();

        if (!IsStaff())
            query = query.Where(r => r.UserId == userId.Value);

        var reservations = await query
            .OrderByDescending(r => r.StartTime)
            .ToListAsync();

        return Ok(reservations);
    }

    [HttpGet("availability")]
    public async Task<IActionResult> GetAvailableSeats(
        [FromQuery] DateTime startTime,
        [FromQuery] DateTime endTime)
    {
        if (startTime >= endTime)
            return BadRequest(new { message = "Invalid reservation time." });

        var availableSeats = await _context.Seats
            .Where(s => s.IsActive &&
                !_context.SeatReservations.Any(r =>
                    r.SeatId == s.Id &&
                    (r.Status == "Pending" || r.Status == "Approved") &&
                    r.StartTime < endTime &&
                    r.EndTime > startTime))
            .OrderBy(s => s.SeatNumber)
            .ToListAsync();

        return Ok(availableSeats);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetReservation(int id)
    {
        var userId = GetUserId();

        if (userId == null)
            return Unauthorized();

        var reservation = await _context.SeatReservations
            .Include(r => r.Seat)
            .AsNoTracking()
            .FirstOrDefaultAsync(r => r.Id == id);

        if (reservation == null)
            return NotFound();

        if (!IsStaff() && reservation.UserId != userId.Value)
            return Forbid();

        return Ok(reservation);
    }

    [HttpPost]
    [Authorize(Roles = "Member")]
    public async Task<IActionResult> CreateReservation(
        [FromBody] CreateSeatReservationRequest request)
    {
        var userId = GetUserId();

        if (userId == null)
            return Unauthorized();

        if (request.StartTime >= request.EndTime)
            return BadRequest(new { message = "End time must be later than start time." });

        if (request.StartTime <= DateTime.Now)
            return BadRequest(new { message = "Reservation must be in the future." });

        var seat = await _context.Seats
            .FirstOrDefaultAsync(s => s.Id == request.SeatId && s.IsActive);

        if (seat == null)
            return NotFound(new { message = "Seat not found or inactive." });

        var conflict = await _context.SeatReservations.AnyAsync(r =>
            r.SeatId == request.SeatId &&
            (r.Status == "Pending" || r.Status == "Approved") &&
            r.StartTime < request.EndTime &&
            r.EndTime > request.StartTime);

        if (conflict)
            return Conflict(new { message = "Seat is already reserved for this schedule." });

        var reservation = new SeatReservation
        {
            UserId = userId.Value,
            SeatId = request.SeatId,
            StartTime = request.StartTime,
            EndTime = request.EndTime,
            Status = "Pending"
        };

        _context.SeatReservations.Add(reservation);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetReservation),
            new { id = reservation.Id },
            reservation);
    }

    [HttpPut("{id:int}/cancel")]
    public async Task<IActionResult> CancelReservation(int id)
    {
        var userId = GetUserId();

        if (userId == null)
            return Unauthorized();

        var reservation = await _context.SeatReservations
            .FirstOrDefaultAsync(r => r.Id == id);

        if (reservation == null)
            return NotFound();

        if (!IsStaff() && reservation.UserId != userId.Value)
            return Forbid();

        if (reservation.Status != "Pending")
            return BadRequest(new { message = "Only pending reservations can be cancelled." });

        reservation.Status = "Cancelled";

        await _context.SaveChangesAsync();

        return Ok(new
        {
            message = "Reservation cancelled successfully.",
            reservation.Id,
            reservation.Status
        });
    }
}

public class CreateSeatReservationRequest
{
    public int SeatId { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
}
