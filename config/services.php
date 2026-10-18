<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'google' => [
        'client_id' => env('GOOGLE_CLIENT_ID'),
        'admin_email' => env('ADMIN_GOOGLE_EMAIL'),
        'ca_bundle' => env('GOOGLE_CA_BUNDLE'),
    ],

    'libretranslate' => [
        'url' => env('LIBRETRANSLATE_URL', 'http://127.0.0.1:5000/translate'),
        'api_key' => env('LIBRETRANSLATE_API_KEY'),
    ],

    'mymemory' => [
        'url' => env('MYMEMORY_TRANSLATION_URL', 'https://api.mymemory.translated.net/get'),
        'contact_email' => env('TRANSLATION_CONTACT_EMAIL'),
    ],

];
