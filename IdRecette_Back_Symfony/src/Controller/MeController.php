<?php
namespace App\Controller;

use App\Entity\User;
use App\Repository\UserRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\User\UserInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Security\User\JWTUser;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class MeController extends AbstractController
{
    private UserRepository $userRepository;

    public function __construct(UserRepository $userRepository)
    {
        $this->userRepository = $userRepository;
    }

    #[Route('/api/me', methods: ['GET'])]
    public function __invoke(): JsonResponse
    {
        $user = $this->getUser();

        if ($user instanceof JWTUser) {
            $user = $this->userRepository->findOneBy(['email' => $user->getUserIdentifier()]);
        }

        if (!$user instanceof User) {
            throw new \LogicException('The logged-in user is not an instance of App\Entity\User.');
        }

        // Convertir l'utilisateur en tableau avant de le passer à JsonResponse
        $data = [
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'pseudo' => $user->getPseudo(),
            'roles' => $user->getRoles(),
            // Ajoutez d'autres champs selon vos besoins
        ];

        // Retourne les informations de l'utilisateur sous forme de réponse JSON
        return new JsonResponse($data);
    }
}
