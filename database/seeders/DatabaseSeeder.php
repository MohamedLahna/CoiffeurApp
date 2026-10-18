<?php
namespace Database\Seeders;
use Illuminate\Database\Seeder; use App\Models\{User,Service,BarberProfile,Schedule}; use Illuminate\Support\Facades\Hash;
class DatabaseSeeder extends Seeder {
 public function run(): void {
  User::create(['name'=>'Atelier Admin','email'=>'admin@atelier-noir.test','password'=>Hash::make('password'),'role'=>'admin']);
  foreach([['Yanis El Amrani','yanis@atelier-noir.test'],['Léa Benali','lea@atelier-noir.test'],['Adam Rahmani','adam@atelier-noir.test']] as [$name,$email]) { $user=User::create(['name'=>$name,'email'=>$email,'password'=>Hash::make('password'),'role'=>'barber']); BarberProfile::create(['user_id'=>$user->id,'bio'=>'Artisan barber at Atelier Noir','rating'=>4.9]); for($day=1;$day<=6;$day++) Schedule::create(['barber_id'=>$user->id,'day_of_week'=>$day,'start_time'=>'09:00','end_time'=>'19:00','break_start'=>'13:00','break_end'=>'14:00']); }
  foreach([['Signature Cut','Coupe sur mesure, consultation et finition au rasoir.',45,35],['Royal Shave','Serviette chaude, soin de la peau et rasage traditionnel.',30,28],['Cut & Beard','L’expérience complète pour un style parfaitement équilibré.',75,55]] as [$name,$description,$minutes,$price]) Service::create(['name'=>$name,'description'=>$description,'duration_minutes'=>$minutes,'price'=>$price,'category'=>'Signature']);
 }
}
