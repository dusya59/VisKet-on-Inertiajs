<?php

namespace App\Services;

use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;
use Laravel\Socialite\Two\AbstractProvider;
use Laravel\Socialite\Two\InvalidStateException;
use Laravel\Socialite\Two\ProviderInterface;
use Laravel\Socialite\Two\User;

class VKIDProvider extends AbstractProvider implements ProviderInterface
{
    protected $scopes = ['email'];
    protected $scopeSeparator = ' ';
    protected $usesPKCE = true;
    protected $credentialsResponseBody = [];

    protected function getAuthUrl($state)
    {
        return $this->buildAuthUrlFromBase('https://id.vk.com/authorize', $state);
    }

    protected function getCodeFields($state = null)
    {
        $fields = parent::getCodeFields($state);

        $deviceId = session()->get('vk_device_id');
        if ($deviceId) {
            $fields['device_id'] = $deviceId;
        }

        return $fields;
    }

    protected function getTokenUrl()
    {
        return 'https://id.vk.com/oauth2/auth';
    }

    protected function getTokenFields($code)
    {
        $fields = parent::getTokenFields($code);

        $deviceId = $this->request->input('device_id') ?? session()->get('vk_device_id');
        if ($deviceId) {
            $fields['device_id'] = $deviceId;
        }

        if ($this->request->has('type')) {
            $fields['type'] = $this->request->input('type');
        }

        return $fields;
    }

    public function getAccessTokenResponse($code)
    {
        $fields = $this->getTokenFields($code);

        Log::info('VK ID token request', [
            'url' => $this->getTokenUrl(),
            'client_id' => $fields['client_id'] ?? null,
            'has_code' => ! empty($fields['code']),
            'has_device_id' => ! empty($fields['device_id']),
        ]);

        $response = $this->getHttpClient()->post($this->getTokenUrl(), [
            'headers' => ['Accept' => 'application/json'],
            'form_params' => $fields,
        ]);

        $body = json_decode((string) $response->getBody(), true);

        Log::info('VK ID token raw response', [
            'status' => $response->getStatusCode(),
            'has_access_token' => ! empty($body['access_token']),
            'has_user_id' => ! empty($body['user_id']),
            'error' => $body['error'] ?? null,
        ]);

        if (isset($body['error'])) {
            throw new \Exception('VK ID error: '.($body['error_description'] ?? $body['error']));
        }

        return $body;
    }

    public function user()
    {
        if ($this->hasInvalidState()) {
            throw new InvalidStateException;
        }

        $response = $this->getAccessTokenResponse($this->getCode());
        $this->credentialsResponseBody = $response;

        $token = $this->parseAccessToken($response);

        $userData = $this->getUserByToken($token);

        Log::info('VK ID user data', ['data' => $userData]);

        $user = $this->mapUserToObject($userData);

        return $user->setToken($token)
            ->setRefreshToken($this->parseRefreshToken($response))
            ->setExpiresIn($this->parseExpiresIn($response));
    }

    protected function getUserByToken($token)
    {
        $response = $this->getHttpClient()->post('https://id.vk.com/oauth2/user_info', [
            'headers' => ['Accept' => 'application/json'],
            'form_params' => [
                'client_id'    => $this->clientId,
                'access_token' => $token,
            ],
        ]);

        $body = json_decode((string) $response->getBody(), true);

        Log::info('VK ID user_info response', ['body' => $body]);

        // VK ID возвращает профиль внутри ключа "user"
        $user = $body['user'] ?? [];

        return [
            'user_id'    => $user['user_id']
                ?? ($this->credentialsResponseBody['user_id'] ?? null),
            'email'      => $user['email'] ?? null,
            'first_name' => $user['first_name'] ?? null,
            'last_name'  => $user['last_name'] ?? null,
            'avatar'     => $user['avatar'] ?? null,
        ];
    }

    protected function parseAccessToken($body)
    {
        return Arr::get($body, 'access_token')
            ?? Arr::get($body, 'token')
            ?? Arr::get($body, 'silent_token')
            ?? '';
    }

    protected function parseRefreshToken($body)
    {
        return Arr::get($body, 'refresh_token') ?? null;
    }

    protected function parseExpiresIn($body)
    {
        return Arr::get($body, 'expires_in') ?? null;
    }

    protected function mapUserToObject(array $user)
    {
        $id = Arr::get($user, 'user_id')
            ?? Arr::get($user, 'id')
            ?? Arr::get($user, 'uuid')
            ?? Arr::get($user, 'user')
            ?? null;

        $firstName = Arr::get($user, 'first_name') ?? '';
        $lastName = Arr::get($user, 'last_name') ?? '';
        $name = trim($firstName.' '.$lastName);
        if (empty($name)) {
            $name = Arr::get($user, 'name') ?? Arr::get($user, 'display_name') ?? 'VK User';
        }

        return (new User)->setRaw($user)->map([
            'id' => $id,
            'nickname' => Arr::get($user, 'nickname') ?? Arr::get($user, 'screen_name'),
            'name' => $name,
            'email' => Arr::get($user, 'email'),
            'avatar' => Arr::get($user, 'avatar') ?? Arr::get($user, 'photo_200'),
        ]);
    }
}
