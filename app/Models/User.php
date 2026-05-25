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
    use HasApiTokens, HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name', 'email', 'password', 'avatar', 'aboutme', 'rating', 'balance', 'phone', 'is_verified',
        'verification_attempts',
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

    public function posts()
    {
        return $this->hasMany(Post::class);
    }

    public function likes()
    {
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

    public function chats()
    {
        return $this->belongsToMany(Chat::class);
    }

    public function messages()
    {
        return $this->hasMany(Message::class);
    }

    public function skills()
    {
        return $this->belongsToMany(Skill::class, 'user_skills')->withPivot('level');
    }

    public function reviewsGiven()
    {
        return $this->hasMany(Review::class, 'reviewer_id');
    }

    public function reviewsReceived()
    {
        return $this->hasMany(Review::class, 'reviewed_id');
    }

    public function transactions()
    {
        return $this->hasMany(Transaction::class, 'to_user_id');
    }

    public function pendingTransactions()
    {
        return $this->hasMany(Transaction::class, 'to_user_id')->where('status', 'pending');
    }

    public function hasPendingTransactions(): bool
    {
        return $this->pendingTransactions()->exists();
    }

    public function disputes()
    {
        return $this->hasMany(Dispute::class, 'initiator_id');
    }

    public function disputesManaged()
    {
        return $this->hasMany(Dispute::class, 'admin_id');
    }

    public function applications()
    {
        return $this->hasMany(Application::class);
    }

    public function vacancies()
    {
        return $this->hasMany(Vacancy::class);
    }

    public function verificationRejections()
    {
        return $this->hasMany(VerificationRejection::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function unreadNotifications()
    {
        return $this->hasMany(Notification::class)->where('is_read', false);
    }

    public function reports()
    {
        return $this->hasMany(Report::class, 'reported_user_id');
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    public function socialAccounts()
    {
        return $this->hasMany(SocialAccount::class);
    }

    public function hasSocialAccount(string $provider): bool
    {
        return $this->socialAccounts()->where('provider', $provider)->exists();
    }

    public function receiveBroadcastNotificationsOn(): string
    {
        return 'users.'.$this->id;
    }
}
