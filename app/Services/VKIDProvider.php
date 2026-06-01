<?php

namespace App\Services;

use Illuminate\Support\Arr;
use Laravel\Socialite\Two\AbstractProvider;
use Laravel\Socialite\Two\ProviderInterface;
use Laravel\Socialite\Two\User;

class VKIDProvider extends AbstractProvider implements ProviderInterface
{
    /**
     * The scopes being requested.
     *
     * @var array
     */
    protected $scopes = ['email'];

    /**
     * The separating character for the requested scopes.
     *
     * @var string
     */
    protected $scopeSeparator = ' ';

    /**
     * Indicates if PKCE should be used.
     *
     * @var bool
     */
    protected $usesPKCE = true;

    /**
     * Get the authentication URL for the provider.
     *
     * @param  string  $state
     * @return string
     */
    protected function getAuthUrl($state)
    {
        return $this->buildAuthUrlFromBase('https://id.vk.com/authorize', $state);
    }

    /**
     * Get the GET parameters for the authorization URL.
     *
     * @param  string|null  $state
     * @return array
     */
    protected function getCodeFields($state = null)
    {
        $fields = parent::getCodeFields($state);

        // VK ID требует device_id в запросе авторизации
        $deviceId = session()->get('vk_device_id');
        if ($deviceId) {
            $fields['device_id'] = $deviceId;
        }

        return $fields;
    }

    /**
     * Get the token URL for the provider.
     *
     * @return string
     */
    protected function getTokenUrl()
    {
        return 'https://id.vk.com/oauth2/token';
    }

    /**
     * Get the POST fields for the token request.
     *
     * @param  string  $code
     * @return array
     */
    protected function getTokenFields($code)
    {
        $fields = parent::getTokenFields($code);

        // VK ID требует device_id
        $deviceId = session()->get('vk_device_id');
        if ($deviceId) {
            $fields['device_id'] = $deviceId;
        }

        return $fields;
    }

    /**
     * Get the raw user for the given access token.
     *
     * @param  string  $token
     * @return array
     */
    protected function getUserByToken($token)
    {
        $response = $this->getHttpClient()->post('https://id.vk.com/oauth2/user_info', [
            'headers' => [
                'Authorization' => 'Bearer '.$token,
            ],
        ]);

        $body = json_decode((string) $response->getBody(), true);

        // VK ID возвращает user_info внутри response или на верхнем уровне
        return $body['response'] ?? $body ?? [];
    }

    /**
     * Map the raw user array to a Socialite User instance.
     *
     * @param  array  $user
     * @return \Laravel\Socialite\Two\User
     */
    protected function mapUserToObject(array $user)
    {
        return (new User)->setRaw($user)->map([
            'id' => Arr::get($user, 'user_id'),
            'nickname' => Arr::get($user, 'nickname'),
            'name' => trim(Arr::get($user, 'first_name', '').' '.Arr::get($user, 'last_name', '')),
            'email' => Arr::get($user, 'email'),
            'avatar' => Arr::get($user, 'avatar'),
        ]);
    }
}
