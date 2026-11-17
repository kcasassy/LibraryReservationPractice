
// ASSIGNED TO: KIM — BACKEND
// PROJECT: Library Reservation Management System Practice

using System.ComponentModel.DataAnnotations;

namespace LibraryReservationPractice.DTOs;

public class QcplExternalReservationStatusRequest
{
    [Required]
    [MaxLength(50)]
    public string ReservationStatus { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Notes { get; set; }
}
