<?php
namespace App\Models; use Illuminate\Database\Eloquent\Model;
class Appointment extends Model { protected $guarded=[]; protected $casts=['appointment_date'=>'date','total_price'=>'decimal:2']; public function services(){return $this->hasMany(AppointmentService::class);} public function barber(){return $this->belongsTo(User::class,'barber_id');} public function client(){return $this->belongsTo(User::class,'client_id');} }
