
// ASSIGNED TO: KIM — BACKEND
// PROJECT: Library Reservation Management System Practice

using System.ComponentModel.DataAnnotations;

namespace LibraryReservationPractice.DTOs;

public class SeatReservationRequest
{
    [Required]
    [Range(1, int.MaxValue)]
    public int SeatId { get; set; }

    [Required]
    public DateTime StartTime { get; set; }

    [Required]
    public DateTime EndTime { get; set; }
}
