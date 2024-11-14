<?php

namespace App\Security;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;
use Symfony\Component\Security\Http\Authenticator\AbstractAuthenticator;
use Symfony\Component\Security\Http\Authenticator\Passport\Badge\UserBadge;
use Symfony\Component\Security\Http\Authenticator\Passport\Passport;
use Symfony\Component\Security\Http\Authenticator\Passport\SelfValidatingPassport;

class Authenticator extends AbstractAuthenticator
{
    /**
     * Décide si cet authentificateur doit être utilisé pour la requête.
     */
    public function supports(Request $request): ?bool
    {
        // Vérifie si le header 'X-AUTH-TOKEN' est présent
        return $request->headers->has('X-AUTH-TOKEN');
    }

    /**
     * Récupère le jeton API et tente de l'authentifier.
     */
    public function authenticate(Request $request): Passport
    {
        // Récupère le jeton API depuis les headers
        $apiToken = $request->headers->get('X-AUTH-TOKEN');

        // Si le jeton n'est pas fourni, l'authentification échoue
        if (null === $apiToken) {
            throw new CustomUserMessageAuthenticationException('Aucun jeton API fourni');
        }

        $userIdentifier = $this->getUserFromApiToken($apiToken);

        // Si l'utilisateur n'est pas trouvé, l'authentification échoue
        if (!$userIdentifier) {
            throw new CustomUserMessageAuthenticationException('Jeton API invalide');
        }

        // Retourne un passeport valide avec l'identifiant de l'utilisateur
        return new SelfValidatingPassport(new UserBadge($userIdentifier));
    }

    /**
     * Appelé en cas de succès de l'authentification.
     */
    public function onAuthenticationSuccess(Request $request, TokenInterface $token, string $firewallName): ?Response
    {
        // En cas de succès, laissez la requête continuer
        return null;
    }

    /**
     * Appelé en cas d'échec de l'authentification.
     */
    public function onAuthenticationFailure(Request $request, AuthenticationException $exception): ?Response
    {
        // Données de la réponse en cas d'échec
        $data = [
            'message' => strtr($exception->getMessageKey(), $exception->getMessageData()),
        ];

        // Retourne une réponse JSON avec un code HTTP 401 Unauthorized
        return new JsonResponse($data, Response::HTTP_UNAUTHORIZED);
    }

    /**
     * Appelé lorsqu'une authentification est requise mais non fournie.
     * (Par exemple, lorsqu'un utilisateur anonyme accède à une page protégée).
     */
    public function start(Request $request, AuthenticationException $authException = null): Response
    {
        // Retourne une réponse demandant l'authentification
        return new JsonResponse(['message' => 'Authentification requise'], Response::HTTP_UNAUTHORIZED);
    }

    /**
     * Exemple de méthode pour valider et récupérer l'utilisateur à partir d'un jeton API.
     * Vous pouvez la personnaliser selon vos besoins (par exemple, en faisant une requête
     * à une base de données pour valider le jeton).
     */
    private function getUserFromApiToken(string $apiToken): ?string
    {
        // Exemple : validation du jeton et récupération de l'identifiant utilisateur
        // (logique personnalisée à implémenter, comme une requête dans une base de données)
        $validToken = 'your_valid_api_token'; // Exemple d'un jeton valide

        if ($apiToken === $validToken) {
            return 'user_identifier'; // Retourne l'identifiant de l'utilisateur
        }

        // Retourne null si le jeton est invalide
        return null;
    }
}
