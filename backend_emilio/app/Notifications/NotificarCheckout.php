<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Support\Facades\Mail;
use Illuminate\Notifications\Notification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;

class NotificarCheckout extends Notification
{
    use Queueable;
    public function via($notifiable)
    {
        return ['mail'];
    }
    public function toMail($notifiable)
    {
        // Crear el contenido del mensaje en formato de texto plano
        $messageContent = "Tu Checkout Ha Sido Completado\n\n";
        $messageContent .= "Tu proceso de checkout ha sido completado exitosamente.\n\n";
        $messageContent .= "Esperamos que hayas tenido una experiencia maravillosa con nosotros.\n\n";
        $messageContent .= "Ver Detalles del Checkout: " . "\n\n";
        $messageContent .= "¡Gracias por usar nuestro servicio!";

        // Usar Mail::raw para enviar el correo directamente
        Mail::raw($messageContent, function ($message) use ($notifiable) {
            $message->to($notifiable->correo) // Asegúrate de que el modelo notifiable tenga el atributo 'correo'
                    ->subject('Tu Checkout Ha Sido Completado');
        });

        // Retornar null ya que el correo ya se ha enviado
        return null;
    }



    /**
     * Create a new notification instance.
     */
    public function __construct()
    {
        //
    }

}
