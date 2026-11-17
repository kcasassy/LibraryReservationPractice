
// ASSIGNED TO: KIM — BACKEND
// PROJECT: Library Reservation Management System Practice

namespace LibraryReservationPractice.DTOs;

public class ReadingSpaceResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public int Capacity { get; set; }
    public bool IsActive { get; set; }
}
