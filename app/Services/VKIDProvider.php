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
     * Raw response body from VK ID token endpoint.
     *
     * @var array
     */
    protected $credentialsResponseBody = [];

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
        return 'https://id.vk.com/oauth2/auth';
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

        $deviceId = session()->get('vk_device_id');
        if ($deviceId) {
            $fields['device_id'] = $deviceId;
        }

        // VK ID использует code_v2
        if ($this->request->has('type')) {
            $fields['type'] = $this->request->input('type');
        }

        return $fields;
    }

    /**
     * Get the access token response from the token URL.
     *
     * @param  string  $code
     * @return array
     *
     * @throws \Exception
     */
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

    /**
     * {@inheritdoc}
     */
    public function user()
    {
        if ($this->hasInvalidState()) {
            throw new InvalidStateException;
        }

        $response = $this->getAccessTokenResponse($this->getCode());
        $this->credentialsResponseBody = $response;

        $token = $this->parseAccessToken($response);

        Log::info('VK ID parsed token', ['token' => $token]);

        // VK ID возвращает данные пользователя прямо в ответе токена
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
     * Get the raw user for the given access token.
     *
     * VK ID возвращает данные пользователя прямо в ответе /oauth2/auth,
     * поэтому используем их. При необходимости делаем запрос к user_info.
     *
     * @param  string  $token
     * @return array
     */
    protected function getUserByToken($token)
    {
        // VK ID возвращает user_id, email, first_name, last_name прямо в ответе токена
        $data = [
            'user_id' => $this->credentialsResponseBody['user_id']
                ?? $this->credentialsResponseBody['id']
                ?? null,
            'email' => $this->credentialsResponseBody['email'] ?? null,
            'first_name' => $this->credentialsResponseBody['first_name'] ?? null,
            'last_name' => $this->credentialsResponseBody['last_name'] ?? null,
            'avatar' => $this->credentialsResponseBody['avatar'] ?? null,
        ];

        // Если user_id есть, пробуем получить доп. данные через user_info
        if (! empty($data['user_id']) && ! empty($token)) {
            try {
                $response = $this->getHttpClient()->post('https://id.vk.com/oauth2/user_info', [
                    'headers' => [
                        'Authorization' => 'Bearer '.$token,
                    ],
                ]);

                $body = json_decode((string) $response->getBody(), true);
                $userInfo = $body['user'] ?? $body['response'] ?? $body ?? [];

                // Мержим данные, отдавая приоритет user_info
                $data = array_merge($data, $userInfo);
            } catch (\Exception $e) {
                Log::warning('VK ID user_info failed', ['error' => $e->getMessage()]);
            }
        }

        return $data;
    }

    /**
     * Get the access token from the token response body.
     *
     * @param  array  $body
     * @return string
     */
    protected function parseAccessToken($body)
    {
        return Arr::get($body, 'access_token')
            ?? Arr::get($body, 'token')
            ?? Arr::get($body, 'silent_token')
            ?? '';
    }

    /**
     * Get the refresh token from the token response body.
     *
     * @param  array  $body
     * @return string|null
     */
    protected function parseRefreshToken($body)
    {
        return Arr::get($body, 'refresh_token') ?? null;
    }

    /**
     * Get the expires in from the token response body.
     *
     * @param  array  $body
     * @return string|null
     */
    protected function parseExpiresIn($body)
    {
        return Arr::get($body, 'expires_in') ?? null;
    }

    /**
     * Map the raw user array to a Socialite User instance.
     *
     * @param  array  $user
     * @return \Laravel\Socialite\Two\User
     */
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
