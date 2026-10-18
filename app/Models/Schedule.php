<?php
namespace App\Models; use Illuminate\Database\Eloquent\Model;
class Schedule extends Model { protected $guarded=[]; public function barber(){return $this->belongsTo(User::class,'barber_id');} }
