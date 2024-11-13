<?php

namespace App\DataFixtures;

use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class AppFixtures extends Fixture
{
    private $passwordHasher;

    // Injection du service de hachage de mot de passe
    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }

    public function load(ObjectManager $manager): void
    {
        // Création de l'utilisateur
        $user = new User();
        $user->setEmail('yacinemennaa@gmail.com');
        $user->setPseudo('yazzz');
        $user->setRoles(['ROLE_USER']);

        // Hash du mot de passe
        $hashedPassword = $this->passwordHasher->hashPassword(
            $user,
            'Test1234?'
        );
        $user->setPassword($hashedPassword);

        // Persister l'utilisateur
        $manager->persist($user);

        // Enregistrer les changements
        $manager->flush();
    }
}
