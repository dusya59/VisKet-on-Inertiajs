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
            'fields' => $fields,
        ]);

        $response = $this->getHttpClient()->post($this->getTokenUrl(), [
            'headers' => ['Accept' => 'application/json'],
            'form_params' => $fields,
        ]);

        $body = json_decode((string) $response->getBody(), true);

        Log::info('VK ID token raw response', [
            'status' => $response->getStatusCode(),
            'body' => $body,
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

        Log::info('VK ID parsed token', ['token' => substr($token, 0, 50).'...']);

        $userData = $this->getUserByToken($token);

        Log::info('VK ID user data', ['data' => $userData]);

        $user = $this->mapUserToObject($userData);

        if ($user instanceof User) {
            $user->setAccessTokenResponseBody($this->credentialsResponseBody);
        }

        return $user->setToken($token)
            ->setRefreshToken($this->parseRefreshToken($response))
            ->setExpiresIn($this->parseExpiresIn($response));
    }

    /**
     * Parse JWT payload from id_token returned by VK ID.
     */
    protected function parseJwtPayload(string $token): array
    {
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            return [];
        }

        $payload = base64_decode(strtr($parts[1], '-_', '+/'));
        if ($payload === false) {
            return [];
        }

        return json_decode($payload, true) ?? [];
    }

    protected function getUserByToken($token)
    {
        // VK ID возвращает данные пользователя в id_token (JWT)
        $idToken = $this->credentialsResponseBody['id_token'] ?? null;
        $jwtData = $idToken ? $this->parseJwtPayload($idToken) : [];

        Log::info('VK ID JWT payload', ['jwt' => $jwtData]);

        return [
            'user_id' => $this->credentialsResponseBody['user_id']
                ?? ($jwtData['sub'] ?? null),
            'email' => $jwtData['email'] ?? null,
            'first_name' => $jwtData['first_name'] ?? null,
            'last_name' => $jwtData['last_name'] ?? null,
            'avatar' => $jwtData['avatar'] ?? null,
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
