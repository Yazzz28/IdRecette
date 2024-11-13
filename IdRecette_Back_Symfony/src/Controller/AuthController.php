<?php

namespace App\Controller;

use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Lexik\Bundle\JWTAuthenticationBundle\Services\JWTTokenManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Security\Core\Exception\AuthenticationException;

class AuthController extends AbstractController
{
    public function __construct(
        private EntityManagerInterface $entityManager,
        private UserPasswordHasherInterface $passwordHasher,
        private JWTTokenManagerInterface $jwtManager
    ) {
    }

    public function __invoke(Request $request): JsonResponse
    {
        try {
            $data = json_decode($request->getContent(), true);

            if (!isset($data['email']) || !isset($data['password'])) {
                throw new AuthenticationException('Email and password are required');
            }

            $email = $data['email'];
            $password = $data['password'];

            // If registration data is provided
            if (isset($data['register']) && $data['register'] === true) {
                if (!isset($data['pseudo'])) {
                    throw new AuthenticationException('Pseudo is required for registration');
                }
                return $this->register($email, $password, $data['pseudo']);
            }

            // Otherwise, handle login
            return $this->login($email, $password);
        } catch (AuthenticationException $e) {
            return new JsonResponse(['message' => $e->getMessage()], Response::HTTP_UNAUTHORIZED);
        } catch (\Exception $e) {
            return new JsonResponse(['message' => 'An error occurred'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }
    }

    private function register(string $email, string $password, string $pseudo): JsonResponse
    {
        // Check if user already exists
        $existingUser = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $email]);
        if ($existingUser) {
            throw new AuthenticationException('User already exists');
        }

        // Create new user
        $user = new User();
        $user->setEmail($email);
        $user->setPseudo($pseudo);
        $user->setPassword($this->passwordHasher->hashPassword($user, $password));
        $user->setRoles(['ROLE_USER']);

        $this->entityManager->persist($user);
        $this->entityManager->flush();

        // Generate JWT token
        $token = $this->jwtManager->create($user);

        return new JsonResponse([
            'token' => $token,
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'pseudo' => $user->getPseudo(),
                'roles' => $user->getRoles()
            ]
        ], Response::HTTP_CREATED);
    }

    private function login(string $email, string $password): JsonResponse
    {
        // Find user by email
        $user = $this->entityManager->getRepository(User::class)->findOneBy(['email' => $email]);

        if (!$user) {
            throw new AuthenticationException('Invalid credentials');
        }

        // Verify password
        if (!$this->passwordHasher->isPasswordValid($user, $password)) {
            throw new AuthenticationException('Invalid credentials');
        }

        // Generate JWT token
        $token = $this->jwtManager->create($user);

        return new JsonResponse([
            'token' => $token,
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'pseudo' => $user->getPseudo(),
                'roles' => $user->getRoles()
            ]
        ]);
    }
}