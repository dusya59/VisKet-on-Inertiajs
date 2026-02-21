<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
/**
 * @method bool update(array $attributes = [], array $options = [])
 */
class User extends Authenticatable
{
    use HasFactory, Notifiable, HasApiTokens;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name', 'email', 'password', 'avatar', 'aboutme'
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    public function posts() {
        return $this->hasMany(Post::class);
    }
    
    public function likes() {
        return $this->hasMany(Like::class);
    }
    
    public function following()
    {
        return $this->belongsToMany(User::class, 'subscriptions', 'user_id', 'following_id');
    }

    public function followers()
    {
        return $this->belongsToMany(User::class, 'subscriptions', 'following_id', 'user_id');
    }

    public function isSubscribedTo(User $user)
    {
        return $this->following()->where('following_id', $user->id)->exists();
    }

    public function chats(){
    return $this->belongsToMany(Chat::class);
    }   

    public function messages(){
    return $this->hasMany(Message::class);
    }
}
