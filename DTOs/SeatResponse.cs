
// ASSIGNED TO: KIM — BACKEND
// PROJECT: Library Reservation Management System Practice

namespace LibraryReservationPractice.DTOs;

public class SeatResponse
{
    public int Id { get; set; }
    public string SeatNumber { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}
