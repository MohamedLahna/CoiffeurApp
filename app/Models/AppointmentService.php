<?php
namespace App\Models; use Illuminate\Database\Eloquent\Model;
class AppointmentService extends Model { protected $guarded=[]; public function service(){return $this->belongsTo(Service::class);} public function addon(){return $this->belongsTo(ServiceAddon::class,'addon_id');} }
