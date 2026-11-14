
// ASSIGNED TO: KIM — BACKEND
// PROJECT: Library Reservation Management System Practice

using System.ComponentModel.DataAnnotations;

namespace LibraryReservationPractice.Models;

public class ReadingSpaceReservation
{
    public int Id { get; set; }

    public int UserId { get; set; }

    public int ReadingSpaceId { get; set; }

    public DateTime StartTime { get; set; }

    public DateTime EndTime { get; set; }

    public int NumberOfPeople { get; set; }

    [Required]
    [MaxLength(30)]
    public string Status { get; set; } = "Pending";

    public User? User { get; set; }

    public ReadingSpace? ReadingSpace { get; set; }
}
