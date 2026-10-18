<?php
namespace App\Http\Controllers;
use App\Models\User; use Illuminate\Http\Request; use Illuminate\Support\Facades\Hash;
class AuthController extends Controller {
 public function register(Request $r){$d=$r->validate(['name'=>'required|string|max:255','email'=>'required|email|unique:users,email','password'=>'required|string|min:8','phone'=>'nullable|string|max:40']);$u=User::create(['name'=>$d['name'],'email'=>$d['email'],'phone'=>$d['phone']??null,'password'=>Hash::make($d['password']),'role'=>'client']);return $this->token($u);}
 public function login(Request $r){$d=$r->validate(['email'=>'required|email','password'=>'required|string']);$u=User::where('email',$d['email'])->first();if(!$u||!Hash::check($d['password'],$u->password))return response()->json(['message'=>'Identifiants invalides.'],422);return $this->token($u);}
 public function logout(Request $r){$r->user()->currentAccessToken()?->delete();return response()->json(['message'=>'Déconnecté']);}
 public function me(Request $r){return $r->user()->load('appointments.barber','appointments.services.service');}
 private function token(User $u){return response()->json(['token'=>$u->createToken('client-web')->plainTextToken,'user'=>$u]);}
}
