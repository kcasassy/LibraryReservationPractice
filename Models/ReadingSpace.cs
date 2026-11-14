
// ASSIGNED TO: KIM — BACKEND
// PROJECT: Library Reservation Management System Practice

using System.ComponentModel.DataAnnotations;

namespace LibraryReservationPractice.Models;

public class ReadingSpace
{
    public int Id { get; set; }

    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(150)]
    public string Location { get; set; } = string.Empty;

    public int Capacity { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<ReadingSpaceReservation> Reservations { get; set; } = new List<ReadingSpaceReservation>();
}
