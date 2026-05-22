<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserArchive extends Model
{
    protected $table = 'user_archives';
    
    protected $fillable = [
        'original_user_id',
        'name',
        'email',
        'password',
        'role',
        'phone',
        'address',
        'avatar',
        'is_blocked',
        'metadata',
        'archived_at',
        'archived_by',
        'reason',
    ];

    protected $casts = [
        'is_blocked' => 'boolean',
        'metadata' => 'array',
        'archived_at' => 'datetime',
    ];

    protected $hidden = ['password'];
}
