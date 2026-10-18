<?php
namespace App\Models; use Illuminate\Database\Eloquent\Model;
class ServiceAddon extends Model { protected $guarded=[]; protected $casts=['price'=>'decimal:2']; public function service(){return $this->belongsTo(Service::class);} }
