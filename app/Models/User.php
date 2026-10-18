<?php
namespace App\Models;
use Illuminate\Foundation\Auth\User as Authenticatable; use Laravel\Sanctum\HasApiTokens; use Illuminate\Notifications\Notifiable;
class User extends Authenticatable { use HasApiTokens,Notifiable; protected $guarded=[]; protected $hidden=['password','remember_token']; public function profile(){return $this->hasOne(BarberProfile::class); } public function appointments(){return $this->hasMany(Appointment::class,'client_id');} public function barberAppointments(){return $this->hasMany(Appointment::class,'barber_id');} }
