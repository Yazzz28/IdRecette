<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Authentication;

class SecurityController extends AbstractController
{
    #[Route(path: '/api/login', name: 'api_login', methods: ['POST'])]
    public function login()
    {
        $user = $this->getUser();
        return $this->json([
            'username' => $user->getUserIdentifier(),
            'roles' => $user->getRoles(),
        ]);
    }
}