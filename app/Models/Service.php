<?php
namespace App\Models; use Illuminate\Database\Eloquent\Model;
class Service extends Model { protected $guarded=[]; protected $casts=['price'=>'decimal:2','is_active'=>'boolean']; public function addons(){return $this->hasMany(ServiceAddon::class);} public function appointmentServices(){return $this->hasMany(AppointmentService::class);} }
