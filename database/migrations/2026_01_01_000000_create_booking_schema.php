<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
return new class extends Migration {
 public function up(): void {
  Schema::create('users', function(Blueprint $t){$t->id();$t->string('name');$t->string('email',191)->unique();$t->string('phone')->nullable();$t->string('password');$t->enum('role',['admin','barber','client'])->default('client');$t->unsignedInteger('loyalty_points')->default(0);$t->timestamps();});
  Schema::create('barber_profiles', function(Blueprint $t){$t->id();$t->foreignId('user_id')->unique()->constrained()->cascadeOnDelete();$t->text('bio')->nullable();$t->string('photo_url')->nullable();$t->decimal('rating',3,2)->default(5);$t->boolean('is_active')->default(true);$t->timestamps();});
  Schema::create('services', function(Blueprint $t){$t->id();$t->string('name');$t->text('description')->nullable();$t->unsignedSmallInteger('duration_minutes');$t->decimal('price',8,2);$t->string('category')->nullable();$t->string('image_url')->nullable();$t->boolean('is_active')->default(true);$t->timestamps();});
  Schema::create('service_addons', function(Blueprint $t){$t->id();$t->foreignId('service_id')->constrained()->cascadeOnDelete();$t->string('name');$t->unsignedSmallInteger('duration_minutes');$t->decimal('price',8,2);$t->timestamps();});
  Schema::create('schedules', function(Blueprint $t){$t->id();$t->foreignId('barber_id')->constrained('users')->cascadeOnDelete();$t->unsignedTinyInteger('day_of_week');$t->time('start_time');$t->time('end_time');$t->time('break_start')->nullable();$t->time('break_end')->nullable();$t->unique(['barber_id','day_of_week']);$t->timestamps();});
  Schema::create('appointments', function(Blueprint $t){$t->id();$t->foreignId('client_id')->constrained('users')->cascadeOnDelete();$t->foreignId('barber_id')->constrained('users')->cascadeOnDelete();$t->date('appointment_date');$t->time('start_time');$t->time('end_time');$t->decimal('total_price',8,2);$t->enum('status',['pending','confirmed','cancelled','completed'])->default('pending');$t->timestamps();$t->index(['barber_id','appointment_date','status']);});
  Schema::create('appointment_services', function(Blueprint $t){$t->id();$t->foreignId('appointment_id')->constrained()->cascadeOnDelete();$t->foreignId('service_id')->constrained();$t->foreignId('addon_id')->nullable()->constrained('service_addons')->nullOnDelete();$t->timestamps();});
  Schema::create('reviews', function(Blueprint $t){$t->id();$t->foreignId('appointment_id')->unique()->constrained()->cascadeOnDelete();$t->foreignId('client_id')->constrained('users')->cascadeOnDelete();$t->foreignId('barber_id')->constrained('users')->cascadeOnDelete();$t->unsignedTinyInteger('rating');$t->text('comment')->nullable();$t->timestamps();});
 }
 public function down(): void { foreach(['reviews','appointment_services','appointments','schedules','service_addons','services','barber_profiles','users'] as $table) Schema::dropIfExists($table); }
};
