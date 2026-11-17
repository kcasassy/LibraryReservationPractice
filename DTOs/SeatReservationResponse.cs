
// ASSIGNED TO: KIM — BACKEND
// PROJECT: Library Reservation Management System Practice

namespace LibraryReservationPractice.DTOs;

public class SeatReservationResponse
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string? MemberName { get; set; }
    public int SeatId { get; set; }
    public string? SeatNumber { get; set; }
    public string? Location { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public string Status { get; set; } = string.Empty;
}
